import { useState, useEffect, useCallback } from 'react';
import { requestNotificationPermission } from '@/lib/firebase';

export function useFCMToken() {
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register FCM token with backend
  const registerToken = useCallback(async (fcmToken: string) => {
    try {
      const response = await fetch('/api/fcm/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: fcmToken,
          device: 'web',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register FCM token');
      }

      console.log('FCM token registered successfully');
    } catch (error) {
      console.error('Error registering FCM token:', error);
      setError('Failed to register for notifications');
    }
  }, []);

  // Request permission and get token
  const requestPermission = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fcmToken = await requestNotificationPermission();
      
      if (fcmToken) {
        setToken(fcmToken);
        setNotificationPermission('granted');
        await registerToken(fcmToken);
      } else {
        setNotificationPermission('denied');
        setError('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setError('Failed to request notification permission');
      setNotificationPermission('denied');
    } finally {
      setLoading(false);
    }
  }, [registerToken]);

  // Check current permission status
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      // If permission is already granted, try to get token
      if (Notification.permission === 'granted') {
        requestPermission();
      }
    }
  }, [requestPermission]);

  return {
    token,
    notificationPermission,
    loading,
    error,
    requestPermission,
  };
}