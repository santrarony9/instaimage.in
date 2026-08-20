import { Logger, NotFoundException } from '@nestjs/common';
import {
  Model,
  UpdateQuery,
  SaveOptions,
  ClientSession,
  HydratedDocument,
  Types,
} from 'mongoose';
import { AbstractDocument } from './abstract.document';

// Mongoose v9 removed/renamed FilterQuery, so we use a flexible Record type
type FilterQuery<T> = Record<string, any>;

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(public readonly model: Model<TDocument>) {}

  async create(
    document: Partial<TDocument>,
    options?: SaveOptions,
  ): Promise<HydratedDocument<TDocument>> {
    const createdDocument = new this.model({
      ...document,
    });
    return (await createdDocument.save(options)) as HydratedDocument<TDocument>;
  }

  async findById(
    id: string,
    projection?: Record<string, number | boolean | string>,
    session?: ClientSession,
  ): Promise<HydratedDocument<TDocument> | null> {
    return this.model
      .findOne(
        {
          _id: new Types.ObjectId(id),
          isDeleted: false,
        } as FilterQuery<TDocument>,
        projection,
      )
      .session(session || null)
      .exec() as Promise<HydratedDocument<TDocument> | null>;
  }

  async findOne(
    filterQuery: FilterQuery<TDocument>,
    projection?: Record<string, number | boolean | string>,
    session?: ClientSession,
  ): Promise<HydratedDocument<TDocument> | null> {
    const doc = await this.model
      .findOne(
        { ...filterQuery, isDeleted: false } as FilterQuery<TDocument>,
        projection,
      )
      .session(session || null)
      .exec();
    return doc as HydratedDocument<TDocument> | null;
  }

  async findOneOrFail(
    filterQuery: FilterQuery<TDocument>,
    projection?: Record<string, number | boolean | string>,
    session?: ClientSession,
  ): Promise<HydratedDocument<TDocument>> {
    const doc = await this.findOne(filterQuery, projection, session);
    if (!doc) {
      this.logger.warn(
        `Entity not found with filter: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('Requested resource was not found');
    }
    return doc;
  }

  async find(
    filterQuery: FilterQuery<TDocument>,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
    skip = 0,
    limit = 20,
    session?: ClientSession,
  ): Promise<HydratedDocument<TDocument>[]> {
    return this.model
      .find({ ...filterQuery, isDeleted: false } as FilterQuery<TDocument>)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .session(session || null)
      .exec() as Promise<HydratedDocument<TDocument>[]>;
  }

  async findAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    session?: ClientSession,
  ): Promise<HydratedDocument<TDocument> | null> {
    return this.model
      .findOneAndUpdate(
        { ...filterQuery, isDeleted: false } as FilterQuery<TDocument>,
        update,
        { new: true },
      )
      .session(session || null)
      .exec() as Promise<HydratedDocument<TDocument> | null>;
  }

  /** Alias for findAndUpdate — used by service layer */
  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    session?: ClientSession,
  ): Promise<HydratedDocument<TDocument> | null> {
    return this.findAndUpdate(filterQuery, update, session);
  }

  /** Convenience: update by string id */
  async update(
    id: string,
    update: UpdateQuery<TDocument>,
    session?: ClientSession,
  ): Promise<HydratedDocument<TDocument> | null> {
    return this.findAndUpdate({ _id: new Types.ObjectId(id) }, update, session);
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
    session?: ClientSession,
  ): Promise<boolean> {
    return this.softDelete(filterQuery, session);
  }

  async softDelete(
    filterQuery: FilterQuery<TDocument>,
    session?: ClientSession,
  ): Promise<boolean> {
    const res = await this.model
      .updateOne(
        { ...filterQuery, isDeleted: false } as FilterQuery<TDocument>,
        { isDeleted: true, deletedAt: new Date() },
      )
      .session(session || null)
      .exec();
    return res.modifiedCount > 0;
  }

  async countDocuments(
    filterQuery: FilterQuery<TDocument> = {},
  ): Promise<number> {
    return this.model
      .countDocuments({
        ...filterQuery,
        isDeleted: false,
      } as FilterQuery<TDocument>)
      .exec();
  }
}
