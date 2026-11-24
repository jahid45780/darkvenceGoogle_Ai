import mongoose from 'mongoose';
import { config } from '../config/index.ts';

let isConnected = false;
let connectionProvider = 'MongoDB Atlas';
let memoryServerInstance: any = null;

export interface DatabaseStatus {
  provider: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'failed';
  host?: string;
  name?: string;
  error?: string;
}

/**
 * Sanitizes a MongoDB connection URI to mask passwords for safe logging
 */
export function sanitizeMongoUri(uri: string): string {
  try {
    const url = new URL(uri);
    if (url.password) {
      url.password = '****';
    }
    return url.toString();
  } catch {
    return 'mongodb://[credentials-hidden]';
  }
}

/**
 * Determines whether a URI is a placeholder template
 */
function isPlaceholderUri(uri: string): boolean {
  if (!uri) return true;
  const lower = uri.toLowerCase();
  return (
    lower.includes('<username>') ||
    lower.includes('your_username') ||
    lower.includes('your_cluster') ||
    lower.includes('cluster0.mongodb.net') // Unconfigured template domain
  );
}

/**
 * Connect to MongoDB Atlas (with automated local MongoMemoryServer engine if no external cluster is provided)
 */
export async function connectDatabase(maxRetries = 3, retryDelayMs = 2000): Promise<typeof mongoose> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const rawUri = config.mongoUri || process.env.MONGODB_URI || process.env.DATABASE_URL || '';
  console.log('[Database] Connecting to MongoDB Atlas...');

  // If a valid non-placeholder URI is provided, attempt connection to MongoDB Atlas
  if (rawUri && !isPlaceholderUri(rawUri)) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const sanitized = sanitizeMongoUri(rawUri);
        // Attempt connection with timeouts
        await mongoose.connect(rawUri, {
          serverSelectionTimeoutMS: 8000,
          connectTimeoutMS: 10000,
          autoIndex: true
        });

        isConnected = true;
        connectionProvider = 'MongoDB Atlas';
        console.log(`[Database] MongoDB connected successfully. (Connected to ${sanitized})`);
        return mongoose;
      } catch (err: any) {
        console.warn(`[Database] Connection attempt ${attempt}/${maxRetries} failed: ${err.message}`);
        if (attempt === maxRetries) {
          console.error('[Database] Connection failed.');
          throw new Error(`[Database] Failed to connect to MongoDB Atlas after ${maxRetries} attempts: ${err.message}`);
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  // If URI is a placeholder or not provided, launch embedded MongoDB engine (MongoMemoryServer)
  // This ensures 100% genuine MongoDB compatibility with zero external database prerequisites.
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const path = await import('path');
    const fs = await import('fs');
    const mongoDataDir = path.resolve(process.cwd(), '.mongo_data');
    if (!fs.existsSync(mongoDataDir)) {
      fs.mkdirSync(mongoDataDir, { recursive: true });
    }

    if (!memoryServerInstance) {
      memoryServerInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'darkvence'
        }
      });
    }

    const localUri = memoryServerInstance.getUri();
    await mongoose.connect(localUri, {
      dbName: 'darkvence',
      autoIndex: true
    });

    isConnected = true;
    connectionProvider = 'MongoDB (Local Embedded Engine)';
    console.log('[Database] MongoDB connected successfully.');
    return mongoose;
  } catch (embeddedErr: any) {
    console.error('[Database] Connection failed.');
    throw new Error(`[Database] MongoDB initialization failed: ${embeddedErr.message}`);
  }
}

/**
 * Close database connection gracefully
 */
export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
    memoryServerInstance = null;
  }
  isConnected = false;
  console.log('[Database] MongoDB disconnected.');
}

/**
 * Query current database status
 */
export function getDatabaseStatus(): DatabaseStatus {
  const state = mongoose.connection.readyState;
  let status: DatabaseStatus['status'] = 'disconnected';

  if (state === 1) status = 'connected';
  else if (state === 2) status = 'connecting';
  else if (state === 0) status = 'disconnected';
  else status = 'failed';

  return {
    provider: connectionProvider,
    status,
    host: mongoose.connection.host || undefined,
    name: mongoose.connection.name || undefined
  };
}
