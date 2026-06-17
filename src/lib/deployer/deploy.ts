/**
 * Deployer — deploys the built site to Vercel.
 *
 * Uses the Vercel CLI to deploy.
 * Requires VERCEL_TOKEN in environment.
 */

import { execSync } from "child_process";

export interface DeployOptions {
  projectName?: string;
  vercelToken?: string;
  target?: "production" | "preview";
  autoConfirm?: boolean;
}

export interface DeployResult {
  url: string;
  success: boolean;
}

/**
 * Check if Vercel CLI is installed.
 */
function hasVercelCli(): boolean {
  try {
    execSync("npx vercel --version", { stdio: "pipe", timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Deploy the current project to Vercel.
 */
export async function deployToVercel(options: DeployOptions): Promise<DeployResult> {
  const projectName = options.projectName || "rake-cms-site";
  const target = options.target || "production";
  const vercelToken = options.vercelToken || process.env.VERCEL_TOKEN;

  console.log(`\n🚀 Deploying to Vercel...`);
  console.log(`   Project: ${projectName}`);
  console.log(`   Target: ${target}`);

  if (!hasVercelCli()) {
    console.log("   ⚠️  Vercel CLI not found. Installing...");
    try {
      execSync("npm install -g vercel", { stdio: "pipe", timeout: 30000 });
      console.log("   ✓ Vercel CLI installed");
    } catch (error) {
      return {
        success: false,
        url: "",
      };
    }
  }

  try {
    // Build the project first
    console.log("\n🏗️  Building project...");
    execSync("npx next build", { stdio: "pipe", timeout: 120000 });
    console.log("   ✓ Build complete");

    // Deploy to Vercel
    console.log("\n☁️  Deploying...");

    const deployArgs = [
      "npx vercel",
      "--prod",
      "--yes",
      `--name=${projectName}`,
      vercelToken ? `--token=${vercelToken}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const output = execSync(deployArgs, {
      stdio: "pipe",
      timeout: 120000,
      env: {
        ...process.env,
        VERCEL_PROJECT_NAME: projectName,
      },
    }).toString();

    // Extract deploy URL from output
    const urlMatch = output.match(/(https:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[1] : "https://vercel.com";

    console.log(`\n✅ Deployed successfully!`);
    console.log(`   URL: ${url}`);

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error(`\n❌ Deployment failed: ${(error as Error).message}`);
    return {
      success: false,
      url: "",
    };
  }
}

/**
 * Build only (no deploy).
 */
export async function buildOnly(): Promise<boolean> {
  console.log("\n🏗️  Building project...");
  try {
    execSync("npx next build", { stdio: "inherit", timeout: 120000 });
    console.log("   ✓ Build complete");
    return true;
  } catch {
    console.error("   ❌ Build failed");
    return false;
  }
}
