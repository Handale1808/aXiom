import Anthropic from "@anthropic-ai/sdk";
import type { IAnalysis } from "@/models/Feedback";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
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

export async function analyzeFeedback(text: string): Promise<IAnalysis> {
  const startTime = Date.now();

  if (!anthropic) {
    console.log("No API key found, using mock analysis");
    return getMockAnalysis(text);
  }

  try {
    const analysis = await retryWithBackoff(async () => {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Analyze the following user feedback and return ONLY a JSON object with no additional text, markdown, or formatting.

The JSON must have exactly these fields:
- summary: A brief 1-2 sentence summary of the feedback
- sentiment: Must be exactly one of: "positive", "neutral", or "negative"
- tags: An array of 1-5 short descriptive nouns (single words)
- priority: Must be exactly one of: "P0" (critical), "P1" (high), "P2" (medium), or "P3" (low)
- nextAction: A brief recommendation for what action to take

Guidelines:
- P0: Critical issues affecting core functionality or user safety
- P1: Important issues affecting user experience significantly
- P2: Moderate issues or feature requests
- P3: Minor issues or nice-to-have improvements
- Keep all outputs concise and professional
- Do not include any personally identifiable information in the output

Feedback text: "${text}"

Return only the JSON object:`,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type from API");
      }

      let responseText = content.text.trim();

      responseText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");

      const parsed = JSON.parse(responseText);
      return validateAnalysis(parsed);
    });

    const duration = Date.now() - startTime;
    console.log(
      `AI analysis completed in ${duration}ms using claude-sonnet-4-20250514`
    );

    return analysis;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `AI analysis failed after ${duration}ms:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
}
