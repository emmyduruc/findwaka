export interface LoggerOptions {
    enableLoggingInProduction?: boolean;
  }
  
  type LogLevel = "info" | "warn" | "error" | "service";
  
  export const createLogger = (options: LoggerOptions) => {
    const { enableLoggingInProduction = false } = options;
  
    const templateMessages = {
      STORE: "🗄️ store:",
      SCREEN: "📱 screen:",
      COMPONENT: "📦 component:",
      SERVICE: "🛠️ service:",
      METHOD: "🔧 method:",
      OBJECT: "🧱 object:",
      ERROR: "🔥 error:",
    };
  
    const logMessage = (level: LogLevel, message: string, prefix?: string) => {
      if (__DEV__ || enableLoggingInProduction) {
        console.log(`[${level.toUpperCase()}] ${prefix || ""}`, message);
      }
    };
  
    const log = (message: string, prefix?: string) => {
      logMessage("info", message, prefix);
    };
  
    const warn = (message: string, prefix?: string) => {
      logMessage("warn", message, prefix);
    };
  
    const error = (message: string, prefix?: string) => {
      logMessage("error", message, prefix);
    };
  
    const service = (message: string, prefix?: string) => {
      logMessage("service", message, prefix);
    };
  
    return {
      log,
      warn,
      error,
      service,
      templateMessages,
    };
  };
  
  export const loggerService = createLogger({ enableLoggingInProduction: true });
  export type ILoggerService = ReturnType<typeof createLogger>;
  