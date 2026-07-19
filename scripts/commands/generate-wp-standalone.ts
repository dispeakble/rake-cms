/**
 * Quick standalone WordPress theme generator — no DB needed.
 * Runs the generator with hardcoded data for Daria's Bakery.
 * Set GENERATOR_OUTPUT=wordpress before running.
 */
import path from "path";
import { generateTheme } from "@/lib/theme-generator/index";

async function main() {
  const name = "Daria's Bakery & Bistro | Breakfast & Lunch";
  const outputDir = process.cwd();

  const config = await generateTheme(
    null,  // no scraped site
    {
      name,
      address: "Calle Ejemplo, 1, Santa Cruz de Tenerife",
      phone: "+34 922 123 456",
      email: "info@dariasbakery.com",
      rating: 4.8,
      totalRatings: 312,
      latitude: 28.468,
      longitude: -16.254,
      photos: [],
      categories: ["restaurant"],
      placeId: "test",
      url: "",
      priceLevel: 2,
      website: "",
    },
    outputDir,
    [],  // no photos
    [],  // no page slugs
    "restaurant" as any,
  );

  console.log(`\n✅ Done! Theme generated for "${config.name}"`);
  console.log(`   Colors: primary=${config.primaryColor} secondary=${config.secondaryColor}`);
  console.log(`   Font: ${config.fontFamily}`);
}

main().catch(e => {
  console.error("FAILED:", e);
  process.exit(1);
});
