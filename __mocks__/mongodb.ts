// __mocks__/mongodb.ts

export class MongoClient {
  private uri: string;
  private options: any;

  constructor(uri: string, options?: any) {
    this.uri = uri;
    this.options = options;
  }

  connect(): Promise<MongoClient> {
    return Promise.resolve(this);
  }

  close(): Promise<void> {
    return Promise.resolve();
  }

  db(name?: string) {
    return {
      admin: () => ({
        ping: () => Promise.resolve({ ok: 1 })
      })
    };
  }
}

export default {
  MongoClient,
};