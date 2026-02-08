import { ObjectId } from "mongodb";

export interface ICart {
  _id?: ObjectId;
  userId: ObjectId;
  catAlienId: ObjectId;
  addedAt: Date;
}