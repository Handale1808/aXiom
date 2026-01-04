import { NextRequest, NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { ValidationError, DatabaseError } from "@/lib/errors";
import { generateDescription } from "@/lib/cat-generation/generateDescription";
import {
  debug,
  info,
  warn,
  error as logError,
} from "@/lib/logger";
import type { IAbility } from "@/models/Ability";
import type { ICat, IPhysicalTraits, IStats, IResistances, IBehavior } from "@/models/Cats";

async function postHandler(
  request: NextRequest,
  context: { requestId: string }
) {
  const { requestId } = context;

  try {
    debug("Processing cat description generation request", {
      requestId,
    });

    const body = await request.json();
    const { cat, abilities } = body;

    debug("Validating input", {
      requestId,
      hasCat: !!cat,
      hasAbilities: !!abilities,
      abilitiesIsArray: Array.isArray(abilities),
      abilitiesCount: Array.isArray(abilities) ? abilities.length : undefined,
    });

    if (!cat) {
      warn("Validation failed: missing cat data", { requestId });
      throw new ValidationError(
        "Cat data is required",
        {
          cat: "Cat data is required",
        },
        requestId
      );
    }

    if (!cat.physicalTraits) {
      throw new ValidationError(
        "Cat must have physicalTraits",
        { physicalTraits: "physicalTraits is required" },
        requestId
      );
    }

    if (!cat.stats) {
      throw new ValidationError(
        "Cat must have stats",
        { stats: "stats is required" },
        requestId
      );
    }

    if (!cat.resistances) {
      throw new ValidationError(
        "Cat must have resistances",
        { resistances: "resistances is required" },
        requestId
      );
    }

    if (!cat.behavior) {
      throw new ValidationError(
        "Cat must have behavior",
        { behavior: "behavior is required" },
        requestId
      );
    }

    if (!Array.isArray(abilities)) {
      throw new ValidationError(
        "Abilities must be an array",
        { abilities: "abilities must be an array" },
        requestId
      );
    }

    info("Input validated", {
      requestId,
      catSize: cat.physicalTraits?.size,
      catEyes: cat.physicalTraits?.eyes,
      abilityCount: abilities.length,
    });

    info("Starting description generation", {
      requestId,
    });

    const generationStartTime = Date.now();
    const description = await generateDescription(
      {
        physicalTraits: cat.physicalTraits,
        stats: cat.stats,
        resistances: cat.resistances,
        behavior: cat.behavior,
      },
      abilities,
      requestId
    );
    const generationDuration = Date.now() - generationStartTime;

    info("Description generated successfully", {
      requestId,
      duration: generationDuration,
      descriptionLength: description.length,
    });

    return NextResponse.json(
      { 
        success: true, 
        data: { description } 
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logError("Description generation failed", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw new Error(
      `Failed to generate description: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export const POST = withMiddleware(postHandler);