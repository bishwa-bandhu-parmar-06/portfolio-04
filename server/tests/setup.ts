// Runs before each test file, ahead of any app imports that read the environment.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI ??= 'mongodb://placeholder/test';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256-signing';
process.env.CLIENT_ORIGINS = 'http://localhost:3000';
process.env.CLOUDINARY_CLOUD_NAME = '';
process.env.RESEND_API_KEY = '';
