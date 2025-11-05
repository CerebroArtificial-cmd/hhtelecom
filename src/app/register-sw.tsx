"use client";
import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try {
          await navigator.serviceWorker.register('/sw.js');
        } catch (e) {
          // noop
        }
      };
      // delay to ensure Next has hydrated
      const id = setTimeout(register, 500);
      return () => clearTimeout(id);
    }
  }, []);
  return null;
}
