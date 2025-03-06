import { NextRequest } from "next/server";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMetadata {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata: LogMetadata;
}

class Logger {
  private static instance: Logger;
  private env: string;

  private constructor() {
    this.env = process.env.NODE_ENV || "development";
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(
    level: LogLevel,
    message: string,
    metadata: LogMetadata
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata: {
        ...metadata,
        environment: this.env
      }
    };
  }

  private output(logEntry: LogEntry) {
    // In development, pretty print the logs
    if (this.env === "development") {
      console.log(
        `[${logEntry.timestamp}] ${logEntry.level.toUpperCase()} - ${
          logEntry.message
        }\n`,
        "Metadata:",
        logEntry.metadata
      );
    } else {
      // In production, output JSON format for better parsing
      console.log(JSON.stringify(logEntry));
    }
  }

  public debug(message: string, metadata: LogMetadata = {}) {
    if (this.env === "development") {
      this.output(this.formatLog("debug", message, metadata));
    }
  }

  public info(message: string, metadata: LogMetadata = {}) {
    this.output(this.formatLog("info", message, metadata));
  }

  public warn(message: string, metadata: LogMetadata = {}) {
    this.output(this.formatLog("warn", message, metadata));
  }

  public error(message: string, error?: Error, metadata: LogMetadata = {}) {
    this.output(
      this.formatLog("error", message, {
        ...metadata,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack
            }
          : undefined
      })
    );
  }

  public request(req: NextRequest, metadata: LogMetadata = {}) {
    const requestMetadata = {
      method: req.method,
      url: req.url,
      userAgent: req.headers.get("user-agent"),
      referer: req.headers.get("referer"),
      ...metadata
    };

    this.info(`HTTP ${req.method} ${req.url}`, requestMetadata);
  }
}

export const logger = Logger.getInstance();
