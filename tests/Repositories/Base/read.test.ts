import { Model, Document } from "mongoose";
import { BaseReadRepository } from "../../../src/Repositories/Base/BaseReadRepository"; // Adjust the path as needed

interface MockDocument extends Document {
  _id: string;
  name: string;
}

const mockModel = {
    findById: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
} as unknown as jest.Mocked<Model<MockDocument>>;

describe("BaseReadRepository", () => {
  let repository: BaseReadRepository<MockDocument>;

  beforeEach(() => {
    repository = new BaseReadRepository<MockDocument>(mockModel);
    jest.clearAllMocks();
  });

  it("findById should return the correct document", async () => {
    const mockDocument = { _id: "1", name: "Test" } as MockDocument;
    mockModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockDocument),
    } as any);

    const result = await repository.findById("1");
    expect(mockModel.findById).toHaveBeenCalledWith("1");
    expect(result).toEqual(mockDocument);
  });

  it("findAll should return all documents", async () => {
    const mockDocuments = [
      { _id: "1", name: "Test1" },
      { _id: "2", name: "Test2" },
    ] as MockDocument[];
    mockModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockDocuments),
    } as any);

    const result = await repository.findAll();
    expect(mockModel.find).toHaveBeenCalled();
    expect(result).toEqual(mockDocuments);
  });

  it("findOne should return the correct document based on filter", async () => {
    const mockDocument = { _id: "1", name: "Test" } as MockDocument;
    const filter = { name: "Test" } as Partial<MockDocument>;
    mockModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockDocument),
    } as any);

    const result = await repository.findOne(filter);
    expect(mockModel.findOne).toHaveBeenCalledWith(filter);
    expect(result).toEqual(mockDocument);
  });
});
