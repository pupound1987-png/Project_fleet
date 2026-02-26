'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase App and SDKs.
 * บังคับใช้ firebaseConfig เสมอเพื่อแก้ปัญหา Error app/no-options บน Vercel
 */
export function initializeFirebase() {
  let app: FirebaseApp;
  
  const existingApps = getApps();
  if (existingApps.length === 0) {
    // ใช้ค่า config จากไฟล์ config.ts เสมอเพื่อความแน่นอน
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
