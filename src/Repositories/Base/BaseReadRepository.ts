import { Document, FilterQuery, Model } from "mongoose";
import { IReadInterface } from "../../types/Base/IreadInterface";

export class BaseReadRepository<T extends Document>
  implements IReadInterface<T>
{
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    return this.model.findOne(filter as FilterQuery<T>).exec();
  }
}
