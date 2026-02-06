import clientPromise from "../mongodb.ts";
import { IUser } from "../../models/User";
import { withDatabaseLogging } from "../databaseLogger";

export async function findUserByEmail(
  email: string,
  requestId?: string
): Promise<IUser | null> {
  return withDatabaseLogging(
    async () => {
      const client = await clientPromise;
      const db = client.db("axiom");
      const users = db.collection<IUser>("users");

      const user = await users.findOne({ email });
      return user;
    },
    {
      operation: "findOne",
      collection: "users",
      requestId,
      filter: { email },
    }
  );
}

export async function createUser(
  userData: Omit<IUser, "_id">,
  requestId?: string
): Promise<IUser> {
  return withDatabaseLogging(
    async () => {
      const client = await clientPromise;
      const db = client.db("axiom");
      const users = db.collection<IUser>("users");

      const result = await users.insertOne(userData as IUser);
      
      return {
        _id: result.insertedId,
        ...userData,
      };
    },
    {
      operation: "insertOne",
      collection: "users",
      requestId,
    }
  );
}