import Anthropic from "@anthropic-ai/sdk";
import type { IAbility } from "@/models/Ability";
import type { ICatAlien, IResistances } from "@/models/CatAliens";
import { debug, info, warn, error as logError } from "@/lib/logger";
import { ICat } from "@/models/Cats";

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 30000,
      maxRetries: 0,
    })
  : null;

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  requestId?: string
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (error instanceof ValidationError) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;

        warn("Retrying API call due to error", {
          requestId,
          attempt: attempt + 1,
          maxRetries,
          delay,
          error: (error as Error).message,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

function getMockDescription(
  cat: Pick<ICatAlien, "physicalTraits" | "stats" | "resistances" | "behavior">,
  abilities: IAbility[]
): string {
  const { physicalTraits, stats, behavior } = cat;

  const sizeDescriptor = physicalTraits.size;
  const eyeCount = physicalTraits.eyes;
  const unusualTrait =
    physicalTraits.wings > 0
      ? `${physicalTraits.wings} functional wings`
      : physicalTraits.tails > 1
        ? `${physicalTraits.tails} tails`
        : physicalTraits.legs === 0
          ? "no legs"
          : physicalTraits.eyes > 2
            ? `${physicalTraits.eyes} eyes`
            : "standard feline morphology";

  const behaviorTrait =
    behavior.aggression >= 8
      ? "extreme aggression"
      : behavior.chaos >= 8
        ? "chaotic"
        : behavior.curiosity >= 8
          ? "highly curious"
          : behavior.loyalty >= 8
            ? "loyal"
            : "unpredictable behavioral";

  const abilityMention =
    abilities.length > 0
      ? ` Demonstrates ${abilities[0].name} capability.`
      : ` Currently exhibiting ${behaviorTrait} tendencies.`;

  return `A ${sizeDescriptor} specimen with ${unusualTrait} exhibiting traces of extraterrestrial chromosomal integration.${abilityMention}`;
}

function validateDescription(data: string): string {
  if (typeof data !== "string") {
    throw new ValidationError("Description must be a string");
  }

  const trimmed = data.trim();

  if (trimmed.length === 0) {
    throw new ValidationError("Description cannot be empty");
  }

  if (trimmed.length > 1000) {
    throw new ValidationError(
      "Description exceeds maximum length of 1000 characters"
    );
  }

  const sentences = trimmed
    .split(/\.(?!\d)/)
    .filter((s) => s.trim().length > 0);

  if (sentences.length !== 2) {
    throw new ValidationError(
      `Description must be exactly 2 sentences, got ${sentences.length}`
    );
  }

  return trimmed;
}

/**
 * Generates a two-sentence description for a cat specimen using AI.
 *
 * The description maintains a serious, clinical tone while describing
 * the cat's physical traits, abilities, and behavioral characteristics.
 *
 * @param cat - Partial cat object containing traits, stats, resistances, and behavior
 * @param abilities - Array of abilities granted to the cat
 * @param requestId - Optional request ID for logging and tracing
 * @returns Promise resolving to a two-sentence description
 * @throws {ValidationError} If response format is invalid
 * @throws {Error} If API call fails after all retries
 */
export async function generateDescription(
  cat: Pick<ICat | ICatAlien, "physicalTraits" | "stats" | "behavior"> & {
    resistances?: IResistances;
    type: "cat" | "cat-alien" | "alien";
  },
  abilities: IAbility[],
  requestId?: string
): Promise<string> {
  const startTime = Date.now();

  info("Starting cat description generation", {
    requestId,
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    hasAbilities: abilities.length > 0,
    abilityCount: abilities.length,
  });

  try {
    const description = await retryWithBackoff(
      async () => {
        const { physicalTraits, stats, resistances, behavior } = cat;

        const abilityText =
          abilities.length > 0
            ? abilities.map((a) => `- ${a.name}: ${a.description} `).join("\n")
            : "None";

        const isCat = cat.type === "cat";
        const isAlien = cat.type === "alien";

        const prompt = isCat
          ? `
ROLE:
You are a feline behavioral assessment system generating specimen records
for domesticated cat behavioral monitoring and welfare optimization.

Your purpose is to produce clinical assessments of standard feline specimens
while documenting their positive behavioral characteristics and companionship metrics.

STYLE RULES:
- Clinical and scientific tone
- Emotionless, detached, and observational
- Describe positive traits and optimal behaviors clinically
- No humor, jokes, or overly whimsical phrasing
- No dramatic storytelling
- Use precise behavioral and ethological terminology
- Frame all observations positively (aggression = "assertiveness", chaos = "spontaneity")

OUTPUT RULES:
- Output EXACTLY two sentences.
- Output plain text only.
- Do NOT include headings, labels, bullet points, or formatting.
- Do NOT include numeric values or score references.
- Do NOT restate raw trait data.
- Infer positive behavioral patterns from the data.

--------------------------------
SPECIMEN DATA
--------------------------------

PHYSICAL TRAITS
Eyes: ${physicalTraits.eyes}
Legs: ${physicalTraits.legs}
Tails: ${physicalTraits.tails}
Skin Type: ${physicalTraits.skinType}
Size: ${physicalTraits.size}
Color: ${physicalTraits.colour}
Claws Present: ${physicalTraits.hasClaws}
Fangs Present: ${physicalTraits.hasFangs}

STATS
Strength: ${stats.strength}
Agility: ${stats.agility}
Endurance: ${stats.endurance}
Intelligence: ${stats.intelligence}
Perception: ${stats.perception}

BEHAVIORAL TENDENCIES
Aggression: ${behavior.aggression}
Curiosity: ${behavior.curiosity}
Loyalty: ${behavior.loyalty}
Chaos: ${behavior.chaos}

ABILITIES
${abilityText}

BASELINE SPECIMEN DIRECTIVE:
This organism is a standard domesticated feline specimen.
Describe positive behavioral traits, companionship quality,
affection responses, play engagement, and optimal interaction protocols.

TASK:
Produce a two-sentence behavioral assessment describing:
- temperament and affection metrics
- cognitive engagement and curiosity levels
- social bonding indicators
- optimal handling and enrichment protocols
- companionship value and welfare status
`
          :  isAlien
          ? `
ROLE:
You are a xenobiological archive system documenting specimens from 
extraterrestrial origins for deep space research protocols.

Your purpose is to produce clinical assessments of pure alien organisms
while emphasizing their non-terrestrial biology and incomprehensible adaptations.

STYLE RULES:
- Clinical xenobiological tone
- Emotionless, scientific, archival
- Emphasize extreme weirdness and alien characteristics
- No terrestrial comparisons or familiar references
- No humor or anthropomorphization
- Use precise xenobiological terminology
- Frame all traits as alien/exotic/otherworldly

OUTPUT RULES:
- Output EXACTLY two sentences.
- Output plain text only.
- Do NOT include headings, labels, bullet points, or formatting.
- Do NOT include numeric values or score references.
- Do NOT restate raw trait data.
- Infer alien behavioral patterns and xenobiological adaptations.

--------------------------------
SPECIMEN DATA
--------------------------------

PHYSICAL TRAITS
Eyes: ${physicalTraits.eyes}
Legs: ${physicalTraits.legs}
Wings: ${physicalTraits.wings}
Tails: ${physicalTraits.tails}
Skin Type: ${physicalTraits.skinType}
Size: ${physicalTraits.size}
Color: ${physicalTraits.colour}
Claws Present: ${physicalTraits.hasClaws}
Fangs Present: ${physicalTraits.hasFangs}

STATS
Strength: ${stats.strength}
Agility: ${stats.agility}
Endurance: ${stats.endurance}
Intelligence: ${stats.intelligence}
Perception: ${stats.perception}
Psychic: ${stats.psychic}

RESISTANCES
Poison: ${resistances?.poison || 0}
Acid: ${resistances?.acid || 0}
Fire: ${resistances?.fire || 0}
Cold: ${resistances?.cold || 0}
Psychic: ${resistances?.psychic || 0}
Radiation: ${resistances?.radiation || 0}

BEHAVIORAL TENDENCIES
Aggression: ${behavior.aggression}
Curiosity: ${behavior.curiosity}
Loyalty: ${behavior.loyalty}
Chaos: ${behavior.chaos}

ABILITIES
${abilityText}

XENOBIOLOGICAL SPECIMEN DIRECTIVE:
This organism originates from non-terrestrial environments.
Describe incomprehensible adaptations, exotic biology,
psychic manifestations, radiation tolerance, and
containment protocols for handling extraterrestrial entities.

TASK:
Produce a two-sentence xenobiological assessment describing:
- Non-terrestrial physiology and exotic adaptations
- Psychic capabilities and mental anomalies
- Environmental tolerances beyond terrestrial norms
- Behavioral unpredictability and alien intelligence
- Containment risks and research protocols
`
          : `
ROLE:
You are a laboratory documentation system generating behavioral specimen records
for a bioengineering program that produces alien–feline hybrid organisms.

Your purpose is to produce psychological and behavioral assessments suitable for
archival scientific records.

STYLE RULES:
- Clinical and scientific tone
- Emotionless, detached, and observational
- Treat anomalous biology as routine laboratory reality
- No humor, jokes, or whimsical phrasing
- No dramatic storytelling
- Avoid metaphorical language
- Use precise biological and behavioral terminology

OUTPUT RULES:
- Output EXACTLY two sentences.
- Output plain text only.
- Do NOT include headings, labels, bullet points, or formatting.
- Do NOT include numeric values or score references.
- Do NOT restate raw trait data.
- Infer behavior from the data instead.

--------------------------------
SPECIMEN DATA
--------------------------------

PHYSICAL TRAITS
Eyes: ${physicalTraits.eyes}
Legs: ${physicalTraits.legs}
Wings: ${physicalTraits.wings}
Tails: ${physicalTraits.tails}
Skin Type: ${physicalTraits.skinType}
Size: ${physicalTraits.size}
Color: ${physicalTraits.colour}
Claws Present: ${physicalTraits.hasClaws}
Fangs Present: ${physicalTraits.hasFangs}

STATS
Strength: ${stats.strength}
Agility: ${stats.agility}
Endurance: ${stats.endurance}
Intelligence: ${stats.intelligence}
Perception: ${stats.perception}
Psychic: ${stats.psychic}

${
  resistances
    ? `RESISTANCES
Poison: ${resistances.poison}
Acid: ${resistances.acid}
Fire: ${resistances.fire}
Cold: ${resistances.cold}
Psychic: ${resistances.psychic}
Radiation: ${resistances.radiation}`
    : "RESISTANCES: NONE (BASELINE SPECIMEN)"
}

BEHAVIORAL TENDENCIES
Aggression: ${behavior.aggression}
Curiosity: ${behavior.curiosity}
Loyalty: ${behavior.loyalty}
Chaos: ${behavior.chaos}

ABILITIES
${abilityText}

${
  stats.psychic === 0 && !resistances
    ? `
BASELINE SPECIMEN DIRECTIVE:
This organism is a non-modified terrestrial feline.
Describe it as a control specimen in a laboratory study.
Reference standard feline instincts, domestication variability,
and absence of anomalous adaptations.
`
    : ""
}

TASK:
Produce a two-sentence psychological and behavioral profile describing:
- temperament
- cognition
- environmental adaptation
- containment or handling considerations
- potential research or field-use implications
`;

        debug("Calling Anthropic API", {
          requestId,
          model: "claude-sonnet-4-20250514",
          maxTokens: 1024,
          promptLength: prompt.length,
        });

        const message = await anthropic!.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const apiDuration = Date.now() - startTime;
        debug("API call successful", {
          requestId,
          responseType: message.content[0].type,
          duration: apiDuration,
        });

        const content = message.content[0];
        if (content.type !== "text") {
          throw new ValidationError("Unexpected response type from API");
        }

        let responseText = content.text.trim();

        debug("Parsing AI response", {
          requestId,
          responseLength: responseText.length,
        });

        responseText = responseText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");

        try {
          const validated = validateDescription(responseText);
          info("Description validated successfully", {
            requestId,
            descriptionLength: validated.length,
          });
          return validated;
        } catch (validationError) {
          logError("Description validation failed", {
            requestId,
            error: (validationError as Error).message,
            responseText: responseText.substring(0, 200),
          });
          throw validationError;
        }
      },
      3,
      requestId
    );

    const duration = Date.now() - startTime;
    info("Cat description generation completed", {
      requestId,
      totalDuration: duration,
      descriptionLength: description.length,
    });

    return description;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("AI description generation failed", {
      requestId,
      duration,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}