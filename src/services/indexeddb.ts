import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { TrainingSession } from '@/types/workout';

interface GigaFitDB extends DBSchema {
  trainingSessions: {
    key: string;
    value: TrainingSession;
    indexes: { 'by-status': string };
  };
  offlineQueue: {
    key: string;
    value: {
      url: string;
      method: string;
      data: unknown;
      timestamp: number;
    };
  };
}

class IndexedDBService {
  private db: IDBPDatabase<GigaFitDB> | null = null;
  private readonly DB_NAME = 'gigafit-db';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    this.db = await openDB<GigaFitDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Training sessions store
        if (!db.objectStoreNames.contains('trainingSessions')) {
          const trainingStore = db.createObjectStore('trainingSessions', { keyPath: '_id' });
          trainingStore.createIndex('by-status', 'status');
        }

        // Offline queue store
        if (!db.objectStoreNames.contains('offlineQueue')) {
          db.createObjectStore('offlineQueue', { keyPath: 'timestamp' });
        }
      },
    });
  }

  async saveTrainingSession(session: TrainingSession): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('trainingSessions', session);
  }

  async getTrainingSession(id: string): Promise<TrainingSession | undefined> {
    if (!this.db) await this.init();
    return this.db!.get('trainingSessions', id);
  }

  async getAllTrainingSessions(): Promise<TrainingSession[]> {
    if (!this.db) await this.init();
    return this.db!.getAll('trainingSessions');
  }

  async deleteTrainingSession(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('trainingSessions', id);
  }

  async addToOfflineQueue(url: string, method: string, data: unknown): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.add('offlineQueue', {
      url,
      method,
      data,
      timestamp: Date.now(),
    });
  }

  async getOfflineQueue(): Promise<
    Array<{ url: string; method: string; data: unknown; timestamp: number }>
  > {
    if (!this.db) await this.init();
    return this.db!.getAll('offlineQueue');
  }

  async clearOfflineQueue(): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.clear('offlineQueue');
  }
}

export const indexedDBService = new IndexedDBService();

