const mockCreate = jest.fn();

export class Anthropic {
  messages = {
    create: mockCreate,
  };

  constructor(config?: { apiKey?: string }) {
    // Mock constructor
  }
}

export default Anthropic;