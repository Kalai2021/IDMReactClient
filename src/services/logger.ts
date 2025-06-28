// Centralized Logging Service for IDMReactClient
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  service: string;
  environment: string;
  fields?: Record<string, any>;
}

class FluentLogger {
  private endpoint: string;
  private serviceName: string;
  private enabled: boolean;
  private logQueue: LogEntry[];
  private batchSize: number;
  private flushInterval: number;

  constructor() {
    this.endpoint = process.env.REACT_APP_FLUENT_ENDPOINT || 'http://localhost:24224';
    this.serviceName = 'idmreactclient-frontend';
    this.enabled = process.env.REACT_APP_LOGGING_ENABLED === 'true';
    this.logQueue = [];
    this.batchSize = 10;
    this.flushInterval = 5000; // 5 seconds

    // Start batch processing
    if (this.enabled) {
      this.startBatchProcessing();
    }
  }

  // Create structured log entry
  private createLogEntry(level: string, message: string, fields: Record<string, any> = {}): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      environment: process.env.NODE_ENV || 'development',
      fields: Object.keys(fields).length > 0 ? fields : undefined
    };
  }

  // Add log to batch queue
  private addToBatch(logEntry: LogEntry): void {
    this.logQueue.push(logEntry);

    // Flush immediately if batch is full
    if (this.logQueue.length >= this.batchSize) {
      this.flushBatch();
    }
  }

  // Flush batch to server
  private async flushBatch(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logsToSend),
        signal: AbortSignal.timeout(3000)
      });
    } catch (error) {
      // Fallback to console logging if server is unavailable
      console.warn('Failed to send logs to server:', error);
      logsToSend.forEach(log => {
        console.log(`[${log.level}] ${log.message}`, log);
      });
    }
  }

  // Start batch processing timer
  private startBatchProcessing(): void {
    setInterval(() => {
      this.flushBatch();
    }, this.flushInterval);
  }

  // Simple logging methods
  async logInfo(message: string, fields: Record<string, any> = {}): Promise<void> {
    await this.log('INFO', message, fields);
  }

  async logError(message: string, error?: Error | null, fields: Record<string, any> = {}): Promise<void> {
    const logFields = { ...fields };
    if (error) {
      logFields.error = error.message;
      logFields.errorName = error.name;
      logFields.errorStack = error.stack;
    }
    await this.log('ERROR', message, logFields);
  }

  async logWarn(message: string, fields: Record<string, any> = {}): Promise<void> {
    await this.log('WARN', message, fields);
  }

  async logDebug(message: string, fields: Record<string, any> = {}): Promise<void> {
    await this.log('DEBUG', message, fields);
  }

  // Main logging method
  private async log(level: string, message: string, fields: Record<string, any> = {}): Promise<void> {
    if (!this.enabled) {
      // Simple console fallback
      const logMessage = `[${level}] ${message}`;
      if (Object.keys(fields).length > 0) {
        console.log(logMessage, fields);
      } else {
        console.log(logMessage);
      }
      return;
    }

    const logEntry = this.createLogEntry(level, message, fields);
    this.addToBatch(logEntry);

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const logMessage = `[${level}] ${message}`;
      if (Object.keys(fields).length > 0) {
        console.log(logMessage, fields);
      } else {
        console.log(logMessage);
      }
    }
  }

  // Specialized logging methods
  async userAction(action: string, details: Record<string, any> = {}): Promise<void> {
    return this.logInfo('User Action', {
      event: 'user_action',
      action,
      ...details
    });
  }

  async apiCall(endpoint: string, method: string, status: number, duration: number, error?: Error): Promise<void> {
    const fields = {
      event: 'api_call',
      endpoint,
      method,
      status,
      duration,
    };

    if (error) {
      return this.logError('API Call Failed', error, fields);
    }

    return this.logInfo('API Call', fields);
  }

  async pageView(page: string, additionalData: Record<string, any> = {}): Promise<void> {
    return this.logInfo('Page View', {
      event: 'page_view',
      page,
      ...additionalData
    });
  }

  async performance(metric: string, value: number, additionalData: Record<string, any> = {}): Promise<void> {
    return this.logInfo('Performance', {
      event: 'performance',
      metric,
      value,
      ...additionalData
    });
  }
}

// Create singleton instance
const logger = new FluentLogger();
export default logger; 