# Ping System Setup Instructions

## Phase 1 Implementation Complete

The ping system has been implemented with the following components:

### ✅ Completed Components

1. **Database Schema** - Ping, PingPreferences, FCMToken models added
2. **API Routes** - Send ping, respond to ping, ping status, FCM registration
3. **UI Components** - PingButton, ContactInfo, UserCard with ping integration
4. **Client-side FCM** - Firebase configuration, token management hook
5. **Server-side FCM** - Firebase Admin SDK for sending notifications
6. **Directory Integration** - Contact info hidden until ping accepted

### 🔧 Firebase Configuration Required

To complete the setup, you need to configure Firebase:

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" and follow the setup wizard
3. Enable Google Analytics (optional)

#### Step 2: Add Web App to Firebase Project
1. In Project Overview, click "Add app" → Web (</> icon)
2. Register app with a nickname (e.g., "InHouse Web")
3. Copy the Firebase config object values

#### Step 3: Enable Firebase Cloud Messaging
1. Go to Project Settings → Cloud Messaging
2. Click "Generate Key Pair" under Web Push certificates
3. Copy the VAPID key

#### Step 4: Create Service Account
1. Go to Project Settings → Service accounts
2. Click "Generate new private key"
3. Download the JSON file and extract values

#### Step 5: Update Service Worker
Edit `/public/firebase-messaging-sw.js` and replace placeholders:
```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id", 
  appId: "your-app-id"
};
```

#### Step 6: Update Environment Variables
Copy `.env.example` to `.env.local` and fill in your Firebase values.

### 🧪 Testing the System

Once Firebase is configured:

1. **Start the development server**: `npm run dev`
2. **Visit the directory page**: `/directory`
3. **Allow notifications** when prompted
4. **Send a ping** to another user
5. **Check notifications** work in browser/background

### 🔍 System Features

#### For Ping Senders:
- Click "Send Ping" button on user cards
- See "Ping Sent" status while waiting
- Get notification when ping is accepted/rejected
- View contact info after acceptance

#### For Ping Recipients:
- Receive real-time FCM notifications
- Accept/Reject buttons in user cards
- Contact info becomes visible to sender upon acceptance

#### Security Features:
- Only verified church members can ping each other
- Rate limiting (10 pings per day default)
- Auto-expiration after 7 days
- Ping preferences (auto-accept, disable pings)

### 📱 Mobile Compatibility

The system is designed for future mobile app integration:
- FCM works across web and mobile
- Database schema supports device tracking
- API routes are platform-agnostic

### 🛠️ Development Notes

- Contact info is completely hidden until ping acceptance
- Ping status is cached client-side and refreshed on actions
- FCM tokens are automatically managed and rotated
- All notifications include action buttons for quick response

### 🔄 Next Steps (Future Phases)

1. **Ping Preferences UI** - User settings for auto-accept, daily limits
2. **Ping History** - View sent/received ping history
3. **Enhanced Notifications** - Rich media, action buttons
4. **Mobile App Integration** - React Native with same API
5. **Analytics Dashboard** - Ping success rates, usage metrics

The system is now ready for testing once Firebase configuration is complete!