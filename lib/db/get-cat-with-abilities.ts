import { ObjectId } from "mongodb";
import clientPromise from "../mongodb.ts";
import { ICatAlien } from "../../models/CatAliens.ts";
import { IAbilityRule } from "../../models/AbilityRules";
import { ICatAlienAbility } from "../../models/CatAlienAbility.ts";

export async function getCatWithAbilities(catAlienId: ObjectId): Promise<{
  cat: ICatAlien | null;
  abilities: Array<{
    ability: IAbilityRule;
    catAbility: ICatAlienAbility;
  }>;
}> {
  const client = await clientPromise;
  const db = client.db("axiom");
  const catsCollection = db.collection("cats");
  const catAlienAbilitiesCollection = db.collection("catAlienAbilities");
  const abilitiesCollection = db.collection("abilities");

  const cat = await catsCollection.findOne({ _id: catAlienId }) as unknown as ICatAlien | null;

  if (!cat) {
    return { cat: null, abilities: [] };
  }

  const catAlienAbilities = await catAlienAbilitiesCollection
    .find({ catAlienId })
    .toArray() as unknown as ICatAlienAbility[];

  const abilityIds = catAlienAbilities.map((ca) => ca.abilityId);

  const abilities = await abilitiesCollection
    .find({ _id: { $in: abilityIds } })
    .toArray() as unknown as IAbilityRule[];

  const abilityMap = new Map<string, IAbilityRule>();
  abilities.forEach((ability) => {
    abilityMap.set(ability._id!.toString(), ability);
  });

  const populatedAbilities = catAlienAbilities.map((catAbility) => {
    const ability = abilityMap.get(catAbility.abilityId.toString());
    return {
      ability: ability!,
      catAbility,
    };
  });

  return {
    cat,
    abilities: populatedAbilities,
  };
}