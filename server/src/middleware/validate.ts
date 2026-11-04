import type { RequestHandler } from 'express';
import type { z } from 'zod';

type Schemas = {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
};

/**
 * Validate and coerce request input. The parsed body replaces `req.body`;
 * parsed params and query go to `res.locals` because Express 5 makes
 * `req.query` read-only. Zod errors are turned into 400s by the error handler.
 */
export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, res, next) => {
    if (schemas.params) res.locals.params = schemas.params.parse(req.params);
    if (schemas.query) res.locals.query = schemas.query.parse(req.query);
    if (schemas.body) req.body = schemas.body.parse(req.body ?? {});
    next();
  };
