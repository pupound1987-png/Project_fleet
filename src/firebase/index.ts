'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase App and SDKs.
 * Always passes the explicit firebaseConfig to prevent "app/no-options" error on Vercel.
 */
export function initializeFirebase() {
  let app: FirebaseApp;
  
  const existingApps = getApps();
  if (existingApps.length === 0) {
    // Force usage of our provided config to avoid auto-initialization failure on Vercel
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
