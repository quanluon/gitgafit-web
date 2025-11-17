declare module 'firebase/firestore' {
  import { FirebaseApp } from 'firebase/app';

  export interface Firestore {}
  export interface CollectionReference<T = unknown> {}

  export function getFirestore(app: FirebaseApp): Firestore;
  export function collection<T = unknown>(db: Firestore, path: string): CollectionReference<T>;
  export function addDoc<T>(ref: CollectionReference<T>, data: T): Promise<void>;
  export function serverTimestamp(): unknown;
}

