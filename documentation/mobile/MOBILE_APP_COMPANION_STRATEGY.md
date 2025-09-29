# InHouse Mobile App Companion Strategy

## Current InHouse Web Application Status

### **Technical Architecture**
- **Framework:** Next.js 15 with React 19
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS + Radix UI components
- **Maps:** Leaflet for interactive mapping
- **Status:** Production-ready web application

### **Core Features & Functionality**

#### **1. User Management System**
- User registration with invite codes
- Multi-role system (USER, CHURCH, ADMIN)
- Profile management with location data
- Church membership verification process

#### **2. Church Application & Management**
- Church signup with invitation tokens
- Lead pastor/contact management
- Geographic location tracking
- Application approval workflow

#### **3. Item Sharing System**
- Churches can create/manage items for sharing
- Geographic mapping of available items
- Item claiming and completion workflow
- Member-only item requests system
- Category-based organization

#### **4. Invitation & Analytics System**
- QR code generation for user invitations
- Church invitation emails
- Comprehensive analytics dashboard
- Leaderboards and conversion tracking
- Activity logging system

#### **5. Messaging System**
- Daily messages from churches to members
- User-generated content sharing (testimonies, prayer requests)
- Message scheduling and moderation
- Category-based message organization

#### **6. Admin Dashboard**
- Church application management
- User moderation tools
- System-wide analytics
- Message moderation

#### **7. Member Verification System**
- Multi-step church membership verification
- Member-to-member verification
- Status tracking and notifications

---

## Mobile App Companion Concepts

### **Concept 1: "InHouse Scan" - QR & Quick Actions App**

**Core Purpose:** Mobile-first companion for scanning, quick item discovery, and notifications

**Key Features:**
- QR code scanner for instant registration/invitations
- Push notifications for new items in your area
- Quick item claiming with GPS auto-location
- Church member verification camera tool
- Offline QR code storage for sharing

**User Journey:**
1. Scan QR code to join or invite others
2. Get notified of nearby items
3. One-tap claim/request items
4. Take photos for member verification

**Technical Approach:** React Native or Capacitor hybrid

---

### **Concept 2: "InHouse Connect" - Social & Messaging Focus**

**Core Purpose:** Church community messaging and member connection on mobile

**Key Features:**
- Daily message notifications from your church
- Share testimonies/prayer requests with voice notes
- Member directory with contact integration
- Church event calendar with location services
- Group messaging within church communities

**User Journey:**
1. Receive daily spiritual messages
2. Share personal testimonies easily
3. Connect with fellow church members
4. Get event reminders with directions

**Technical Approach:** React Native with real-time messaging

---

### **Concept 3: "InHouse Map" - Location & Discovery App**

**Core Purpose:** Geographic discovery and location-based services

**Key Features:**
- Interactive map showing all available items
- Church location finder with service times
- GPS-based item recommendations
- Route planning to pickup locations
- Location sharing for meetups
- Offline map caching

**User Journey:**
1. Open app to see items around you
2. Filter by distance/category
3. Get directions to item locations
4. Find nearby churches to visit

**Technical Approach:** Capacitor with native map plugins

---

### **Concept 4: "InHouse Lite" - Essential Actions Only**

**Core Purpose:** Streamlined mobile experience focusing on core workflows

**Key Features:**
- Simplified item browsing (no complex filters)
- One-tap item claiming/requesting
- Basic profile and church membership status
- Push notifications for claimed items
- QR code sharing for invitations
- Emergency contact for church leaders

**User Journey:**
1. Browse available items in clean list view
2. Claim/request with minimal friction
3. Get updates on your claimed items
4. Share your invite code easily

**Technical Approach:** PWA or Capacitor for speed

---

## Recommended Approach: "InHouse Scan"

**Concept 1** offers the best balance of:
- **High mobile value** - Features that work better on mobile than web
- **Quick implementation** - Leverages existing APIs
- **User adoption** - Solves real mobile-specific needs (QR codes, notifications, GPS)
- **Complementary** - Enhances rather than duplicates web experience

This approach focuses on mobile-native capabilities while keeping the full-featured experience on the web platform.

## Scoped Implementation Effort

### **Phase 1: Core Mobile Infrastructure**
- Authentication integration with existing NextAuth system
- API client setup for mobile app
- Basic navigation and layout structure
- User session management

### **Phase 2: QR Code & Scanning Features**
- QR code scanner implementation
- Integration with existing invite code system
- Offline QR code storage and generation
- Camera permissions and functionality

### **Phase 3: Item Discovery & Actions**
- GPS location services integration
- Item discovery based on proximity
- One-tap claiming/requesting workflow
- Push notification setup for new items

### **Phase 4: Member Verification Tools**
- Camera integration for member verification
- Photo upload and processing
- Integration with existing verification system
- Status tracking and updates

### **Phase 5: Polish & Optimization**
- Performance optimization
- Offline functionality
- App store preparation and deployment
- User testing and refinement

---

## Areas of Consideration

### **Technical Considerations**
- **Cross-platform compatibility** - Ensure consistent experience across iOS and Android
- **API rate limiting** - Mobile apps may generate higher API usage patterns
- **Offline functionality** - Handle network connectivity issues gracefully
- **Battery optimization** - Location services and push notifications impact battery life
- **Camera permissions** - Proper handling of camera access and photo storage
- **Push notification infrastructure** - Requires additional backend services setup

### **User Experience Considerations**
- **Authentication flow** - Seamless login between web and mobile platforms
- **Data synchronization** - Real-time updates between web and mobile experiences
- **Onboarding process** - Mobile-specific user onboarding and tutorials
- **Accessibility** - Screen reader support and mobile accessibility standards
- **Performance expectations** - Mobile users expect fast load times and smooth interactions

### **Business & Deployment Considerations**
- **App store approval** - Apple and Google Play Store review processes
- **Maintenance overhead** - Additional platform to maintain and update
- **User adoption strategy** - How to drive mobile app downloads and usage
- **Analytics integration** - Track mobile-specific user behavior and engagement
- **Support complexity** - Additional support burden for mobile-specific issues

### **Security Considerations**
- **Secure token storage** - Proper handling of authentication tokens on mobile devices
- **Camera data privacy** - Secure handling and transmission of photos
- **Location data protection** - Privacy-compliant location tracking and storage
- **Deep linking security** - Secure handling of QR code and invite link processing
- **Certificate pinning** - Additional security for API communications

### **Integration Considerations**
- **Existing user base** - Migration strategy for current web users
- **Feature parity decisions** - Which web features to include/exclude on mobile
- **Notification preferences** - User control over mobile vs email notifications
- **Data consistency** - Ensuring mobile actions reflect immediately on web platform
- **Admin tool compatibility** - How admin functions interact with mobile user actions