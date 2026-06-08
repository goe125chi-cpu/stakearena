'use client'
import { useEffect } from 'react';

export default function OneSignalInit({ userId }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal) => {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '5315263f-7436-4ef5-80b5-8a2e5080e3f1',
          safari_web_id: '',
          notifyButton: { enable: false },
          allowLocalhostAsSecureOrigin: true,
        });

        // Set external user ID so we can target specific users
        if (userId) {
          await OneSignal.login(userId);
        }

        // Request permission
        await OneSignal.Notifications.requestPermission();
      });
    };

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [userId]);

  return null;
}

// Helper function to send notifications
export const sendNotification = async (userIds, title, message, url) => {
  try {
    await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds, title, message, url })
    });
  } catch (e) {
    console.error('Send notification error:', e);
  }
};
