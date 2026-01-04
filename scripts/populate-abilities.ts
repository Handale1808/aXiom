import { ObjectId } from "mongodb";
import clientPromise from "../lib/mongodb";
import { IAbility } from "../models/Ability";
import { IAbilityRule } from "../models/AbilityRules";

const ABILITIES_DATA = [
  {
    key: "HIGH_JUMP",
    name: "High Jump",
    description: "Can jump to extraordinary heights using powerful leg muscles",
    isPassive: true,
  },
  {
    key: "WALL_CLING",
    name: "Wall Cling",
    description: "Can cling to vertical surfaces using sharp claws",
    isPassive: true,
  },
  {
    key: "GLIDE",
    name: "Glide",
    description: "Can glide through the air using wing membranes",
    isPassive: true,
  },
  {
    key: "BURST_SPRINT",
    name: "Burst Sprint",
    description: "Can achieve incredible bursts of speed over short distances",
    isPassive: true,
  },
  {
    key: "SERPENTINE_MOVEMENT",
    name: "Serpentine Movement",
    description: "Can move efficiently with snake-like undulation",
    isPassive: true,
  },
  {
    key: "DIMENSION_BLINK",
    name: "Dimension Blink",
    description:
      "Can briefly phase through dimensions to teleport short distances",
    isPassive: false,
  },
  {
    key: "RENDING_CLAWS",
    name: "Rending Claws",
    description: "Claws capable of tearing through tough materials",
    isPassive: true,
  },
  {
    key: "VENOM_BITE",
    name: "Venom Bite",
    description: "Delivers potent toxins through fanged bite",
    isPassive: false,
  },
  {
    key: "ACID_SPIT",
    name: "Acid Spit",
    description: "Can project corrosive acid at range",
    isPassive: false,
  },
  {
    key: "CHARGE_ATTACK",
    name: "Charge Attack",
    description: "Devastating charging tackle using mass and strength",
    isPassive: false,
  },
  {
    key: "NATURAL_ARMOUR",
    name: "Natural Armour",
    description: "Thick protective skin provides damage resistance",
    isPassive: true,
  },
  {
    key: "TOXIN_METABOLISM",
    name: "Toxin Metabolism",
    description: "Can metabolize and neutralize most toxins",
    isPassive: true,
  },
  {
    key: "THERMAL_ADAPTATION",
    name: "Thermal Adaptation",
    description: "Body can adapt to extreme temperatures",
    isPassive: true,
  },
  {
    key: "CAMOUFLAGE",
    name: "Camouflage",
    description: "Can blend skin coloration with surroundings",
    isPassive: false,
  },
  {
    key: "NIGHT_VISION",
    name: "Night Vision",
    description: "Can see clearly in near-total darkness",
    isPassive: true,
  },
  {
    key: "OMNIDIRECTIONAL_SIGHT",
    name: "Omnidirectional Sight",
    description: "Multiple eyes provide 360-degree vision",
    isPassive: true,
  },
  {
    key: "VIBRATION_SENSE",
    name: "Vibration Sense",
    description: "Can detect minute vibrations through ground contact",
    isPassive: true,
  },
  {
    key: "EMOTIONAL_SENSE",
    name: "Emotional Sense",
    description: "Can sense the emotional states of nearby creatures",
    isPassive: true,
  },
  {
    key: "FIRE_IMMUNITY",
    name: "Fire Immunity",
    description: "Complete immunity to fire and heat damage",
    isPassive: true,
  },
  {
    key: "RADIATION_FEEDER",
    name: "Radiation Feeder",
    description: "Can absorb radiation as energy source",
    isPassive: true,
  },
  {
    key: "STATIC_DISCHARGE",
    name: "Static Discharge",
    description: "Can generate and discharge static electricity",
    isPassive: false,
  },
  {
    key: "ACID_BODY",
    name: "Acid Body",
    description: "Body secretes acidic compounds as defense",
    isPassive: true,
  },
  {
    key: "PSYCHIC_SCREAM",
    name: "Psychic Scream",
    description: "Devastating mental assault that disorients targets",
    isPassive: false,
  },
  {
    key: "TELEKINETIC_POUNCE",
    name: "Telekinetic Pounce",
    description: "Enhances physical attacks with telekinetic force",
    isPassive: false,
  },
  {
    key: "MIND_SHIELD",
    name: "Mind Shield",
    description: "Natural resistance to psychic intrusion and manipulation",
    isPassive: true,
  },
  {
    key: "PSYCHIC_DETECTION",
    name: "Psychic Detection",
    description: "Can sense psychic energy and mental presences",
    isPassive: true,
  },
  {
    key: "UNPREDICTABLE",
    name: "Unpredictable",
    description: "Erratic behavior makes actions difficult to predict",
    isPassive: true,
  },
  {
    key: "PACK_COORDINATION",
    name: "Pack Coordination",
    description: "Enhanced effectiveness when working with allies",
    isPassive: true,
  },
  {
    key: "BERSERK",
    name: "Berserk",
    description: "Can enter rage state for increased combat ability",
    isPassive: false,
  },
  {
    key: "STOIC",
    name: "Stoic",
    description: "Exceptional emotional control and focus",
    isPassive: true,
  },
  {
    key: "CRYSTALLINE_HIDE",
    name: "Crystalline Hide",
    description:
      "Skin forms protective crystalline structures that refract light and deflect attacks",
    isPassive: true,
  },
  {
    key: "PHASE_WHISKERS",
    name: "Phase Whiskers",
    description:
      "Whiskers can phase through solid matter to sense objects and life forms beyond barriers",
    isPassive: true,
  },
  {
    key: "SONIC_PURR",
    name: "Sonic Purr",
    description:
      "Generates devastating sonic waves through specialized purring organs",
    isPassive: false,
  },
  {
    key: "GRAVITATIONAL_POUNCE",
    name: "Gravitational Pounce",
    description:
      "Can manipulate local gravity to enhance jump trajectory and impact force",
    isPassive: false,
  },
  {
    key: "BIOLUMINESCENT_LURE",
    name: "Bioluminescent Lure",
    description: "Emits hypnotic light patterns to attract or disorient prey",
    isPassive: false,
  },
  {
    key: "TEMPORAL_REFLEXES",
    name: "Temporal Reflexes",
    description:
      "Perceives time slightly slower during combat, allowing supernatural reaction speed",
    isPassive: true,
  },
  {
    key: "MIRROR_FUR",
    name: "Mirror Fur",
    description:
      "Reflective coat can redirect energy-based attacks back at attackers",
    isPassive: true,
  },
  {
    key: "VOID_STEP",
    name: "Void Step",
    description:
      "Can step into pocket dimensions to avoid damage or traverse obstacles",
    isPassive: false,
  },
  {
    key: "PHEROMONE_CLOUD",
    name: "Pheromone Cloud",
    description:
      "Releases powerful pheromones that can calm, enrage, or confuse other creatures",
    isPassive: false,
  },
  {
    key: "REGENERATIVE_PURR",
    name: "Regenerative Purr",
    description:
      "Accelerated healing triggered by purring at specific frequencies",
    isPassive: true,
  },
  {
    key: "MAGNETIC_PAWS",
    name: "Magnetic Paws",
    description:
      "Can generate magnetic fields to cling to metallic surfaces or manipulate ferrous objects",
    isPassive: false,
  },
  {
    key: "ECHOLOCATION_MEOW",
    name: "Echolocation Meow",
    description:
      "Produces ultrasonic meows to navigate and detect hidden threats in complete darkness",
    isPassive: true,
  },
  {
    key: "CHROMATIC_SHIFT",
    name: "Chromatic Shift",
    description:
      "Can rapidly change fur coloration for communication or emotional expression",
    isPassive: true,
  },
  {
    key: "TAIL_WHIP_VORTEX",
    name: "Tail Whip Vortex",
    description:
      "Spinning tail generates powerful air currents that can deflect projectiles",
    isPassive: false,
  },
  {
    key: "QUANTUM_UNCERTAINTY",
    name: "Quantum Uncertainty",
    description:
      "Exists in superposition of positions making it nearly impossible to target accurately",
    isPassive: true,
  },
  {
    key: "PLASMA_BREATH",
    name: "Plasma Breath",
    description:
      "Exhales superheated plasma capable of melting through obstacles",
    isPassive: false,
  },
  {
    key: "NEURAL_LINK",
    name: "Neural Link",
    description:
      "Can form temporary telepathic bonds with allies for coordinated tactics",
    isPassive: false,
  },
  {
    key: "SHADOW_MELD",
    name: "Shadow Meld",
    description:
      "Can merge with shadows becoming nearly undetectable in dim light",
    isPassive: true,
  },
  {
    key: "OSMOTIC_CONSUMPTION",
    name: "Osmotic Consumption",
    description: "Absorbs nutrients through skin contact with organic matter",
    isPassive: true,
  },
  {
    key: "ANTIMATTER_CLAWS",
    name: "Antimatter Claws",
    description:
      "Claws coated in trace antimatter cause explosive damage on contact",
    isPassive: false,
  },
  {
    key: "REALITY_ANCHOR",
    name: "Reality Anchor",
    description:
      "Stabilizes local reality making dimensional or temporal manipulation difficult nearby",
    isPassive: true,
  },
  {
    key: "SWARM_CONSCIOUSNESS",
    name: "Swarm Consciousness",
    description:
      "Can mentally coordinate with multiple instances of self or cloned entities",
    isPassive: true,
  },
  {
    key: "CRYOGENIC_EXHALE",
    name: "Cryogenic Exhale",
    description: "Breathes supercooled gas that flash-freezes targets",
    isPassive: false,
  },
  {
    key: "PHOTOSYNTHETIC_FUR",
    name: "Photosynthetic Fur",
    description:
      "Converts light into energy reducing need for traditional food",
    isPassive: true,
  },
  {
    key: "BLOOD_SCENT_TRACKING",
    name: "Blood Scent Tracking",
    description: "Can detect and track injured creatures across vast distances",
    isPassive: true,
  },
];

const ABILITY_RULES_DATA = [
  {
    abilityKey: "HIGH_JUMP",
    chance: 0.085,
    priority: 50,
    exclusiveGroup: "movement",
    conditions: [
      { source: "stat", key: "strength", op: ">=", value: 5 },
      { source: "stat", key: "agility", op: ">=", value: 4 },
      { source: "trait", key: "legs", op: ">=", value: 3 },
    ],
  },
  {
    abilityKey: "WALL_CLING",
    chance: 0.084,
    priority: 45,
    exclusiveGroup: null,
    conditions: [
      { source: "trait", key: "hasClaws", op: "=", value: true },
      { source: "stat", key: "agility", op: ">=", value: 6 },
      { source: "trait", key: "size", op: "!=", value: "massive" },
    ],
  },
  {
    abilityKey: "GLIDE",
    chance: 0.086,
    priority: 55,
    exclusiveGroup: "movement",
    conditions: [
      { source: "trait", key: "wings", op: ">=", value: 1 },
      { source: "stat", key: "endurance", op: ">=", value: 4 },
    ],
  },
  {
    abilityKey: "BURST_SPRINT",
    chance: 0.087,
    priority: 40,
    exclusiveGroup: "movement",
    conditions: [
      { source: "stat", key: "agility", op: ">=", value: 7 },
      { source: "stat", key: "endurance", op: ">=", value: 3 },
    ],
  },
  {
    abilityKey: "SERPENTINE_MOVEMENT",
    chance: 0.085,
    priority: 35,
    exclusiveGroup: "movement",
    conditions: [
      { source: "trait", key: "legs", op: "<=", value: 2 },
      { source: "stat", key: "agility", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "DIMENSION_BLINK",
    chance: 0.082,
    priority: 80,
    exclusiveGroup: "movement",
    conditions: [
      { source: "stat", key: "psychic", op: ">=", value: 8 },
      { source: "stat", key: "agility", op: ">=", value: 6 },
    ],
  },
  {
    abilityKey: "RENDING_CLAWS",
    chance: 0.086,
    priority: 50,
    exclusiveGroup: null,
    conditions: [
      { source: "trait", key: "hasClaws", op: "=", value: true },
      { source: "stat", key: "strength", op: ">=", value: 6 },
    ],
  },
  {
    abilityKey: "VENOM_BITE",
    chance: 0.084,
    priority: 55,
    exclusiveGroup: null,
    conditions: [
      { source: "trait", key: "hasFangs", op: "=", value: true },
      { source: "resistance", key: "poison", op: ">=", value: 50 },
    ],
  },
  {
    abilityKey: "ACID_SPIT",
    chance: 0.083,
    priority: 60,
    exclusiveGroup: null,
    conditions: [
      { source: "resistance", key: "acid", op: ">=", value: 60 },
      { source: "stat", key: "intelligence", op: ">=", value: 4 },
    ],
  },
  {
    abilityKey: "CHARGE_ATTACK",
    chance: 0.085,
    priority: 50,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "strength", op: ">=", value: 7 },
      { source: "trait", key: "size", op: "in", value: ["large", "massive"] },
      { source: "stat", key: "endurance", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "NATURAL_ARMOUR",
    chance: 0.086,
    priority: 50,
    exclusiveGroup: null,
    conditions: [
      {
        source: "trait",
        key: "skinType",
        op: "in",
        value: ["scales", "chitin"],
      },
      { source: "stat", key: "endurance", op: ">=", value: 6 },
    ],
  },
  {
    abilityKey: "TOXIN_METABOLISM",
    chance: 0.088,
    priority: 40,
    exclusiveGroup: null,
    conditions: [{ source: "resistance", key: "poison", op: ">=", value: 70 }],
  },
  {
    abilityKey: "THERMAL_ADAPTATION",
    chance: 0.085,
    priority: 45,
    exclusiveGroup: null,
    conditions: [
      { source: "resistance", key: "fire", op: ">=", value: 60 },
      { source: "stat", key: "endurance", op: ">=", value: 4 },
    ],
  },
  {
    abilityKey: "THERMAL_ADAPTATION",
    chance: 0.085,
    priority: 45,
    exclusiveGroup: null,
    conditions: [
      { source: "resistance", key: "cold", op: ">=", value: 60 },
      { source: "stat", key: "endurance", op: ">=", value: 4 },
    ],
  },
  {
    abilityKey: "CAMOUFLAGE",
    chance: 0.084,
    priority: 50,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "agility", op: ">=", value: 5 },
      { source: "stat", key: "perception", op: ">=", value: 4 },
    ],
  },
  {
    abilityKey: "NIGHT_VISION",
    chance: 0.087,
    priority: 40,
    exclusiveGroup: null,
    conditions: [
      { source: "trait", key: "eyes", op: ">=", value: 2 },
      { source: "stat", key: "perception", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "OMNIDIRECTIONAL_SIGHT",
    chance: 0.086,
    priority: 50,
    exclusiveGroup: null,
    conditions: [{ source: "trait", key: "eyes", op: ">=", value: 4 }],
  },
  {
    abilityKey: "VIBRATION_SENSE",
    chance: 0.085,
    priority: 45,
    exclusiveGroup: null,
    conditions: [
      { source: "trait", key: "legs", op: ">=", value: 4 },
      { source: "stat", key: "perception", op: ">=", value: 6 },
    ],
  },
  {
    abilityKey: "EMOTIONAL_SENSE",
    chance: 0.084,
    priority: 55,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "psychic", op: ">=", value: 4 },
      { source: "stat", key: "intelligence", op: ">=", value: 4 },
    ],
  },
  {
    abilityKey: "FIRE_IMMUNITY",
    chance: 0.09,
    priority: 70,
    exclusiveGroup: "elemental",
    conditions: [{ source: "resistance", key: "fire", op: ">=", value: 90 }],
  },
  {
    abilityKey: "RADIATION_FEEDER",
    chance: 0.085,
    priority: 60,
    exclusiveGroup: "elemental",
    conditions: [
      { source: "resistance", key: "radiation", op: ">=", value: 80 },
      { source: "stat", key: "endurance", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "STATIC_DISCHARGE",
    chance: 0.083,
    priority: 50,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "agility", op: ">=", value: 6 },
      { source: "resistance", key: "cold", op: ">=", value: 40 },
    ],
  },
  {
    abilityKey: "ACID_BODY",
    chance: 0.084,
    priority: 65,
    exclusiveGroup: "elemental",
    conditions: [
      { source: "resistance", key: "acid", op: ">=", value: 85 },
      { source: "stat", key: "endurance", op: ">=", value: 4 },
    ],
  },
  {
    abilityKey: "PSYCHIC_SCREAM",
    chance: 0.084,
    priority: 60,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "psychic", op: ">=", value: 7 },
      { source: "stat", key: "endurance", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "TELEKINETIC_POUNCE",
    chance: 0.083,
    priority: 55,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "psychic", op: ">=", value: 6 },
      { source: "stat", key: "agility", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "MIND_SHIELD",
    chance: 0.086,
    priority: 50,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "psychic", op: ">=", value: 5 },
      { source: "stat", key: "intelligence", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "PSYCHIC_DETECTION",
    chance: 0.085,
    priority: 45,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "psychic", op: ">=", value: 6 },
      { source: "stat", key: "perception", op: ">=", value: 4 },
    ],
  },
  {
    abilityKey: "UNPREDICTABLE",
    chance: 0.088,
    priority: 40,
    exclusiveGroup: null,
    conditions: [{ source: "behavior", key: "chaos", op: ">=", value: 7 }],
  },
  {
    abilityKey: "PACK_COORDINATION",
    chance: 0.085,
    priority: 45,
    exclusiveGroup: null,
    conditions: [
      { source: "behavior", key: "loyalty", op: ">=", value: 6 },
      { source: "stat", key: "intelligence", op: ">=", value: 4 },
    ],
  },
  {
    abilityKey: "BERSERK",
    chance: 0.086,
    priority: 60,
    exclusiveGroup: "mental",
    conditions: [
      { source: "behavior", key: "aggression", op: ">=", value: 8 },
      { source: "stat", key: "endurance", op: ">=", value: 6 },
    ],
  },
  {
    abilityKey: "STOIC",
    chance: 0.084,
    priority: 55,
    exclusiveGroup: "mental",
    conditions: [
      { source: "behavior", key: "aggression", op: "<=", value: 3 },
      { source: "stat", key: "intelligence", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "CRYSTALLINE_HIDE",
    chance: 0.085,
    priority: 55,
    exclusiveGroup: null,
    conditions: [
      {
        source: "trait",
        key: "skinType",
        op: "in",
        value: ["scales", "chitin"],
      },
      { source: "resistance", key: "cold", op: ">=", value: 60 },
      { source: "stat", key: "endurance", op: ">=", value: 7 },
    ],
  },
  {
    abilityKey: "PHASE_WHISKERS",
    chance: 0.083,
    priority: 65,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "psychic", op: ">=", value: 7 },
      { source: "stat", key: "perception", op: ">=", value: 6 },
      {
        source: "trait",
        key: "size",
        op: "in",
        value: ["tiny", "small", "medium"],
      },
    ],
  },
  {
    abilityKey: "SONIC_PURR",
    chance: 0.084,
    priority: 60,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "strength", op: ">=", value: 5 },
      { source: "stat", key: "endurance", op: ">=", value: 6 },
      { source: "behavior", key: "aggression", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "GRAVITATIONAL_POUNCE",
    chance: 0.082,
    priority: 75,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "psychic", op: ">=", value: 8 },
      { source: "stat", key: "strength", op: ">=", value: 6 },
      { source: "stat", key: "intelligence", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "BIOLUMINESCENT_LURE",
    chance: 0.085,
    priority: 50,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "intelligence", op: ">=", value: 6 },
      { source: "behavior", key: "curiosity", op: ">=", value: 4 },
      { source: "trait", key: "skinType", op: "=", value: "skin" },
    ],
  },
  {
    abilityKey: "TEMPORAL_REFLEXES",
    chance: 0.083,
    priority: 70,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "agility", op: ">=", value: 8 },
      { source: "stat", key: "perception", op: ">=", value: 7 },
      { source: "stat", key: "psychic", op: ">=", value: 6 },
    ],
  },
  {
    abilityKey: "MIRROR_FUR",
    chance: 0.084,
    priority: 60,
    exclusiveGroup: null,
    conditions: [
      { source: "trait", key: "skinType", op: "=", value: "scales" },
      { source: "resistance", key: "fire", op: ">=", value: 50 },
      { source: "stat", key: "endurance", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "VOID_STEP",
    chance: 0.15,
    priority: 85,
    exclusiveGroup: "movement",
    conditions: [
      { source: "stat", key: "psychic", op: ">=", value: 9 },
      { source: "stat", key: "intelligence", op: ">=", value: 6 },
      { source: "behavior", key: "chaos", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "PHEROMONE_CLOUD",
    chance: 0.085,
    priority: 50,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "intelligence", op: ">=", value: 5 },
      { source: "behavior", key: "loyalty", op: ">=", value: 4 },
      { source: "trait", key: "skinType", op: "in", value: ["fur", "skin"] },
    ],
  },
  {
    abilityKey: "REGENERATIVE_PURR",
    chance: 0.086,
    priority: 55,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "endurance", op: ">=", value: 7 },
      { source: "resistance", key: "poison", op: ">=", value: 40 },
      { source: "behavior", key: "aggression", op: "<=", value: 5 },
    ],
  },
  {
    abilityKey: "MAGNETIC_PAWS",
    chance: 0.084,
    priority: 50,
    exclusiveGroup: null,
    conditions: [
      { source: "trait", key: "hasClaws", op: "=", value: true },
      { source: "stat", key: "intelligence", op: ">=", value: 5 },
      { source: "stat", key: "strength", op: ">=", value: 4 },
    ],
  },
  {
    abilityKey: "ECHOLOCATION_MEOW",
    chance: 0.086,
    priority: 45,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "perception", op: ">=", value: 7 },
      { source: "trait", key: "eyes", op: "<=", value: 2 },
    ],
  },
  {
    abilityKey: "CHROMATIC_SHIFT",
    chance: 0.085,
    priority: 40,
    exclusiveGroup: null,
    conditions: [
      { source: "trait", key: "skinType", op: "in", value: ["skin", "scales"] },
      { source: "stat", key: "intelligence", op: ">=", value: 4 },
      { source: "behavior", key: "curiosity", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "TAIL_WHIP_VORTEX",
    chance: 0.085,
    priority: 55,
    exclusiveGroup: null,
    conditions: [
      { source: "trait", key: "tails", op: ">=", value: 1 },
      { source: "stat", key: "strength", op: ">=", value: 6 },
      { source: "stat", key: "agility", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "QUANTUM_UNCERTAINTY",
    chance: 0.082,
    priority: 80,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "psychic", op: ">=", value: 9 },
      { source: "stat", key: "agility", op: ">=", value: 7 },
      { source: "behavior", key: "chaos", op: ">=", value: 8 },
    ],
  },
  {
    abilityKey: "PLASMA_BREATH",
    chance: 0.083,
    priority: 70,
    exclusiveGroup: "elemental",
    conditions: [
      { source: "resistance", key: "fire", op: ">=", value: 85 },
      { source: "stat", key: "strength", op: ">=", value: 6 },
      { source: "stat", key: "endurance", op: ">=", value: 7 },
    ],
  },
  {
    abilityKey: "NEURAL_LINK",
    chance: 0.084,
    priority: 60,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "psychic", op: ">=", value: 7 },
      { source: "behavior", key: "loyalty", op: ">=", value: 7 },
      { source: "stat", key: "intelligence", op: ">=", value: 6 },
    ],
  },
  {
    abilityKey: "SHADOW_MELD",
    chance: 0.085,
    priority: 55,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "agility", op: ">=", value: 6 },
      { source: "stat", key: "perception", op: ">=", value: 5 },
      {
        source: "trait",
        key: "colour",
        op: "in",
        value: ["black", "dark grey", "midnight blue"],
      },
    ],
  },
  {
    abilityKey: "OSMOTIC_CONSUMPTION",
    chance: 0.084,
    priority: 50,
    exclusiveGroup: null,
    conditions: [
      { source: "trait", key: "skinType", op: "=", value: "skin" },
      { source: "stat", key: "endurance", op: ">=", value: 6 },
      { source: "resistance", key: "acid", op: ">=", value: 50 },
    ],
  },
  {
    abilityKey: "ANTIMATTER_CLAWS",
    chance: 0.081,
    priority: 90,
    exclusiveGroup: null,
    conditions: [
      { source: "trait", key: "hasClaws", op: "=", value: true },
      { source: "stat", key: "strength", op: ">=", value: 8 },
      { source: "resistance", key: "radiation", op: ">=", value: 90 },
      { source: "stat", key: "psychic", op: ">=", value: 7 },
    ],
  },
  {
    abilityKey: "REALITY_ANCHOR",
    chance: 0.083,
    priority: 65,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "intelligence", op: ">=", value: 7 },
      { source: "stat", key: "psychic", op: ">=", value: 6 },
      { source: "behavior", key: "chaos", op: "<=", value: 3 },
    ],
  },
  {
    abilityKey: "SWARM_CONSCIOUSNESS",
    chance: 0.25,
    priority: 75,
    exclusiveGroup: "mental",
    conditions: [
      { source: "stat", key: "psychic", op: ">=", value: 8 },
      { source: "stat", key: "intelligence", op: ">=", value: 7 },
      { source: "behavior", key: "loyalty", op: ">=", value: 5 },
    ],
  },
  {
    abilityKey: "CRYOGENIC_EXHALE",
    chance: 0.084,
    priority: 60,
    exclusiveGroup: "elemental",
    conditions: [
      { source: "resistance", key: "cold", op: ">=", value: 85 },
      { source: "stat", key: "endurance", op: ">=", value: 6 },
    ],
  },
  {
    abilityKey: "PHOTOSYNTHETIC_FUR",
    chance: 0.085,
    priority: 45,
    exclusiveGroup: null,
    conditions: [
      { source: "trait", key: "skinType", op: "in", value: ["fur", "skin"] },
      { source: "stat", key: "endurance", op: ">=", value: 5 },
      { source: "behavior", key: "aggression", op: "<=", value: 4 },
    ],
  },
  {
    abilityKey: "BLOOD_SCENT_TRACKING",
    chance: 0.087,
    priority: 50,
    exclusiveGroup: null,
    conditions: [
      { source: "stat", key: "perception", op: ">=", value: 8 },
      { source: "behavior", key: "aggression", op: ">=", value: 6 },
    ],
  },
];

async function populateAbilities() {
  try {
    console.log("\n==============================================");
    console.log("   Alien Cat - Populate Abilities Script");
    console.log("==============================================\n");

    const client = await clientPromise;
    const db = client.db("axiom");
    const abilitiesCollection = db.collection("abilities");
    const rulesCollection = db.collection("abilityRules");

    console.log("Step 1: Clearing existing data...");
    await abilitiesCollection.deleteMany({});
    await rulesCollection.deleteMany({});
    console.log("✓ Existing data cleared\n");

    console.log("Step 2: Inserting abilities...");
    const abilitiesWithTimestamp = ABILITIES_DATA.map((ability) => ({
      ...ability,
      createdAt: new Date(),
    }));

    const abilityResult = await abilitiesCollection.insertMany(
      abilitiesWithTimestamp
    );
    console.log(`✓ Inserted ${abilityResult.insertedCount} abilities\n`);

    console.log("Step 3: Mapping ability keys to ObjectIds...");
    const abilityMap = new Map<string, ObjectId>();
    const insertedAbilities = await abilitiesCollection.find({}).toArray();
    insertedAbilities.forEach((ability) => {
      abilityMap.set(ability.key, ability._id);
    });
    console.log(`✓ Mapped ${abilityMap.size} abilities\n`);

    console.log("Step 4: Inserting ability rules...");
    const rulesWithAbilityIds = ABILITY_RULES_DATA.map((rule) => {
      const abilityId = abilityMap.get(rule.abilityKey);
      if (!abilityId) {
        throw new Error(`Ability key not found: ${rule.abilityKey}`);
      }

      return {
        abilityId,
        chance: rule.chance,
        conditions: rule.conditions,
        priority: rule.priority,
        exclusiveGroup: rule.exclusiveGroup,
        createdAt: new Date(),
      };
    });

    const rulesResult = await rulesCollection.insertMany(rulesWithAbilityIds);
    console.log(`✓ Inserted ${rulesResult.insertedCount} ability rules\n`);

    console.log("==============================================");
    console.log("Summary:");
    console.log(`  Abilities: ${abilityResult.insertedCount}`);
    console.log(`  Rules: ${rulesResult.insertedCount}`);
    console.log("==============================================");
    console.log("\n✅ Success! Ability data populated");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

populateAbilities();
