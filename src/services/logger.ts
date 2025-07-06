// Structured Logging Service inspired by Go's slog for IDMReactClient
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogRecord {
  time: string;
  level: LogLevel;
  msg: string;
  service: string;
  environment: string;
  attrs: Record<string, any>;
}

export interface Handler {
  handle(record: LogRecord): void;
}

// Console Handler for development
class ConsoleHandler implements Handler {
  handle(record: LogRecord): void {
    const { level, msg, attrs } = record;
    const timestamp = new Date(record.time).toLocaleTimeString();
    
    const logMessage = `[${timestamp}] ${level}: ${msg}`;
    
    switch (level) {
      case 'DEBUG':
        console.debug(logMessage, attrs);
        break;
      case 'INFO':
        console.info(logMessage, attrs);
        break;
      case 'WARN':
        console.warn(logMessage, attrs);
        break;
      case 'ERROR':
        console.error(logMessage, attrs);
        break;
    }
  }
}

// Fluentd Handler for production
class FluentdHandler implements Handler {
  private endpoint: string;
  private logQueue: LogRecord[];
  private batchSize: number;
  private flushInterval: number;

  constructor() {
    this.endpoint = process.env.REACT_APP_FLUENT_ENDPOINT || 'http://localhost:24224';
    this.logQueue = [];
    this.batchSize = 10;
    this.flushInterval = 5000; // 5 seconds

    this.startBatchProcessing();
  }

  handle(record: LogRecord): void {
    this.logQueue.push(record);

    if (this.logQueue.length >= this.batchSize) {
      this.flushBatch();
    }
  }

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
      // Fallback to console if Fluentd is unavailable
      console.warn('Failed to send logs to Fluentd:', error);
      logsToSend.forEach(log => {
        const handler = new ConsoleHandler();
        handler.handle(log);
      });
    }
  }

  private startBatchProcessing(): void {
    setInterval(() => {
      this.flushBatch();
    }, this.flushInterval);
  }
}

// Logger class following slog principles
export class Logger {
  private handlers: Handler[];
  private service: string;
  private environment: string;
  private enabled: boolean;

  constructor(handlers: Handler[] = []) {
    this.handlers = handlers;
    this.service = 'idmreactclient-frontend';
    this.environment = process.env.NODE_ENV || 'development';
    this.enabled = process.env.REACT_APP_LOGGING_ENABLED !== 'false';

    // Add default handlers based on environment
    if (this.enabled) {
      if (this.environment === 'development') {
        this.handlers.push(new ConsoleHandler());
      } else {
        this.handlers.push(new FluentdHandler());
        // Also log to console in production for debugging
        this.handlers.push(new ConsoleHandler());
      }
    }
  }

  private log(level: LogLevel, msg: string, attrs: Record<string, any> = {}): void {
    if (!this.enabled) return;

    const record: LogRecord = {
      time: new Date().toISOString(),
      level,
      msg,
      service: this.service,
      environment: this.environment,
      attrs: { ...attrs }
    };

    this.handlers.forEach(handler => {
      try {
        handler.handle(record);
      } catch (error) {
        console.error('Handler error:', error);
      }
    });
  }

  // Core logging methods
  debug(msg: string, attrs: Record<string, any> = {}): void {
    this.log('DEBUG', msg, attrs);
  }

  info(msg: string, attrs: Record<string, any> = {}): void {
    this.log('INFO', msg, attrs);
  }

  warn(msg: string, attrs: Record<string, any> = {}): void {
    this.log('WARN', msg, attrs);
  }

  error(msg: string, error?: Error | null, attrs: Record<string, any> = {}): void {
    const errorAttrs = { ...attrs };
    if (error) {
      errorAttrs.error = error.message;
      errorAttrs.errorName = error.name;
      errorAttrs.errorStack = error.stack;
    }
    this.log('ERROR', msg, errorAttrs);
  }

  // Specialized logging methods
  userAction(action: string, details: Record<string, any> = {}): void {
    this.info('User Action', {
      event: 'user_action',
      action,
      ...details
    });
  }

  apiCall(endpoint: string, method: string, status: number, duration: number, error?: Error): void {
    const attrs = {
      event: 'api_call',
      endpoint,
      method,
      status,
      duration,
    };

    if (error) {
      this.error('API Call Failed', error, attrs);
    } else {
      this.info('API Call', attrs);
    }
  }

  pageView(page: string, additionalData: Record<string, any> = {}): void {
    this.info('Page View', {
      event: 'page_view',
      page,
      ...additionalData
    });
  }

  performance(metric: string, value: number, additionalData: Record<string, any> = {}): void {
    this.info('Performance', {
      event: 'performance',
      metric,
      value,
      ...additionalData
    });
  }

  // WithAttrs method for creating a logger with additional attributes
  withAttrs(attrs: Record<string, any>): Logger {
    const newLogger = new Logger(this.handlers);
    newLogger.service = this.service;
    newLogger.environment = this.environment;
    newLogger.enabled = this.enabled;
    
    // Override the log method to include the additional attributes
    const originalLog = newLogger.log.bind(newLogger);
    newLogger.log = (level: LogLevel, msg: string, logAttrs: Record<string, any> = {}) => {
      originalLog(level, msg, { ...attrs, ...logAttrs });
    };
    
    return newLogger;
  }
}

// Create singleton instance
const logger = new Logger();
export default logger; 