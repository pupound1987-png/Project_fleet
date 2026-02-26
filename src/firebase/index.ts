'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase App and SDKs.
 * บังคับใช้ค่า Config จาก config.ts เสมอเพื่อแก้ปัญหา Error app/no-options บน Vercel ให้หายขาด
 */
export function initializeFirebase() {
  let app: FirebaseApp;
  
  const existingApps = getApps();
  if (existingApps.length === 0) {
    // ป้องกันการแชร์คอนฟิกที่ผิดพลาดด้วยการส่ง config เข้าไปตรงๆ
    app = initializeApp(firebaseConfig);
  } else {
    // หากมีอยู่แล้ว ให้ดึงแอปเริ่มต้นมาใช้
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
