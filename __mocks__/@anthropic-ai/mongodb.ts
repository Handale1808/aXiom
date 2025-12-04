const mockCollection = {
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
};

const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection),
};

const mockClient = {
  db: jest.fn().mockReturnValue(mockDb),
};

const clientPromise = Promise.resolve(mockClient);

export default clientPromise;
export { mockCollection, mockDb, mockClient };
