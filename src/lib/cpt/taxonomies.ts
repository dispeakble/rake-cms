/**
 * Rake CMS — Custom Taxonomies Registry
 *
 * WordPress-compatible taxonomy registration API.
 * Builds on the hooks system and CPT registry.
 *
 * Usage:
 *   import { registerTaxonomy, getTaxonomies } from "@/lib/cpt/taxonomies";
 *
 *   registerTaxonomy("product_tag", "product", {
 *     label: "Product Tags",
 *     singularLabel: "Product Tag",
 *     hierarchical: false,
 *   });
 *
 *   registerTaxonomy("product_category", "product", {
 *     label: "Product Categories",
 *     singularLabel: "Product Category",
 *     hierarchical: true,
 *   });
 */

import { addFilter, applyFilters } from "@/lib/hooks";

export interface TaxonomyArgs {
  /** Plural label (e.g., "Product Categories") */
  label: string;
  /** Singular label (e.g., "Product Category") */
  singularLabel: string;
  /** Whether the taxonomy is hierarchical (like categories vs tags) */
  hierarchical?: boolean;
  /** Whether it's publicly viewable */
  public?: boolean;
  /** Whether to show in the REST API */
  showInRest?: boolean;
  /** REST API base slug */
  restBase?: string;
  /** Whether to show in the admin UI */
  showInMenu?: boolean;
  /** Admin menu icon */
  menuIcon?: string;
  /** Whether to show in the admin bar */
  showInAdminBar?: boolean;
  /** Whether the taxonomy is displayed in the post editor */
  showInQuickEdit?: boolean;
  /** Custom labels */
  labels?: Record<string, string>;
  /** Description */
  description?: string;
}

interface RegisteredTaxonomy {
  name: string;
  objectTypes: string[];
  args: TaxonomyArgs;
}

/** Internal registry of taxonomies */
const taxonomies = new Map<string, RegisteredTaxonomy>();

/** Built-in taxonomies */
const BUILT_IN_TAXONOMIES: Record<string, { objectTypes: string[]; args: TaxonomyArgs }> = {
  category: {
    objectTypes: ["post"],
    args: {
      label: "Categories",
      singularLabel: "Category",
      hierarchical: true,
      public: true,
      showInRest: true,
      restBase: "categories",
      showInMenu: true,
      showInAdminBar: true,
      menuIcon: "📁",
    },
  },
  post_tag: {
    objectTypes: ["post"],
    args: {
      label: "Tags",
      singularLabel: "Tag",
      hierarchical: false,
      public: true,
      showInRest: true,
      restBase: "tags",
      showInMenu: true,
      showInAdminBar: true,
      menuIcon: "🏷️",
    },
  },
  post_format: {
    objectTypes: ["post"],
    args: {
      label: "Formats",
      singularLabel: "Format",
      hierarchical: false,
      public: true,
      showInRest: false,
      restBase: "formats",
      showInMenu: false,
    },
  },
};

/**
 * Register a custom taxonomy.
 *
 * @param name - Taxonomy key (e.g., "product_category") — max 32 chars, lowercase
 * @param objectTypes - Post types to associate (e.g., ["post", "product"])
 * @param args - Taxonomy configuration
 */
export function registerTaxonomy(
  name: string,
  objectTypes: string | string[],
  args: TaxonomyArgs
): void {
  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9_-]/g, "").substring(0, 32);

  if (!sanitizedName) {
    console.error(`[Taxonomy] Invalid taxonomy name: "${name}"`);
    return;
  }

  const types = Array.isArray(objectTypes) ? objectTypes : [objectTypes];

  if (taxonomies.has(sanitizedName)) {
    // WordPress behavior: merging object types if already registered
    const existing = taxonomies.get(sanitizedName)!;
    const mergedTypes = [...new Set([...existing.objectTypes, ...types])];
    taxonomies.set(sanitizedName, { name: sanitizedName, objectTypes: mergedTypes, args });
    return;
  }

  taxonomies.set(sanitizedName, { name: sanitizedName, objectTypes: types, args });
}

/**
 * Initialize built-in taxonomies (called at app startup).
 */
export function initializeTaxonomies(): void {
  for (const [name, reg] of Object.entries(BUILT_IN_TAXONOMIES)) {
    if (!taxonomies.has(name)) {
      taxonomies.set(name, { name, ...reg });
    }
  }
}

/**
 * Get all registered taxonomies.
 */
export function getTaxonomies(): Record<string, TaxonomyArgs> {
  initializeTaxonomies();
  const result: Record<string, TaxonomyArgs> = {};
  for (const [name, reg] of taxonomies) {
    result[name] = reg.args;
  }
  return result;
}

/**
 * Get a single taxonomy by name.
 */
export function getTaxonomy(name: string): TaxonomyArgs | null {
  initializeTaxonomies();
  return taxonomies.get(name)?.args || null;
}

/**
 * Get all taxonomies associated with a post type.
 */
export function getObjectTaxonomies(objectType: string): string[] {
  initializeTaxonomies();
  const result: string[] = [];
  for (const [name, reg] of taxonomies) {
    if (reg.objectTypes.includes(objectType)) {
      result.push(name);
    }
  }
  return result;
}

/**
 * Get object types for a taxonomy.
 */
export function getTaxonomyObjectTypes(taxonomy: string): string[] {
  initializeTaxonomies();
  return taxonomies.get(taxonomy)?.objectTypes || [];
}

/**
 * Check if a taxonomy is hierarchical.
 */
export function isTaxonomyHierarchical(name: string): boolean {
  initializeTaxonomies();
  return taxonomies.get(name)?.args.hierarchical || false;
}

/**
 * Check if a taxonomy is registered.
 */
export function taxonomyExists(name: string): boolean {
  initializeTaxonomies();
  return taxonomies.has(name);
}

/**
 * Get the REST API base for a taxonomy.
 */
export function getTaxonomyRestBase(taxonomy: string): string {
  initializeTaxonomies();
  return taxonomies.get(taxonomy)?.args.restBase || `${taxonomy}s`;
}
