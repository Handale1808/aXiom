import { ObjectId } from "mongodb";

export interface IPurchase {
  _id?: ObjectId;
  userId: ObjectId;
  catId: ObjectId;
  purchasedAt: Date;
  price: number;
}