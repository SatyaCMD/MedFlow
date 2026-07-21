/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export abstract class BaseRepository<T extends Document> {
  protected constructor(protected readonly model: Model<T>) {}

  // Scopes the query to ensure hospitalId matches the request context
  protected scopeQuery(query: FilterQuery<T>, hospitalId: string): FilterQuery<T> {
    return {
      ...query,
      hospitalId,
      deletedAt: null,
    } as FilterQuery<T>;
  }

  async findById(id: string, hospitalId: string): Promise<T | null> {
    const filter = this.scopeQuery({ _id: id } as FilterQuery<T>, hospitalId);
    return this.model.findOne(filter).lean().exec() as Promise<T | null>;
  }

  async findOne(filter: FilterQuery<T>, hospitalId: string): Promise<T | null> {
    const scopedFilter = this.scopeQuery(filter, hospitalId);
    return this.model.findOne(scopedFilter).lean().exec() as Promise<T | null>;
  }

  async create(data: Partial<T>, hospitalId: string): Promise<T> {
    const docData = { ...data, hospitalId } as unknown as T;
    const document = new this.model(docData);
    return (await document.save()) as T;
  }

  async update(id: string, data: UpdateQuery<T>, hospitalId: string): Promise<T | null> {
    const filter = this.scopeQuery({ _id: id } as FilterQuery<T>, hospitalId);
    return this.model.findOneAndUpdate(filter, data, { new: true }).lean().exec() as Promise<T | null>;
  }

  async softDelete(id: string, hospitalId: string): Promise<T | null> {
    const filter = this.scopeQuery({ _id: id } as FilterQuery<T>, hospitalId);
    const updateData = { deletedAt: new Date() } as unknown as UpdateQuery<T>;
    return this.model.findOneAndUpdate(filter, updateData, { new: true }).lean().exec() as Promise<T | null>;
  }

  async paginate(
    filter: FilterQuery<T>,
    options: PaginationOptions,
    hospitalId: string
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 20);
    const skip = (page - 1) * limit;

    const scopedFilter = this.scopeQuery(filter, hospitalId);

    const sortField = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortOrder } as { [key: string]: 1 | -1 };

    const [items, total] = await Promise.all([
      this.model.find(scopedFilter).sort(sortOptions).skip(skip).limit(limit).lean().exec() as Promise<T[]>,
      this.model.countDocuments(scopedFilter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}

