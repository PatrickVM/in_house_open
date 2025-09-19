import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin SDK
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

// Get Firebase Cloud Messaging instance
const messaging = getMessaging(app);

export { messaging };

// Send notification to a specific user
export async function sendNotificationToUser(
  fcmToken: string,
  notification: {
    title: string;
    body: string;
  },
  data?: Record<string, string>
) {
  try {
    const message = {
      notification,
      data,
      token: fcmToken,
    };

    const response = await messaging.send(message);
    console.log('Successfully sent message:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error };
  }
}

// Send notification to multiple users
export async function sendNotificationToUsers(
  fcmTokens: string[],
  notification: {
    title: string;
    body: string;
  },
  data?: Record<string, string>
) {
  try {
    const message = {
      notification,
      data,
      tokens: fcmTokens,
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log('Successfully sent messages:', response);
    
    // Handle partial failures
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(fcmTokens[idx]);
          console.error('Failed to send to token:', fcmTokens[idx], resp.error);
        }
      });
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens,
      };
    }
    
    return {
      success: true,
      successCount: response.successCount,
      failureCount: 0,
      failedTokens: [],
    };
  } catch (error) {
    console.error('Error sending messages:', error);
    return { success: false, error };
  }
}

export default app;