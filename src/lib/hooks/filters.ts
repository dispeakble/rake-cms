/**
 * Rake CMS — Filter Hooks System
 *
 * WordPress-compatible filter hooks.
 * Allows plugins/themes to modify data before it's used.
 *
 * Usage:
 *   import { addFilter, applyFilters } from "@/lib/hooks";
 *
 *   // Register a filter
 *   addFilter("the_title", (title, postId) => {
 *     return `📝 ${title}`;
 *   }, 10, 2);
 *
 *   // Apply filters
 *   const filtered = await applyFilters("the_title", originalTitle, postId);
 */

type FilterCallback = (...args: unknown[]) => unknown | Promise<unknown>;

interface FilterRegistration {
  callback: FilterCallback;
  priority: number;
  acceptedArgs: number;
}

const filters = new Map<string, FilterRegistration[]>();

/**
 * Register a filter hook callback.
 *
 * @param hookName - The name of the filter (e.g., "the_title", "the_content")
 * @param callback - Function that receives the value and returns the modified value
 * @param priority - Lower numbers execute first (default: 10)
 * @param acceptedArgs - Number of arguments the callback accepts (default: 1)
 */
export function addFilter(
  hookName: string,
  callback: FilterCallback,
  priority: number = 10,
  acceptedArgs: number = 1
): void {
  if (!filters.has(hookName)) {
    filters.set(hookName, []);
  }

  const registrations = filters.get(hookName)!;
  registrations.push({ callback, priority, acceptedArgs });

  // Sort by priority (ascending)
  registrations.sort((a, b) => a.priority - b.priority);
}

/**
 * Remove a specific filter callback.
 */
export function removeFilter(
  hookName: string,
  callback: FilterCallback,
  priority: number = 10
): void {
  const registrations = filters.get(hookName);
  if (!registrations) return;

  const filtered = registrations.filter(
    (r) => r.callback !== callback || r.priority !== priority
  );

  if (filtered.length === 0) {
    filters.delete(hookName);
  } else {
    filters.set(hookName, filtered);
  }
}

/**
 * Remove all callbacks for a filter.
 */
export function removeAllFilters(hookName: string): void {
  filters.delete(hookName);
}

/**
 * Apply all filter callbacks registered for a hook.
 * Each callback receives the current value and returns the modified value.
 *
 * @param hookName - The filter to apply
 * @param value - The initial value to filter
 * @param args - Additional arguments to pass to callbacks
 * @returns The final filtered value
 */
export async function applyFilters<T>(
  hookName: string,
  value: T,
  ...args: unknown[]
): Promise<T> {
  const registrations = filters.get(hookName);
  if (!registrations) return value;

  let currentValue: unknown = value;

  for (const reg of registrations) {
    const callbackArgs = [currentValue, ...args.slice(0, reg.acceptedArgs - 1)];
    try {
      currentValue = await reg.callback(...callbackArgs);
    } catch (error) {
      console.error(`[Filter Hook Error] "${hookName}":`, error);
    }
  }

  return currentValue as T;
}

/**
 * Check if any callbacks are registered for a filter.
 */
export function hasFilter(
  hookName: string,
  callback?: FilterCallback
): boolean {
  const registrations = filters.get(hookName);
  if (!registrations) return false;
  if (!callback) return registrations.length > 0;
  return registrations.some((r) => r.callback === callback);
}

/**
 * Get the number of callbacks registered for a filter.
 */
export function didFilter(hookName: string): number {
  return filters.get(hookName)?.length || 0;
}

/**
 * Reset all filters (primarily for testing).
 */
export function resetFilters(): void {
  filters.clear();
}
