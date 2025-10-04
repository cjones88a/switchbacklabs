/**
 * NEURALINK-LEVEL PERFORMANCE MONITORING
 * Real-time performance tracking with sub-millisecond precision
 */

interface PerformanceMetrics {
  timestamp: number;
  operation: string;
  duration: number;
  memoryUsage: number;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private startTime: number = 0;

  start(operation: string): void {
    this.startTime = performance.now();
    console.log(`🚀 [${operation}] Starting at ${this.startTime.toFixed(3)}ms`);
  }

  end(operation: string, success: boolean = true, error?: string): void {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    const memoryUsage = (performance as unknown as { memory?: { usedJSHeapSize?: number } }).memory?.usedJSHeapSize || 0;

    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      operation,
      duration,
      memoryUsage,
      success,
      error
    };

    this.metrics.push(metric);
    
    const status = success ? '✅' : '❌';
    const memoryMB = (memoryUsage / 1024 / 1024).toFixed(2);
    
    console.log(`${status} [${operation}] Completed in ${duration.toFixed(3)}ms | Memory: ${memoryMB}MB`);
    
    if (error) {
      console.error(`💥 [${operation}] Error: ${error}`);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAveragePerformance(): { operation: string; avgDuration: number; successRate: number }[] {
    const operationStats = new Map<string, { totalDuration: number; count: number; successes: number }>();
    
    this.metrics.forEach(metric => {
      const existing = operationStats.get(metric.operation) || { totalDuration: 0, count: 0, successes: 0 };
      existing.totalDuration += metric.duration;
      existing.count += 1;
      if (metric.success) existing.successes += 1;
      operationStats.set(metric.operation, existing);
    });

    return Array.from(operationStats.entries()).map(([operation, stats]) => ({
      operation,
      avgDuration: stats.totalDuration / stats.count,
      successRate: (stats.successes / stats.count) * 100
    }));
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * TESLA-LEVEL ERROR HANDLING
 * Graceful degradation with intelligent recovery
 */
export class TeslaErrorHandler {
  static handle(error: unknown): { message: string; recoverable: boolean; action: string } {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Categorize errors by severity and recovery potential
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      return {
        message: 'Authentication expired - please reconnect',
        recoverable: true,
        action: 'redirect_to_oauth'
      };
    }
    
    if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
      return {
        message: 'Insufficient permissions - check Strava app settings',
        recoverable: false,
        action: 'show_admin_contact'
      };
    }
    
    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      return {
        message: 'Rate limited - please wait a moment',
        recoverable: true,
        action: 'retry_with_backoff'
      };
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        message: 'Network error - check your connection',
        recoverable: true,
        action: 'retry_immediately'
      };
    }
    
    // Default to unrecoverable for unknown errors
    return {
      message: `Unexpected error: ${errorMessage}`,
      recoverable: false,
      action: 'log_and_report'
    };
  }
}

/**
 * SPACEX-LEVEL CACHING STRATEGY
 * Multi-layer caching with intelligent invalidation
 */
export class SpaceXCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  
  set(key: string, data: unknown, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  }
  
  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const spaceXCache = new SpaceXCache();
