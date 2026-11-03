import { Router, type RequestHandler } from 'express';
import { trusted } from 'mongoose';
import { validate } from '../middleware/validate';
import { Message } from '../models';
import { notifyNewMessage } from '../services/mail.service';
import { idParams } from '../validators/common';
import { contactBody, messageListQuery, messageUpdate } from '../validators/message';
import { notFound } from '../utils/errors';
import { escapeRegex, hashIp } from '../utils/strings';

/** Public: POST /api/public/contact */
export const submitContact: RequestHandler[] = [
  validate({ body: contactBody }),
  async (req, res) => {
    const { website, ...fields } = req.body;

    // Bots that fill the hidden field get the same success response, but nothing is stored or sent.
    if (website) {
      res.status(201).json({ ok: true });
      return;
    }

    await Message.create({
      ...fields,
      ipHash: hashIp(req.ip),
      userAgent: String(req.get('user-agent') ?? '').slice(0, 300),
    });
    void notifyNewMessage(fields);
    res.status(201).json({ ok: true });
  },
];

/** Admin inbox: /api/admin/messages */
export const messagesRouter = Router();

messagesRouter.get('/', validate({ query: messageListQuery }), async (_req, res) => {
  const { q, status, page, limit } = res.locals.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) {
    const pattern = trusted({ $regex: escapeRegex(q), $options: 'i' });
    filter.$or = [{ name: pattern }, { email: pattern }, { subject: pattern }, { message: pattern }];
  }

  const [items, total, unread] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Message.countDocuments(filter),
    Message.countDocuments({ status: 'unread' }),
  ]);

  res.json({ items, total, unread, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

messagesRouter.get('/:id', validate({ params: idParams }), async (_req, res) => {
  const item = await Message.findById(res.locals.params.id).lean();
  if (!item) throw notFound('Message not found');
  res.json({ item });
});

messagesRouter.patch('/:id', validate({ params: idParams, body: messageUpdate }), async (req, res) => {
  const { status } = req.body;
  const item = await Message.findByIdAndUpdate(
    res.locals.params.id,
    { $set: { status, repliedAt: status === 'replied' ? new Date() : null } },
    { new: true },
  ).lean();
  if (!item) throw notFound('Message not found');
  res.json({ item });
});

messagesRouter.delete('/:id', validate({ params: idParams }), async (_req, res) => {
  const item = await Message.findByIdAndDelete(res.locals.params.id);
  if (!item) throw notFound('Message not found');
  res.status(204).end();
});
