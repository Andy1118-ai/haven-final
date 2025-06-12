import { useEffect } from 'react';
import { router } from 'expo-router';

export default function IndexScreen() {
  useEffect(() => {
    // Check if user is authenticated
    // For demo purposes, redirect to auth
    router.replace('/(auth)/signin');
  }, []);

  return null;
}