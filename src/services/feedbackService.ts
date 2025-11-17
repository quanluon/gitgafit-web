import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from './firebase';

export interface FeedbackPayload {
  message: string;
  email?: string;
  context: string;
  userId?: string;
  path?: string;
}

const feedbackCollection = collection(firestore, 'beta-feedback');

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  await addDoc(feedbackCollection, {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

