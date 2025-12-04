import Anthropic from "@anthropic-ai/sdk";
import type { IAnalysis } from "@/models/Feedback";
import { debug, info, warn, error as logError } from "@/lib/logger";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
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

function getMockAnalysis(text: string): IAnalysis {
  const lowerText = text.toLowerCase();

  let sentiment: IAnalysis["sentiment"] = "neutral";
  if (
    lowerText.includes("great") ||
    lowerText.includes("love") ||
    lowerText.includes("excellent")
  ) {
    sentiment = "positive";
  } else if (
    lowerText.includes("bad") ||
    lowerText.includes("hate") ||
    lowerText.includes("terrible")
  ) {
    sentiment = "negative";
  }

  return {
    summary: `User feedback: ${text.slice(0, 50)}${
      text.length > 50 ? "..." : ""
    }`,
    sentiment,
    tags: ["feedback", "mock"],
    priority: "P2",
    nextAction: "Review feedback and determine appropriate response",
  };
}

function validateAnalysis(data: any): IAnalysis {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid analysis: not an object");
  }

  if (typeof data.summary !== "string") {
    throw new Error("Invalid analysis: summary must be a string");
  }

  if (!["positive", "neutral", "negative"].includes(data.sentiment)) {
    throw new Error(
      "Invalid analysis: sentiment must be positive, neutral, or negative"
    );
  }

  if (
    !Array.isArray(data.tags) ||
    data.tags.length < 1 ||
    data.tags.length > 5
  ) {
    throw new Error("Invalid analysis: tags must be an array of 1-5 items");
  }

  if (!["P0", "P1", "P2", "P3"].includes(data.priority)) {
    throw new Error("Invalid analysis: priority must be P0, P1, P2, or P3");
  }

  if (typeof data.nextAction !== "string") {
    throw new Error("Invalid analysis: nextAction must be a string");
  }

  return data as IAnalysis;
}

export async function analyzeFeedback(
  text: string,
  requestId?: string
): Promise<IAnalysis> {
  const startTime = Date.now();

  info("Starting feedback analysis", {
    requestId,
    textLength: text.length,
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
  });

  if (!anthropic) {
    warn("No API key found, using mock analysis", {
      requestId,
      mode: "mock",
    });
    return getMockAnalysis(text);
  }

  try {
    const analysis = await retryWithBackoff(
      async () => {
        debug("Calling Anthropic API", {
          requestId,
          model: "claude-sonnet-4-20250514",
          maxTokens: 1024,
          textLength: text.length,
        });

        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `You are analyzing customer feedback for a bioengineering company that splices alien DNA with cats to create hybrid pets. Users may report various issues ranging from life-threatening emergencies to minor aesthetic concerns.

CRITICAL PRINCIPLE: Objective safety threats to human life always require immediate intervention, regardless of customer satisfaction. However, when no safety threat exists, customer satisfaction drives priority level.

Analyze the following feedback and return ONLY a valid JSON object with no markdown formatting, code blocks, or additional text.

Required JSON structure:
{
  "summary": "string",
  "sentiment": "string",
  "tags": ["string"],
  "priority": "string",
  "nextAction": "string",
  "urgencyIndicators": ["string"],
  "customerSatisfied": boolean,
  "safetyThreat": boolean
}

SENTIMENT ANALYSIS GUIDELINES:
- "positive": Customer expresses satisfaction, gratitude, excitement, or affection for their cat (even if reporting unexpected features)
- "neutral": Factual reporting without emotional indicators, routine inquiries, or mixed feelings
- "negative": Frustration, concern, disappointment, fear, or distress about their cat OR conflict between attachment and safety concerns
- Consider emotional complexity: Customer may love their cat while acknowledging danger (still negative due to distress)
- Watch for sarcasm, understatement, or denial indicating hidden distress

SAFETY THREAT ASSESSMENT:
Set "safetyThreat" to true if:
- Any human has been harmed or is at immediate risk of harm
- Cat is actively dangerous to people (attacking, toxic, uncontrollable aggression)
- Public safety concern (neighbors, children, community at risk)
- Biohazard or contagion risk to humans
- Cat's condition could rapidly deteriorate to dangerous

Set to false if:
- Only property damage or inconvenience
- Cat is healthy and not dangerous
- Cosmetic or behavioral quirks without safety implications

PRIORITY CLASSIFICATION:

P0 - CRITICAL (Immediate threat to human life or safety):
Criteria: Active danger to ANY human, regardless of customer willingness to cooperate or emotional attachment to cat.

Examples:
- Cat has harmed or killed humans (owners, family, neighbors, public)
- Cat exhibiting severe uncontrolled aggression toward people
- Toxic secretions or emissions causing human medical emergencies
- Mutations creating immediate physical danger (extreme size, destructive capabilities)
- Biohazard threatening public health
- Any scenario where delay could result in human death or serious injury

Important: Customer attachment or reluctance to surrender cat does not lower priority. This information affects HOW we respond, not WHETHER we respond urgently.

Next Action Reasoning: Consider what will actually resolve the immediate danger while respecting that forced removal may escalate the situation. Options might include: immediate callback to assess situation and customer cooperation level, emergency behavioral intervention, temporary containment solutions customer will accept, coordination with authorities if customer unwilling to ensure safety, emergency veterinary sedation, discussion of humane options. Choose based on the specific scenario to balance safety with practicality.

P1 - HIGH (Significant health impact or serious dysfunction causing distress):
Criteria: Serious issues affecting cat or customer wellbeing, or emerging safety concerns that could escalate.

Examples:
- Cat experiencing significant suffering or pain concerning to customer
- Progressive health deterioration customer wants addressed
- Aggressive behavior customer cannot safely manage
- Genetic instabilities worsening over time
- Multiple customers reporting same serious issue with a model
- Functionality failures leaving customer dissatisfied
- Behavioral issues creating significant stress for customer

Next Action Reasoning: Consider what support the customer actually needs and wants. Options include: callback within 24 hours to discuss customer concerns and preferences, offer veterinary evaluation and treatment options, provide behavioral management resources, discuss modification or replacement if customer desires, investigate if pattern across model line, compensation discussion if appropriate. Tailor response to customer's expressed needs.

P2 - MEDIUM (Quality of life impact requiring attention):
Criteria: Issues affecting satisfaction, comfort, or requiring monitoring but not urgent.

Examples:
- Minor health concerns customer finds worrying
- Unexpected mutations customer dislikes
- Behavioral quirks causing customer frustration
- Performance below expectations
- Care difficulties customer needs help managing
- Aesthetic deviations disappointing to customer

Next Action Reasoning: Focus on customer support and problem-solving. Consider: follow-up within 3-5 days to check status, provide care guidance tailored to the specific issue, offer solutions if customer wants changes, monitor for any escalation, discuss refund/credit/exchange if customer remains unsatisfied. Match response to severity of customer concern.

P3 - LOW (Satisfied customers, minor issues, or routine matters):
Criteria: No safety concerns and customer is satisfied, or very minor matters.

Examples:
- Unexpected features customer enjoys or finds endearing
- Happy customers sharing positive experiences
- Questions about normal cat behaviors
- Feature requests for future model improvements
- General inquiries without problems
- Routine check-ins from satisfied customers
- Cosmetic preferences without dissatisfaction

Next Action Reasoning: Focus on relationship building and data collection. Consider: send appreciation message, document any interesting mutations for research and potential future features, standard follow-up to maintain relationship, gather feedback for product development, provide requested information. No intervention needed unless customer requests it.

CUSTOMER SATISFACTION ASSESSMENT:
Set "customerSatisfied" to true if:
- Customer uses positive language about their cat despite issues
- Customer explicitly states happiness or affection
- Customer asking questions from curiosity, not concern
- Customer sharing good news about their cat

Set to false if:
- Customer expresses worry, fear, disappointment, frustration
- Customer requests help, intervention, or changes
- Customer indicates conflict between attachment and problems
- Customer describing distressing situations even if attached to cat

TAGS GUIDELINES:
- Use 2-5 specific single-word nouns describing the situation
- Be concrete: "child-safety", "lethal-behavior", "aggression", "attachment-conflict", "mutation", "bioluminescence", "health-decline"
- Include relevant categories: body systems, behavior types, safety concerns, emotional factors
- Prioritize tags that help routing and response planning

URGENCY INDICATORS:
Populate with specific phrases or situations indicating emergency:
- Explicit emergency language: "emergency", "urgent", "help", "immediately", "dying", "attacking"
- Active harm descriptions: "killing", "won't stop", "bleeding", "can't breathe", "collapsed"
- Time pressure: "happening right now", "getting worse", "spreading"
- Danger to others: "neighbors", "children", "escaped", "public"
- Loss of control: "can't contain", "too dangerous", "overpowered"

Leave empty for non-emergency situations, even if customer reports unusual features they're happy with.

KEY DECISION RULES:
1. Human safety threat = P0, always, regardless of all other factors
2. Customer cooperation affects response strategy, not priority level
3. Happy customer + no safety threat + healthy cat = P3
4. Customer dissatisfaction with non-dangerous issues = P1 or P2 based on severity
5. Unexpected mutations liked by customer = P3 (document for research)

NEXT ACTION INSTRUCTIONS:
Do not simply repeat standard actions. Reason about the specific situation:
- What is the actual immediate need?
- What will the customer realistically accept or cooperate with?
- What achieves safety while minimizing trauma/conflict?
- What information do we need to gather?
- What resources or expertise are needed?
- What are practical next steps given the circumstances?

Be specific and actionable. Consider the full context including customer emotional state, severity of issue, likelihood of cooperation, and practical constraints.

OUTPUT REQUIREMENTS:
- Summary: 2 sentences maximum, state the core issue and customer's relationship to it
- Clearly distinguish between "customer reports [issue]" vs "customer concerned about [issue]" vs "customer loves [unusual feature]"
- Never include personally identifiable information
- If multiple issues, prioritize the one with greatest safety impact or customer concern
- Be direct and factual in tone

Feedback text: "${text}"

Return only the JSON object with no additional text, explanations, or markdown formatting:`
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
          throw new Error("Unexpected response type from API");
        }

        let responseText = content.text.trim();

        debug("Parsing AI response", {
          requestId,
          responseLength: responseText.length,
        });

        responseText = responseText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");

        let parsed;
        try {
          parsed = JSON.parse(responseText);
        } catch (parseError) {
          logError("Failed to parse AI response", {
            requestId,
            error: (parseError as Error).message,
            responseText: responseText.substring(0, 200),
          });
          throw parseError;
        }

        try {
          const validated = validateAnalysis(parsed);
          info("Analysis validated successfully", {
            requestId,
            sentiment: validated.sentiment,
            priority: validated.priority,
            tagCount: validated.tags.length,
          });
          return validated;
        } catch (validationError) {
          logError("Analysis validation failed", {
            requestId,
            error: (validationError as Error).message,
            receivedData: {
              hasSummary: !!parsed.summary,
              sentiment: parsed.sentiment,
              priority: parsed.priority,
              tagCount: Array.isArray(parsed.tags) ? parsed.tags.length : 0,
            },
          });
          throw validationError;
        }
      },
      3,
      requestId
    );

    const duration = Date.now() - startTime;
    info("Feedback analysis completed", {
      requestId,
      totalDuration: duration,
      sentiment: analysis.sentiment,
      priority: analysis.priority,
    });

    return analysis;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("AI analysis failed", {
      requestId,
      duration,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}
