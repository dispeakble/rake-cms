import { expect, test } from "@playwright/test";

type CrawlExpectations = {
  expectedTexts: string[];
  expectedImageHints: string[];
  blockedImageHints: string[];
  minImageCount: number;
  requireNonPlaceholder: boolean;
};

function parseCsvEnv(name: string): string[] {
  const raw = process.env[name];
  if (!raw) return [];
  return raw
    .split("||")
    .map((x) => x.trim())
    .filter(Boolean);
}

function getExpectations(): CrawlExpectations {
  const requireNonPlaceholder = (process.env.CRAWL_REQUIRE_NON_PLACEHOLDER ?? "true").toLowerCase() !== "false";
  return {
    expectedTexts: parseCsvEnv("CRAWL_EXPECT_TEXTS"),
    expectedImageHints: parseCsvEnv("CRAWL_EXPECT_IMAGE_HINTS"),
    blockedImageHints: parseCsvEnv("CRAWL_BLOCKED_IMAGE_HINTS").length
      ? parseCsvEnv("CRAWL_BLOCKED_IMAGE_HINTS")
      : ["placehold.co", "placeholder", "dummyimage.com"],
    minImageCount: Number(process.env.CRAWL_MIN_IMAGE_COUNT ?? "1"),
    requireNonPlaceholder,
  };
}

test.describe("crawl validation", () => {
  test("renders and loads website images", async ({ page }) => {
    const cfg = getExpectations();
    await page.goto("/");

    await expect(page.locator("main")).toBeVisible();

    const imageSources = await page.evaluate(() => {
      const imgUrls = Array.from(document.querySelectorAll("img"))
        .map((img) => (img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src || "")
        .filter(Boolean);

      const bgUrls = Array.from(document.querySelectorAll<HTMLElement>("[style*='background-image']"))
        .map((node) => node.style.backgroundImage || "")
        .map((value) => {
          const match = value.match(/url\(["']?(.*?)["']?\)/i);
          return match?.[1] || "";
        })
        .filter(Boolean);

      return [...imgUrls, ...bgUrls];
    });

    expect(imageSources.length).toBeGreaterThanOrEqual(cfg.minImageCount);

    if (cfg.requireNonPlaceholder) {
      const joined = imageSources.join(" ").toLowerCase();
      for (const blocked of cfg.blockedImageHints) {
        expect(joined).not.toContain(blocked.toLowerCase());
      }
    }

    for (const hint of cfg.expectedImageHints) {
      const hasHint = imageSources.some((src) => src.toLowerCase().includes(hint.toLowerCase()));
      expect(hasHint).toBeTruthy();
    }
  });

  test("shows expected crawled text content", async ({ page }) => {
    const cfg = getExpectations();
    await page.goto("/");

    test.skip(cfg.expectedTexts.length === 0, "Set CRAWL_EXPECT_TEXTS to verify scraped business text fragments.");

    for (const textFragment of cfg.expectedTexts) {
      await expect(page.getByText(textFragment, { exact: false }).first()).toBeVisible();
    }
  });
});
