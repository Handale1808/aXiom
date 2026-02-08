import { ObjectId } from "mongodb";

export interface ICatAlienAbility {
  _id?: ObjectId;
  catAlienId: ObjectId;
  abilityId: ObjectId;
  roll: number;
  acquiredAt: Date;
}