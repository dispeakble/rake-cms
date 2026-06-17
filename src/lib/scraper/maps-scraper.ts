/**
 * Google Maps / Places scraper.
 *
 * Uses the Google Places API (New) to fetch business data:
 *  - Business name, address, phone, website, hours
 *  - Rating, reviews, photos
 *  - Business type/category
 *
 * Requires GOOGLE_PLACES_API_KEY in environment.
 * Get one at https://console.cloud.google.com/apis/library/places-backend.googleapis.com
 */

export interface BusinessData {
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  totalRatings: number;
  priceLevel: string;
  hours: string[];
  categories: string[];
  reviews: ReviewData[];
  photos: string[];
  description: string;
  placeId: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface ReviewData {
  author: string;
  rating: number;
  text: string;
  time: string;
}

/**
 * Search for a place by name and location.
 * Returns the first match from Google Places API.
 */
export async function searchBusiness(
  query: string,
  location?: string
): Promise<BusinessData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.log("\n⚠️  GOOGLE_PLACES_API_KEY not set in environment.");
    console.log("   Falling back to basic business data from search query.");
    return fallbackBusinessData(query, location);
  }

  console.log(`\n📍 Searching Google Maps for: "${query}"${location ? ` in ${location}` : ""}`);

  try {
    // Step 1: Text search to find the place
    const searchQuery = location ? `${query} ${location}` : query;
    const searchUrl = `https://places.googleapis.com/v1/places:searchText`;

    const searchResponse = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({
        textQuery: searchQuery,
        maxResultCount: 1,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!searchResponse.ok) {
      console.warn(`   Places API error: ${searchResponse.status}`);
      return fallbackBusinessData(query, location);
    }

    const searchData = await searchResponse.json();
    if (!searchData.places || searchData.places.length === 0) {
      console.log("   No results found via Places API");
      return fallbackBusinessData(query, location);
    }

    const place = searchData.places[0];
    const placeId = place.id;

    // Step 2: Get detailed place info
    const detailUrl = `https://places.googleapis.com/v1/places/${placeId}`;

    const detailResponse = await fetch(detailUrl, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,types,rating,userRatingCount,internationalPhoneNumber,websiteUri,regularOpeningHours,priceLevel,editorialSummary,reviews,photos,location,plusCode,shortFormattedAddress,subDestinations,addressComponents",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!detailResponse.ok) {
      console.warn(`   Detail API error: ${detailResponse.status}`);
      return {
        ...fallbackBusinessData(query, location)!,
        name: place.displayName?.text || query,
        rating: place.rating || 0,
        totalRatings: place.userRatingCount || 0,
        categories: place.types || [],
      };
    }

    const detail = await detailResponse.json();

    // Parse address components
    const addressParts = parseAddress(detail.formattedAddress || "");

    const business: BusinessData = {
      name: detail.displayName?.text || query,
      address: detail.formattedAddress || "",
      phone: detail.internationalPhoneNumber || "",
      website: detail.websiteUri || "",
      rating: detail.rating || 0,
      totalRatings: detail.userRatingCount || 0,
      priceLevel: detail.priceLevel || "",
      hours: detail.regularOpeningHours?.weekdayDescriptions || [],
      categories: (detail.types || []).filter((t: string) => !t.startsWith("_")),
      reviews: (detail.reviews || []).slice(0, 5).map((r: any) => ({
        author: r.authorAttribution?.displayName || "Anonymous",
        rating: r.rating || 0,
        text: r.text?.text || "",
        time: r.publishTime || "",
      })),
      photos: (detail.photos || []).slice(0, 5).map((p: any) => p.name || ""),
      description: detail.editorialSummary?.text || "",
      placeId: detail.id || placeId,
      city: addressParts.city,
      state: addressParts.state,
      zipCode: addressParts.zip,
      country: addressParts.country,
      latitude: detail.location?.latitude || 0,
      longitude: detail.location?.longitude || 0,
    };

    console.log(`   ✓ Found: ${business.name}`);
    console.log(`   📍 ${business.address}`);
    console.log(`   ⭐ ${business.rating}/5 (${business.totalRatings} reviews)`);
    console.log(`   📞 ${business.phone || "—"}`);
    console.log(`   🌐 ${business.website || "—"}`);

    return business;
  } catch (error) {
    console.warn(`   Error: ${(error as Error).message}`);
    return fallbackBusinessData(query, location);
  }
}

/**
 * Parse address into components.
 */
function parseAddress(address: string): { city: string; state: string; zip: string; country: string } {
  // Basic US address parsing
  const parts = address.split(",").map((p) => p.trim());
  const result = { city: "", state: "", zip: "", country: "" };

  if (parts.length >= 2) {
    result.city = parts[parts.length - 3] || "";
    const stateZip = parts[parts.length - 2] || "";
    const stateZipMatch = stateZip.match(/([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/);
    if (stateZipMatch) {
      result.state = stateZipMatch[1];
      result.zip = stateZipMatch[2];
    } else {
      result.state = stateZip;
    }
    result.country = parts[parts.length - 1] || "";
  }

  return result;
}

/**
 * Fallback when no API key or API fails.
 * Creates a basic business data object from the search query.
 */
function fallbackBusinessData(
  query: string,
  location?: string
): BusinessData {
  const name = query.trim();
  const locParts = (location || "").split(",").map((p) => p.trim());

  return {
    name,
    address: location || "",
    phone: "",
    website: "",
    rating: 0,
    totalRatings: 0,
    priceLevel: "",
    hours: [],
    categories: ["business"],
    reviews: [],
    photos: [],
    description: `We are ${name}, serving the ${location || "local"} area.`,
    placeId: "",
    city: locParts[0] || "",
    state: locParts[1] || "",
    zipCode: "",
    country: "US",
    latitude: 0,
    longitude: 0,
  };
}
