import { ObjectId } from "mongodb";

export interface ISettings {
  _id?: ObjectId;
  key: string;
  value: number;
  updatedAt: Date;
  updatedBy: ObjectId | null;
}