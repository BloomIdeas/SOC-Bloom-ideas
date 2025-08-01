const isProd = process.env.NODE_ENV === "production";
let hasWelcomed = false;

export const logger = {
  log: (...args: any[]) => {
    if (!isProd) console.log(...args);
    else if (!hasWelcomed) {
      hasWelcomed = true;
      console.log("%cWelcome to Bloom Ideas!","color: #10b981; font-size: 1.2em;");
    }
  },
  error: (...args: any[]) => {
    if (!isProd) console.error(...args);
  },
  warn: (...args: any[]) => {
    if (!isProd) console.warn(...args);
  },
  info: (...args: any[]) => {
    if (!isProd) console.info(...args);
  },
}; 