import { ObjectId } from "mongodb";

export interface IPurchase {
  _id?: ObjectId;
  userId: ObjectId;
  catAlienId: ObjectId;
  purchasedAt: Date;
  price: number;
}