import dotenv from 'dotenv';
dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  // Comma-separated list of allowed client origins for CORS. Empty = allow all (dev).
  clientUrl: process.env.CLIENT_URL || '',
  // Seed accounts. Passwords are optional — if not set, that user is skipped.
  seedOwnerUsername: process.env.SEED_OWNER_USERNAME || 'simon',
  seedOwnerPassword: process.env.SEED_OWNER_PASSWORD || null,
  seedStaffUsername: process.env.SEED_STAFF_USERNAME || 'daniel',
  seedStaffPassword: process.env.SEED_STAFF_PASSWORD || null,
};
