import { Router } from 'express';
import { validate } from '../middleware/validate';
import { getSettings } from '../models';
import { cleanupMedia, removedMedia } from '../services/media.service';
import { profileBody, sectionsBody, seoBody, statsBody, themeBody } from '../validators/settings';

export const settingsRouter = Router();

settingsRouter.get('/', async (_req, res) => {
  const settings = await getSettings();
  res.json({ settings: settings.toObject() });
});

settingsRouter.patch('/profile', validate({ body: profileBody }), async (req, res) => {
  const settings = await getSettings();
  const oldPhoto = settings.profile.photo;
  for (const [key, value] of Object.entries(req.body)) settings.set(`profile.${key}`, value);
  await settings.save();
  cleanupMedia(removedMedia([oldPhoto], [settings.profile.photo]));
  res.json({ settings: settings.toObject() });
});

settingsRouter.patch('/stats', validate({ body: statsBody }), async (req, res) => {
  const settings = await getSettings();
  settings.set('stats', req.body.stats);
  await settings.save();
  res.json({ settings: settings.toObject() });
});

settingsRouter.patch('/sections', validate({ body: sectionsBody }), async (req, res) => {
  const settings = await getSettings();
  for (const [key, value] of Object.entries(req.body)) settings.set(`sections.${key}`, value);
  await settings.save();
  res.json({ settings: settings.toObject() });
});

settingsRouter.patch('/theme', validate({ body: themeBody }), async (req, res) => {
  const settings = await getSettings();
  for (const [key, value] of Object.entries(req.body)) settings.set(`theme.${key}`, value);
  await settings.save();
  res.json({ settings: settings.toObject() });
});

settingsRouter.patch('/seo', validate({ body: seoBody }), async (req, res) => {
  const settings = await getSettings();
  const oldImage = settings.seo.ogImage;
  for (const [key, value] of Object.entries(req.body)) settings.set(`seo.${key}`, value);
  await settings.save();
  cleanupMedia(removedMedia([oldImage], [settings.seo.ogImage]));
  res.json({ settings: settings.toObject() });
});
