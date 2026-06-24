/**
 * Rake CMS — Action Hooks System
 *
 * WordPress-compatible action hooks.
 * Plugins and themes can register callbacks via addAction(),
 * and core triggers them via doAction().
 *
 * Usage:
 *   import { addAction, doAction } from "@/lib/hooks";
 *
 *   // Register a callback
 *   addAction("save_post", async (postId, post) => {
 *     console.log(`Post ${postId} saved`);
 *   }, 10, 2);
 *
 *   // Trigger all callbacks
 *   await doAction("save_post", postId, post);
 */

type HookCallback = (...args: unknown[]) => void | Promise<void>;

interface HookRegistration {
  callback: HookCallback;
  priority: number;
  acceptedArgs: number;
}

const actions = new Map<string, HookRegistration[]>();

/**
 * Register an action hook callback.
 *
 * @param hookName - The name of the action to hook into (e.g., "save_post")
 * @param callback - Function to call when action is triggered
 * @param priority - Lower numbers execute first (default: 10)
 * @param acceptedArgs - Number of arguments the callback accepts (default: 1)
 */
export function addAction(
  hookName: string,
  callback: HookCallback,
  priority: number = 10,
  acceptedArgs: number = 1
): void {
  if (!actions.has(hookName)) {
    actions.set(hookName, []);
  }

  const registrations = actions.get(hookName)!;
  registrations.push({ callback, priority, acceptedArgs });

  // Sort by priority (ascending)
  registrations.sort((a, b) => a.priority - b.priority);
}

/**
 * Remove a specific action callback.
 *
 * @param hookName - The action name
 * @param callback - The exact callback function to remove
 * @param priority - Must match the priority used when registering
 */
export function removeAction(
  hookName: string,
  callback: HookCallback,
  priority: number = 10
): void {
  const registrations = actions.get(hookName);
  if (!registrations) return;

  const filtered = registrations.filter(
    (r) => r.callback !== callback || r.priority !== priority
  );

  if (filtered.length === 0) {
    actions.delete(hookName);
  } else {
    actions.set(hookName, filtered);
  }
}

/**
 * Remove all callbacks for an action.
 */
export function removeAllActions(hookName: string): void {
  actions.delete(hookName);
}

/**
 * Execute all callbacks registered for an action hook.
 * Callbacks are executed in priority order.
 *
 * @param hookName - The action to trigger
 * @param args - Arguments to pass to each callback (up to acceptedArgs)
 */
export async function doAction(
  hookName: string,
  ...args: unknown[]
): Promise<void> {
  const registrations = actions.get(hookName);
  if (!registrations) return;

  for (const reg of registrations) {
    const callbackArgs = args.slice(0, reg.acceptedArgs);
    try {
      await reg.callback(...callbackArgs);
    } catch (error) {
      console.error(`[Action Hook Error] "${hookName}":`, error);
    }
  }
}

/**
 * Check if any callbacks are registered for an action.
 */
export function hasAction(
  hookName: string,
  callback?: HookCallback
): boolean {
  const registrations = actions.get(hookName);
  if (!registrations) return false;
  if (!callback) return registrations.length > 0;
  return registrations.some((r) => r.callback === callback);
}

/**
 * Get the number of callbacks registered for an action.
 */
export function didAction(hookName: string): number {
  return actions.get(hookName)?.length || 0;
}

/**
 * Reset all action hooks (primarily for testing).
 */
export function resetActions(): void {
  actions.clear();
}

/**
 * Run a single callback or array of callbacks.
 * For internal use when you need to call a specific function through the hook system.
 */
export async function doActionSync(
  hookName: string,
  ...args: unknown[]
): Promise<void> {
  return doAction(hookName, ...args);
}
