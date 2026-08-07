import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load single master .env file from workspace root
const cwd = process.cwd();
const possibleEnvPaths = [
  path.resolve(cwd, '.env'),
  path.resolve(cwd, '../../.env'),
  path.resolve(cwd, '../.env'),
  path.resolve(cwd, '../../../.env'),
];

let loaded = false;
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    loaded = true;
    break;
  }
}
if (!loaded) {
  dotenv.config();
}

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().url('MONGO_URI must be a valid connection string'),
  REDIS_URI: z.string().url('REDIS_URI must be a valid connection string'),
  JWT_ACCESS_SECRET: z.string().min(8, 'JWT_ACCESS_SECRET must be configured'),
  JWT_REFRESH_SECRET: z.string().min(8, 'JWT_REFRESH_SECRET must be configured'),
  APP_PEPPER: z.string().min(8, 'APP_PEPPER must be configured'),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1026),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(''),
  AWS_S3_KYC_BUCKET: z.string().default('medflow-kyc-documents-production'),
  AWS_S3_MEDICAL_RECORDS_BUCKET: z.string().default('medflow-medical-records-production-5a724c78'),
  SUPER_ADMIN_EMAIL: z.string().email().default('superadmin54@gmail.com'),
  SUPER_ADMIN_PASSWORD: z.string().min(8, 'SUPER_ADMIN_PASSWORD must be at least 8 characters').default('Admin@321'),
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  ENABLE_KAFKA: z.string().optional().transform((val) => val === 'true').default('false'),
  RABBITMQ_URI: z.string().default('amqp://guest:guest@localhost:5672'),
  ENABLE_RABBITMQ: z.string().optional().transform((val) => val === 'true').default('false'),
  JAEGER_URL: z.string().default('http://localhost:14268/api/traces'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment configurations:', JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
