import { ObjectId } from "mongodb";

export interface ICart {
  _id?: ObjectId;
  userId: ObjectId;
  catId: ObjectId;
  addedAt: Date;
}