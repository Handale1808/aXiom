import { ObjectId } from "mongodb";
import clientPromise from "../mongodb.ts";
import { ICat } from "../../models/Cats";
import { IAbilityRule } from "../../models/AbilityRules";
import { ICatAbility } from "../../models/CatAbility";

export async function getCatWithAbilities(catId: ObjectId): Promise<{
  cat: ICat | null;
  abilities: Array<{
    ability: IAbilityRule;
    catAbility: ICatAbility;
  }>;
}> {
  const client = await clientPromise;
  const db = client.db("axiom");
  const catsCollection = db.collection("cats");
  const catAbilitiesCollection = db.collection("catAbilities");
  const abilitiesCollection = db.collection("abilities");

  const cat = await catsCollection.findOne({ _id: catId }) as unknown as ICat | null;

  if (!cat) {
    return { cat: null, abilities: [] };
  }

  const catAbilities = await catAbilitiesCollection
    .find({ catId })
    .toArray() as unknown as ICatAbility[];

  const abilityIds = catAbilities.map((ca) => ca.abilityId);

  const abilities = await abilitiesCollection
    .find({ _id: { $in: abilityIds } })
    .toArray() as unknown as IAbilityRule[];

  const abilityMap = new Map<string, IAbilityRule>();
  abilities.forEach((ability) => {
    abilityMap.set(ability._id!.toString(), ability);
  });

  const populatedAbilities = catAbilities.map((catAbility) => {
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