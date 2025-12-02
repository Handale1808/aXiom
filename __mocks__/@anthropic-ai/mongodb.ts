export class MongoClient {
  connect = jest.fn().mockResolvedValue(this);
  
  db = jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      insertOne: jest.fn(),
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      countDocuments: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    }),
  });
}