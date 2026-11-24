import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: (process.env.PORT && process.env.PORT !== '8080') ? parseInt(process.env.PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'darkvence_secure_jwt_secret_dev_key_2026_xyz',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: 'darkvence_token',
  mongoUri: process.env.MONGODB_URI || process.env.DATABASE_URL || '',
  adminEmail: process.env.ADMIN_EMAIL || process.env.INITIAL_ADMIN_EMAIL || 'admin@darkvence.com',
  adminPassword: process.env.ADMIN_PASSWORD || process.env.INITIAL_ADMIN_PASSWORD || 'darkvence2026!',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  }
};
