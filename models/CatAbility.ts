import { ObjectId } from "mongodb";

export interface ICatAbility {
  _id?: ObjectId;
  catId: ObjectId;
  abilityId: ObjectId;
  roll: number;
  acquiredAt: Date;
}