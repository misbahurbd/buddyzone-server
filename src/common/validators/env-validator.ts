import z from 'zod';

export const booleanSchema = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true') return true;
    if (lowerValue === 'false') return false;
  }

  return false;
}, z.boolean());

export const envValidationSchema = z
  .object({
    // Application Environment
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().default(3000),
    API_URL: z.url(),
    // Frontend Cors Environment Variables
    FRONTEND_ORIGIN: z.string().optional(),
    // Databasec Environment Variables
    DATABASE_URL: z.url(),
    // Redis Environment Variables
    REDIS_URL: z.url().optional(),
    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_USERNAME: z.string().default('default'),
    REDIS_PASSWORD: z.string().default(''),
    REDIS_DB: z.coerce.number().default(0),
    REDIS_TLS: booleanSchema.default(false),

    // Session Environment Variables
    SESSION_NAME: z.string().default('sid'),
    SESSION_SECRET: z.string(),
    SESSION_TTL: z.coerce.number().default(24 * 60 * 60 * 1000),
    SESSION_ROLLING: booleanSchema.default(false),

    // Cloudinary Environment Variables
    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
    CLOUDINARY_FOLDER: z.string().default('buddyzone'),
  })
  .superRefine((env, ctx) => {
    // Check Production Cors Origin
    if (env.NODE_ENV === 'production' && !env.FRONTEND_ORIGIN) {
      ctx.addIssue({
        code: 'custom',
        message: 'FRONTEND_ORIGIN is required in production',
      });
    }

    // Check Redis URL or Host and Port
    const hasRedisUrl = Boolean(env.REDIS_URL);
    const hasRedisHost = Boolean(env.REDIS_HOST);

    if (!hasRedisUrl && !hasRedisHost) {
      ctx.addIssue({
        code: 'custom',
        message: 'Either REDIS_URL or REDIS_HOST and REDIS_PORT are required',
      });
    }

    if (hasRedisUrl && hasRedisHost) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Only one of REDIS_URL or REDIS_HOST and REDIS_PORT is allowed',
      });
    }
  });

export type EnvVariables = z.infer<typeof envValidationSchema>;

export const validateEnv = (config: Record<string, unknown>): EnvVariables => {
  const result = envValidationSchema.safeParse(config);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('\n');

    throw new Error(`Environment validation error:\n${details}`);
  }

  return result.data;
};
