import { Router } from 'express';
import type { HydratedDocument, Model } from 'mongoose';
import type { z } from 'zod';
import { validate } from '../middleware/validate';
import type { Media } from '../models';
import { cleanupMedia, removedMedia } from '../services/media.service';
import { idParams, reorderBody } from '../validators/common';
import { notFound } from '../utils/errors';

type Body = Record<string, unknown>;

export interface CrudOptions<T> {
  model: Model<T>;
  createSchema: z.ZodType<Body>;
  updateSchema: z.ZodType<Body>;
  /** Defaults to `{ order: 1, createdAt: 1 }`. */
  sort?: Record<string, 1 | -1>;
  /** Uploaded files a document owns, so they can be removed from Cloudinary when replaced or deleted. */
  mediaOf?: (doc: T) => (Media | null | undefined)[];
  /** Fill derived fields (e.g. slug) before saving. */
  prepare?: (body: Body, existing?: HydratedDocument<T>) => Body | Promise<Body>;
  afterWrite?: (doc: HydratedDocument<T>) => Promise<void>;
  afterDelete?: (doc: HydratedDocument<T>) => Promise<void>;
}

/**
 * Standard admin endpoints for an orderable collection:
 * GET /, GET /:id, POST /, PATCH /reorder, PATCH /:id, DELETE /:id
 */
export function crudRouter<T>(opts: CrudOptions<T>): Router {
  const { model, mediaOf } = opts;
  const sort = opts.sort ?? { order: 1, createdAt: 1 };
  const router = Router();

  router.get('/', async (_req, res) => {
    const items = await model.find().sort(sort).lean();
    res.json({ items });
  });

  router.get('/:id', validate({ params: idParams }), async (_req, res) => {
    const item = await model.findById(res.locals.params.id).lean();
    if (!item) throw notFound();
    res.json({ item });
  });

  router.post('/', validate({ body: opts.createSchema }), async (req, res) => {
    let body: Body = req.body;
    if (opts.prepare) body = await opts.prepare(body);
    if (body.order === undefined) body.order = await model.countDocuments();
    const doc = (await model.create(body)) as HydratedDocument<T>;
    if (opts.afterWrite) await opts.afterWrite(doc);
    res.status(201).json({ item: doc.toObject() });
  });

  router.patch('/reorder', validate({ body: reorderBody }), async (req, res) => {
    const ids: string[] = req.body.ids;
    await model.bulkWrite(
      ids.map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { $set: { order: index } } },
      })) as Parameters<typeof model.bulkWrite>[0],
    );
    const items = await model.find().sort(sort).lean();
    res.json({ items });
  });

  router.patch('/:id', validate({ params: idParams, body: opts.updateSchema }), async (req, res) => {
    const doc = (await model.findById(res.locals.params.id)) as HydratedDocument<T> | null;
    if (!doc) throw notFound();

    const before = mediaOf ? mediaOf(doc.toObject() as T) : [];
    let body: Body = req.body;
    if (opts.prepare) body = await opts.prepare(body, doc);
    doc.set(body);
    await doc.save();

    if (mediaOf) cleanupMedia(removedMedia(before, mediaOf(doc.toObject() as T)));
    if (opts.afterWrite) await opts.afterWrite(doc);
    res.json({ item: doc.toObject() });
  });

  router.delete('/:id', validate({ params: idParams }), async (_req, res) => {
    const doc = (await model.findByIdAndDelete(res.locals.params.id)) as HydratedDocument<T> | null;
    if (!doc) throw notFound();
    if (mediaOf) cleanupMedia(mediaOf(doc.toObject() as T));
    if (opts.afterDelete) await opts.afterDelete(doc);
    res.status(204).end();
  });

  return router;
}
