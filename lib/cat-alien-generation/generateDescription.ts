import Anthropic from "@anthropic-ai/sdk";
import type { IAbility } from "@/models/Ability";
import type { ICat } from "@/models/Cats";
import { debug, info, warn, error as logError } from "@/lib/logger";

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
  cat: Pick<ICat, "physicalTraits" | "stats" | "resistances" | "behavior">,
  abilities: IAbility[]
): string {
  const { physicalTraits, stats, behavior } = cat;
  
  const sizeDescriptor = physicalTraits.size;
  const eyeCount = physicalTraits.eyes;
  const unusualTrait = 
    physicalTraits.wings > 0 ? `${physicalTraits.wings} functional wings` :
    physicalTraits.tails > 1 ? `${physicalTraits.tails} tails` :
    physicalTraits.legs === 0 ? "no legs" :
    physicalTraits.eyes > 2 ? `${physicalTraits.eyes} eyes` :
    "standard feline morphology";
  
  const behaviorTrait = 
    behavior.aggression >= 8 ? "extreme aggression" :
    behavior.chaos >= 8 ? "chaotic" :
    behavior.curiosity >= 8 ? "highly curious" :
    behavior.loyalty >= 8 ? "loyal" :
    "unpredictable behavioral";
  
  const abilityMention = abilities.length > 0 
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
    throw new ValidationError("Description exceeds maximum length of 1000 characters");
  }

  const sentences = trimmed.split(/\.(?!\d)/).filter(s => s.trim().length > 0);
  
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
  cat: Pick<ICat, "physicalTraits" | "stats" | "resistances" | "behavior">,
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

  if (!anthropic) {
    warn("No API key found, using mock description", {
      requestId,
      mode: "mock",
    });
    return getMockDescription(cat, abilities);
  }

  try {
    const description = await retryWithBackoff(
      async () => {
        const { physicalTraits, stats, resistances, behavior } = cat;

        const abilityText = abilities.length > 0
          ? abilities.map(a => `- ${a.name}: ${a.description} `).join("\n")
          : "None";

        const prompt = `You are generating specimen documentation for a bioengineering lab that creates alien-feline hybrids. Your descriptions must be clinical, serious, and matter-of-fact while acknowledging the bizarre reality of these creatures.

TONE REQUIREMENTS:
- Ultra-serious and clinical (like scientific documentation)
- Completely deadpan about absurd features
- No humor, whimsy, or lightheartedness
- Full of technical/scientific language
- Matter-of-fact acceptance of weirdness

DATA PROVIDED:

Physical Traits:
- Eyes: ${physicalTraits.eyes}
- Legs: ${physicalTraits.legs}
- Wings: ${physicalTraits.wings}
- Tails: ${physicalTraits.tails}
- Skin Type: ${physicalTraits.skinType}
- Size: ${physicalTraits.size}
- Color: ${physicalTraits.colour}
- Has Claws: ${physicalTraits.hasClaws}
- Has Fangs: ${physicalTraits.hasFangs}

Stats (each 1-10):
- Strength: ${stats.strength}
- Agility: ${stats.agility}
- Endurance: ${stats.endurance}
- Intelligence: ${stats.intelligence}
- Perception: ${stats.perception}
- Psychic: ${stats.psychic}

Resistances (each 0-100):
- Poison: ${resistances.poison}
- Acid: ${resistances.acid}
- Fire: ${resistances.fire}
- Cold: ${resistances.cold}
- Psychic: ${resistances.psychic}
- Radiation: ${resistances.radiation}

Behavior (each 1-10):
- Aggression: ${behavior.aggression}
- Curiosity: ${behavior.curiosity}
- Loyalty: ${behavior.loyalty}
- Chaos: ${behavior.chaos}

Abilities:
${abilityText}

INSTRUCTIONS:
Generate EXACTLY 2 sentences that form a psychological and behavioral profile of this specimen. Analyze the data holistically and draw inferences about the creature's nature, temperament, survival adaptations, and potential applications or hazards.

REQUIREMENTS:
- EXACTLY 2 sentences (two periods total)
- DO NOT summarize or list stats - instead interpret what they mean about the creature's character, capabilities, and behavioral patterns
- Draw connections between physical traits, abilities, and likely behavioral outcomes
- Infer things like: predatory nature, environmental adaptations, psychological stability, operational viability, threat level, trainability
- IF abilities are present, you MUST mention them and their implications for the specimen's behavior or tactical value
- Serious, clinical, scientific tone - treat bizarre features as mundane facts
- NEVER include any numbers, percentages, or numerical values
- Use qualitative descriptors: "minimal/low/moderate/high/extreme/exceptional" for stats and behavior
- For resistances: "negligible", "minimal", "moderate", "substantial", "exceptional", "near-complete"
- For physical traits: "singular", "few", "several", "multiple", "numerous"
- Do not include hex codes or numerical color values - describe colors in words only
- Use analytical phrases like: "suggests adaptation for", "indicates specialization in", "implies heightened capacity for", "consistent with", "predisposed toward"
- Avoid phrases like: "interestingly", "surprisingly", "remarkably"
- Max 500 characters total

EXAMPLE STYLE:
"This specimen's exceptional psychic resistance coupled with Thermal Vision capability suggests evolutionary adaptation for detection and neutralization of psionic threats in low-visibility environments. The combination of moderate aggression with substantial loyalty metrics indicates potential viability for tactical applications requiring controlled hostile engagement under handler supervision."

Return ONLY the two sentences with no additional text, markdown, or JSON formatting.`;

        debug("Calling Anthropic API", {
          requestId,
          model: "claude-sonnet-4-20250514",
          maxTokens: 1024,
          promptLength: prompt.length,
        });

        const message = await anthropic.messages.create({
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