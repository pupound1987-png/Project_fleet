'use client';

import React, { useMemo, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase, initiateAnonymousSignIn } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    // Automatically sign in anonymously if no user is currently logged in.
    // This ensures that the 'isSignedIn()' check in Firestore rules passes.
    if (firebaseServices.auth) {
      const unsubscribe = firebaseServices.auth.onAuthStateChanged((user) => {
        if (!user) {
          initiateAnonymousSignIn(firebaseServices.auth);
        }
      });
      return () => unsubscribe();
    }
  }, [firebaseServices.auth]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
