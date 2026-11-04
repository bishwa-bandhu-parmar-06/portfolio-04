import { Router, type RequestHandler } from 'express';
import { authRouter } from '../controllers/auth.controller';
import {
  certificationsRouter,
  codingProfilesRouter,
  educationRouter,
  experienceRouter,
  projectsRouter,
  resumesRouter,
  skillGroupsRouter,
  socialLinksRouter,
} from '../controllers/content.controller';
import { getDashboard } from '../controllers/dashboard.controller';
import { messagesRouter } from '../controllers/messages.controller';
import { publicRouter } from '../controllers/public.controller';
import { settingsRouter } from '../controllers/settings.controller';
import { uploadsRouter } from '../controllers/uploads.controller';
import { requireAuth } from '../middleware/auth';
import { contentChanged } from '../services/revalidate.service';

/** After a successful write to public content, refresh the site's cache. */
const refreshOnWrite: RequestHandler = (req, res, next) => {
  if (req.method !== 'GET') {
    res.on('finish', () => {
      if (res.statusCode < 400) contentChanged();
    });
  }
  next();
};

const admin = Router();
admin.use(requireAuth);
admin.get('/dashboard', getDashboard);
admin.use('/messages', messagesRouter);
admin.use('/uploads', uploadsRouter);
admin.use('/settings', refreshOnWrite, settingsRouter);
admin.use('/projects', refreshOnWrite, projectsRouter);
admin.use('/resumes', refreshOnWrite, resumesRouter);
admin.use('/social-links', refreshOnWrite, socialLinksRouter);
admin.use('/experience', refreshOnWrite, experienceRouter);
admin.use('/skill-groups', refreshOnWrite, skillGroupsRouter);
admin.use('/education', refreshOnWrite, educationRouter);
admin.use('/certifications', refreshOnWrite, certificationsRouter);
admin.use('/coding-profiles', refreshOnWrite, codingProfilesRouter);

export const apiRouter = Router();
apiRouter.use('/public', publicRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/admin', admin);
