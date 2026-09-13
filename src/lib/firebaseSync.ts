import { 
  collection, 
  doc, 
  setDoc, 
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, Job, TaskSubmission, WalletTransaction } from '../types';

export const saveUserToFirestore = async (user: UserProfile) => {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (err) {
    console.warn('Firestore user save warning:', err);
  }
};

export const saveJobToFirestore = async (job: Job) => {
  try {
    const jobRef = doc(db, 'jobs', job.id);
    await setDoc(jobRef, job, { merge: true });
  } catch (err) {
    console.warn('Firestore job save warning:', err);
  }
};

export const saveSubmissionToFirestore = async (submission: TaskSubmission) => {
  try {
    const subRef = doc(db, 'submissions', submission.id);
    await setDoc(subRef, submission, { merge: true });
  } catch (err) {
    console.warn('Firestore submission save warning:', err);
  }
};

export const saveTransactionToFirestore = async (transaction: WalletTransaction) => {
  try {
    const trxRef = doc(db, 'transactions', transaction.id);
    await setDoc(trxRef, transaction, { merge: true });
  } catch (err) {
    console.warn('Firestore transaction save warning:', err);
  }
};

export const loadJobsFromFirestore = async (): Promise<Job[] | null> => {
  try {
    const snap = await getDocs(collection(db, 'jobs'));
    if (!snap.empty) {
      const list: Job[] = [];
      snap.forEach(d => list.push(d.data() as Job));
      return list;
    }
    return null;
  } catch (err) {
    console.warn('Firestore loadJobs warning:', err);
    return null;
  }
};
