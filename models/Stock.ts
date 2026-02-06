import { ObjectId } from "mongodb";

export interface IStock {
  _id?: ObjectId;
  catId: ObjectId;
  addedAt: Date;
  removedAt?: Date | null;
}