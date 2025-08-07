import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'server.log');

export function logError(err) {
  const entry = `[${new Date().toISOString()}] ${err.stack || err}\n`;
  fs.appendFile(logFile, entry, (e) => {
    if (e) console.error('Failed to write log:', e);
  });
  console.error(err);
}

export function logInfo(message) {
  const entry = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFile(logFile, entry, (e) => {
    if (e) console.error('Failed to write log:', e);
  });
  console.log(message);
}
