// Empty storage file - ready for your custom implementation

export interface IStorage {
  // Add your storage methods here
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize your storage here
  }
}

export const storage = new MemStorage();
