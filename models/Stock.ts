import { ObjectId } from "mongodb";

export interface IStock {
  _id?: ObjectId;
  catAlienId: ObjectId;
  addedAt: Date;
  removedAt?: Date | null;
}