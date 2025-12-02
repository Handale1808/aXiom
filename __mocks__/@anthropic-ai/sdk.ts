export class Anthropic {
  messages = {
    create: jest.fn(),
  };

  constructor(config?: { apiKey?: string }) {
    // Mock constructor does nothing
  }
}

export default Anthropic;