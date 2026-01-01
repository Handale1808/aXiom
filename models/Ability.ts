import { ObjectId } from "mongodb";

export interface IAbility {
  _id?: ObjectId;
  key: string;
  name: string;
  description: string;
  isPassive: boolean;
  createdAt: Date;
}