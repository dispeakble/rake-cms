/**
 * Environment variable validation.
 * Run at startup to catch missing config before deployment.
 */

export interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  /** Pattern to validate the value */
  pattern?: RegExp;
}

const REQUIRED_ENV_VARS: EnvVar[] = [
  { name: "DATABASE_URL", required: true, description: "Database connection string (postgresql:// or mysql://)" },
  { name: "AUTH_SECRET", required: true, description: "Auth.js secret key (generate with: openssl rand -base64 32)", pattern: /^.{16,}$/ },
];

const OPTIONAL_ENV_VARS: EnvVar[] = [
  { name: "DATABASE_DIALECT", required: false, description: "Database dialect: postgresql or mysql" },
  { name: "NEXT_PUBLIC_SITE_URL", required: false, description: "Public site URL" },
  { name: "MEDIA_STORAGE", required: false, description: "Media storage type: local or s3" },
  { name: "S3_BUCKET", required: false, description: "S3 bucket name (required if MEDIA_STORAGE=s3)" },
  { name: "S3_REGION", required: false, description: "S3 region" },
  { name: "S3_ACCESS_KEY", required: false, description: "S3 access key" },
  { name: "S3_SECRET_KEY", required: false, description: "S3 secret key" },
  { name: "GOOGLE_PLACES_API_KEY", required: false, description: "Google Places API key (for Maps scraping)" },
  { name: "VERCEL_TOKEN", required: false, description: "Vercel API token (for deployment)" },
];

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  invalid: string[];
  warnings: string[];
}

/**
 * Validate environment variables at startup.
 */
export function validateEnv(): EnvValidationResult {
  const result: EnvValidationResult = {
    valid: true,
    missing: [],
    invalid: [],
    warnings: [],
  };

  for (const env of REQUIRED_ENV_VARS) {
    const value = process.env[env.name];
    if (!value) {
      result.missing.push(env.name);
      result.valid = false;
    } else if (env.pattern && !env.pattern.test(value)) {
      result.invalid.push(`${env.name} (${env.description})`);
      result.valid = false;
    }
  }

  for (const env of OPTIONAL_ENV_VARS) {
    const value = process.env[env.name];
    // Check conditional requirements
    if (env.name === "S3_BUCKET" && process.env.MEDIA_STORAGE === "s3" && !value) {
      result.warnings.push(`${env.name} is required when MEDIA_STORAGE=s3`);
    }
    if (env.name === "S3_REGION" && process.env.MEDIA_STORAGE === "s3" && !value) {
      result.warnings.push(`${env.name} is required when MEDIA_STORAGE=s3`);
    }
  }

  return result;
}

/**
 * Print environment validation results to console.
 */
export function printEnvStatus(): void {
  const result = validateEnv();

  if (result.valid && result.warnings.length === 0) {
    console.log("✓ Environment validated");
    return;
  }

  if (result.missing.length > 0) {
    console.warn("\n⚠️  Missing required environment variables:");
    for (const name of result.missing) {
      const env = REQUIRED_ENV_VARS.find((e) => e.name === name);
      console.warn(`   • ${name}: ${env?.description}`);
    }
  }

  if (result.invalid.length > 0) {
    console.warn("\n⚠️  Invalid environment variables:");
    for (const msg of result.invalid) {
      console.warn(`   • ${msg}`);
    }
  }

  if (result.warnings.length > 0) {
    console.warn("\n⚠️  Configuration warnings:");
    for (const warning of result.warnings) {
      console.warn(`   • ${warning}`);
    }
  }
}
