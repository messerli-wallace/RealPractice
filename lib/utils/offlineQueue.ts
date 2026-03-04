/**
 * Offline Queue System for RealPractice
 *
 * Handles queuing of write operations when offline and automatic sync when back online.
 */
import { isNetworkError } from "./networkUtils";

export class OfflineQueuedError extends Error {
  constructor(
    message: string,
    public operationId: string,
    public operationType: string
  ) {
    super(message);
    this.name = "OfflineQueuedError";
  }
}

export interface QueuedOperation {
  id: string;
  type:
    | "addLog"
    | "removeLog"
    | "followUser"
    | "unfollowUser"
    | "updateData"
    | "createData";
  params: any[];
  userId: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  backoffMs: number;
}

const QUEUE_PREFIX = "offline_queue_";
const MAX_QUEUE_SIZE = 100;
const MAX_RETRIES = 5;

/**
 * Get the storage key for a user's queue
 */
function getQueueKey(userId: string): string {
  return `${QUEUE_PREFIX}${userId}`;
}

/**
 * Safely parse JSON from localStorage
 */
function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * The OfflineQueue manages queued operations for a single user
 */
class OfflineQueue {
  private userId: string;
  private queue: QueuedOperation[];
  private isOnline: boolean;

  constructor(userId: string) {
    this.userId = userId;
    this.queue = this.loadQueue();
    this.isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline.bind(this));
      window.addEventListener("offline", this.handleOffline.bind(this));
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange.bind(this)
      );
    }
  }

  private loadQueue(): QueuedOperation[] {
    const key = getQueueKey(this.userId);
    const stored = localStorage.getItem(key);
    return safeParse(stored, []);
  }

  private saveQueue(): void {
    const key = getQueueKey(this.userId);
    try {
      localStorage.setItem(key, JSON.stringify(this.queue));
    } catch (error) {
      console.error("Failed to save offline queue:", error);
    }
  }

  private handleOnline() {
    this.isOnline = true;
    this.processQueue().catch(console.error);
  }

  private handleOffline() {
    this.isOnline = false;
  }

  private handleVisibilityChange() {
    if (!document.hidden && this.isOnline) {
      this.processQueue().catch(console.error);
    }
  }

  /**
   * Check if we're currently online
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Get all queued operations for this user
   */
  getAll(): QueuedOperation[] {
    return [...this.queue];
  }

  /**
   * Get the count of pending operations
   */
  getPendingCount(): number {
    return this.queue.length;
  }

  /**
   * Add an operation to the queue
   */
  enqueue(type: QueuedOperation["type"], params: any[]): string {
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      console.warn(
        `Queue full for user ${this.userId}, dropping oldest operation`
      );
      this.queue.shift(); // Remove oldest
    }

    const operation: QueuedOperation = {
      id: crypto.randomUUID(),
      type,
      params,
      userId: this.userId,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: MAX_RETRIES,
      backoffMs: 1000,
    };

    this.queue.push(operation);
    this.saveQueue();
    return operation.id;
  }

  /**
   * Remove an operation from the queue (after successful execution)
   */
  dequeue(operationId: string): QueuedOperation | null {
    const index = this.queue.findIndex((op) => op.id === operationId);
    if (index === -1) return null;

    const operation = this.queue.splice(index, 1)[0];
    this.saveQueue();
    return operation;
  }

  /**
   * Clear all operations for this user (e.g., after successful sync)
   */
  clearAll(): void {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Clear a specific failed operation
   */
  clearOperation(operationId: string): void {
    this.queue = this.queue.filter((op) => op.id !== operationId);
    this.saveQueue();
  }

  /**
   * Process all queued operations for this user
   */
  async processQueue(): Promise<void> {
    if (!this.isOnline) {
      console.log("Offline - skipping queue processing");
      return;
    }

    // Create a copy to process, so we can modify the original queue
    const operationsToProcess = [...this.queue];

    for (const operation of operationsToProcess) {
      // Check if still in queue (might have been cleared)
      if (!this.queue.find((op) => op.id === operation.id)) {
        continue;
      }

      try {
        await this.executeOperation(operation);
        // Success - remove from queue
        this.dequeue(operation.id);
      } catch (error) {
        if (error instanceof OfflineQueuedError) {
          // Already queued, skip
          this.dequeue(operation.id);
        } else if (isNetworkError(error)) {
          // Network error - increment retry count
          operation.retryCount++;

          if (operation.retryCount >= operation.maxRetries) {
            console.error(
              `Operation ${operation.id} failed after ${operation.maxRetries} retries, removing from queue`
            );
            this.clearOperation(operation.id);
          } else {
            // Update backoff for next retry (exponential)
            operation.backoffMs = Math.min(
              1000 * Math.pow(2, operation.retryCount),
              30000
            );
            this.saveQueue();
          }
        } else {
          // Non-network error - likely data validation, remove from queue and throw
          console.error(
            `Non-network error processing operation ${operation.id}, removing from queue:`,
            error
          );
          this.clearOperation(operation.id);
          throw error;
        }
      }
    }
  }

  /**
   * Execute a single operation by replaying the original function call
   * This will be called by the modified db functions
   */
  private async executeOperation(operation: QueuedOperation): Promise<void> {
    // We need to dynamically call the original db function
    // This will be handled by the db module integration
    // The db module will register handlers that can replay operations
    const handler = getOperationHandler(operation.type);
    if (!handler) {
      throw new Error(
        `No handler registered for operation type: ${operation.type}`
      );
    }

    await handler(operation.params);
  }

  /**
   * Clean up event listeners (call when user logs out)
   */
  destroy(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline.bind(this));
      window.removeEventListener("offline", this.handleOffline.bind(this));
      document.removeEventListener(
        "visibilitychange",
        this.handleVisibilityChange.bind(this)
      );
    }
  }
}

// Global registry for operation handlers
const operationHandlers: Map<string, (params: any[]) => Promise<void>> =
  new Map();

/**
 * Register a handler for a specific operation type
 * Called by db.ts to provide the actual Firebase write functions
 */
export function registerOperationHandler(
  type: QueuedOperation["type"],
  handler: (params: any[]) => Promise<void>
): void {
  operationHandlers.set(type, handler);
}

/**
 * Get the registered handler for an operation type
 */
function getOperationHandler(
  type: string
): ((params: any[]) => Promise<void>) | undefined {
  return operationHandlers.get(type);
}

/**
 * Create and return a new OfflineQueue instance for a user
 */
export function createOfflineQueue(userId: string): OfflineQueue {
  // Don't create multiple instances for same user
  const existing = offlineQueueInstances.get(userId);
  if (existing) {
    return existing;
  }

  const queue = new OfflineQueue(userId);
  offlineQueueInstances.set(userId, queue);
  return queue;
}

/**
 * Get or create an offline queue for a user
 */
export function getOfflineQueue(userId: string): OfflineQueue {
  return createOfflineQueue(userId);
}

// Track instances so we can reuse them
const offlineQueueInstances = new Map<string, OfflineQueue>();

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/**
 * Process all queues (useful for triggering global sync)
 */
export async function processAllQueues(): Promise<void> {
  const promises = Array.from(offlineQueueInstances.values()).map((queue) =>
    queue.processQueue()
  );
  await Promise.allSettled(promises);
}

/**
 * Destroy a user's queue instance and remove it from memory.
 * Call this when the user logs out to prevent memory leaks and
 * ensure pending operations are not processed under a different user.
 */
export function destroyQueue(userId: string): void {
  const queue = offlineQueueInstances.get(userId);
  if (queue) {
    queue.destroy();
    offlineQueueInstances.delete(userId);
  }
}

/**
 * Utility function to check if an error is an OfflineQueuedError
 */
export function isOfflineQueuedError(error: unknown): boolean {
  return error instanceof OfflineQueuedError;
}
