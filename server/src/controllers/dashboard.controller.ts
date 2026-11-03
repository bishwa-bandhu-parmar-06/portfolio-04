import type { RequestHandler } from 'express';
import { Certification, Experience, Message, Project, Resume, getSettings } from '../models';

/** GET /api/admin/dashboard */
export const getDashboard: RequestHandler = async (_req, res) => {
  const [settings, projects, visibleProjects, experience, certifications, resumes, unread, totalMessages, latest] =
    await Promise.all([
      getSettings(),
      Project.countDocuments(),
      Project.countDocuments({ visible: true }),
      Experience.countDocuments(),
      Certification.countDocuments(),
      Resume.countDocuments(),
      Message.countDocuments({ status: 'unread' }),
      Message.countDocuments(),
      Message.find().sort({ createdAt: -1 }).limit(5).select('name subject status createdAt').lean(),
    ]);

  res.json({
    counts: { projects, visibleProjects, experience, certifications, resumes, unreadMessages: unread, totalMessages },
    lastUpdatedAt: settings.contentUpdatedAt,
    latestMessages: latest,
  });
};
