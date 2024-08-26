export interface IReadInterface<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  findOne(filter: Partial<T>): Promise<T | null>;
}
