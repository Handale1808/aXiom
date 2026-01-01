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
 //redo
]

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
