import { ObjectId } from "mongodb";

export interface IUser {
  _id?: ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
}