# Church Membership Enforcement - Strategic Implementation Plan

## 🎯 **Objective**
Enforce 7-day church membership requirement for all users while providing clear communication and re-activation paths.

## 🏗️ **Architecture Overview**

### **Core Strategy**
- **Business Logic**: `churchMembershipStatus` state machine
- **Enforcement**: `isActive` field controls login access
- **Communication**: Multi-channel notifications (email + in-app)
- **Re-activation**: Automatic when user becomes `VERIFIED`

### **7-Day Rules**
| User Status | Countdown Starts | Action at Day 7 |
|-------------|-----------------|------------------|
| `NONE` | `createdAt` | Disable if still `NONE` |
| `REQUESTED` | `churchJoinRequestedAt` | Disable if still `REQUESTED` |
| `REJECTED` | `rejectionDate` | Disable if still `REJECTED` |
| `VERIFIED` → `NONE` | Status change date | New 7-day countdown |

---

## 📊 **Database Schema Changes**

### **New Fields Required**
```sql
-- Add fields to User table
ALTER TABLE "User" ADD COLUMN "membershipEnforcementExempt" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN "membershipDeadlineDate" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "warningEmailSentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "disabledReason" TEXT;
```

### **Field Purposes**
- `membershipEnforcementExempt`: Admin override flag
- `membershipDeadlineDate`: Calculated deadline (for performance)
- `warningEmailSentAt`: Track Day 5 warnings (prevent duplicates)
- `disabledReason`: Why account was disabled (for UX messaging)

---

## 🛠️ **Implementation Components**

### **Phase 1: Core Enforcement (2-3 days)**

#### **A. Authentication Enhancement**
```typescript
// File: auth.ts:35-45
// Add after password validation:
if (!user.isActive) {
  // Return error object instead of null for disabled accounts
  return { 
    error: 'ACCOUNT_DISABLED',
    reason: user.disabledReason || 'CHURCH_MEMBERSHIP_REQUIRED'
  };
}
```

#### **B. Login Page Enhancement**
```typescript
// File: app/login/page.tsx
// Add special UI state for disabled accounts
if (authError?.error === 'ACCOUNT_DISABLED') {
  return <AccountDisabledUI reason={authError.reason} />;
}
```

#### **C. Account Disabled UI Component**
```typescript
// File: components/auth/AccountDisabledUI.tsx
// Shows:
// - Why account was disabled
// - Steps to reactivate
// - Church search functionality
// - Contact support option
```

#### **D. Cron Job - Membership Enforcement**
```typescript
// File: app/api/cron/enforce-church-membership/route.ts
// Logic:
// 1. Calculate deadlines for all users
// 2. Send Day 5 warnings
// 3. Disable Day 7 accounts  
// 4. Send appropriate emails
// 5. Log all actions
```

### **Phase 2: Communication System (1-2 days)**

#### **E. Email Templates**
```typescript
// File: lib/email/templates/membership-warning.tsx
// Day 5 warning email with church search links

// File: lib/email/templates/account-disabled.tsx  
// Account disabled email with reactivation steps

// File: lib/email/templates/account-reactivated.tsx
// Welcome back email after verification
```

#### **F. Email Service Integration**
```typescript
// File: lib/email/membership-emails.ts
// Wrapper functions for sending membership-related emails
// - sendMembershipWarning()
// - sendAccountDisabled() 
// - sendAccountReactivated()
```

### **Phase 3: Admin Controls (1 day)**

#### **G. Admin User Management Enhancement**
```typescript
// File: app/admin/users/[id]/page.tsx
// Add:
// - Membership enforcement exemption toggle
// - Manual deadline extension
// - Account reactivation button
```

#### **H. Admin API Enhancements**
```typescript
// File: app/api/admin/users/[id]/route.ts  
// Add actions:
// - "exempt" - Toggle membership enforcement
// - "extend_deadline" - Give extra time
// - "reactivate" - Manual account reactivation
```

### **Phase 4: User Experience (1 day)**

#### **I. Dashboard Warnings**
```typescript
// File: app/dashboard/page.tsx
// Add banner component for users approaching deadline
// Show days remaining and church search CTA
```

#### **J. Church Status Enhancement**
```typescript
// File: components/dashboard/ChurchStatusCard.tsx
// Enhanced status display with deadline countdown
// Clear next steps for each status
```

#### **K. Automatic Re-activation**
```typescript
// File: app/api/churches/verify-member/route.ts:225
// When user becomes VERIFIED, ensure:
// - isActive = true
// - disabledReason = null  
// - Send welcome back email
```

---

## 🔄 **Data Flow Diagram**

```
Registration
    ↓
[NONE] ← Start 7-day countdown
    ↓
Day 5: Warning Email
    ↓
Day 7: isActive = false
    ↓
Login Blocked → AccountDisabledUI
    ↓
User Joins Church → REQUESTED
    ↓
Church Verifies → VERIFIED
    ↓
Auto Re-activation → isActive = true + Welcome Email
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- [ ] Deadline calculation logic
- [ ] Email template rendering
- [ ] Auth error handling
- [ ] Admin exemption logic

### **Integration Tests**  
- [ ] Full registration → disable → reactivate flow
- [ ] Email sending functionality
- [ ] Cron job execution
- [ ] Database state transitions

### **User Acceptance Testing**
- [ ] New user onboarding with countdown
- [ ] Account disable/reactivate experience
- [ ] Admin user management
- [ ] Email delivery and formatting

---

## 📅 **Implementation Timeline**

### **Week 1: Core Infrastructure**
- **Day 1-2**: Database migration + Auth enhancement
- **Day 3**: Cron job development
- **Day 4**: Basic email templates
- **Day 5**: Testing core flow

### **Week 2: User Experience**
- **Day 1**: Login page enhancement
- **Day 2**: Dashboard warnings
- **Day 3**: Admin controls  
- **Day 4**: Automatic re-activation
- **Day 5**: End-to-end testing

### **Week 3: Polish & Deploy**
- **Day 1-2**: Bug fixes and edge cases
- **Day 3**: Documentation and monitoring
- **Day 4**: Staging deployment
- **Day 5**: Production deployment

---

## 🚨 **Risk Mitigation**

### **Potential Issues**
1. **Mass Account Disabling**: Existing users suddenly disabled
2. **Email Delivery**: Warnings not reaching users
3. **Church Verification Delays**: Users stuck in REQUESTED
4. **Admin Override Abuse**: Exemptions granted inappropriately

### **Mitigation Strategies**
1. **Gradual Rollout**: Start with new users only, then expand
2. **Email Monitoring**: Track delivery rates and failures
3. **Grace Period**: Consider 24-48 hour buffer for first deployment
4. **Admin Audit Trail**: Log all exemptions and overrides

---

## 📈 **Success Metrics**

### **Technical Metrics**
- [ ] Cron job execution success rate (>99%)
- [ ] Email delivery rate (>95%)
- [ ] Login error handling (0% crashes)
- [ ] Re-activation success rate (100%)

### **Business Metrics**
- [ ] Church membership completion rate
- [ ] User retention after warning emails
- [ ] Time from disable to re-activation
- [ ] Support ticket volume

---

## 🔒 **Security Considerations**

### **Data Protection**
- [ ] Email content doesn't expose sensitive data
- [ ] Admin actions are properly authorized
- [ ] Deadline calculations are tamper-proof
- [ ] Cron job has proper authentication

### **User Privacy**  
- [ ] Disabled accounts don't leak information
- [ ] Email preferences are respected
- [ ] Church membership status is protected

---

## 📝 **Post-Implementation Monitoring**

### **Daily Checks (First 2 weeks)**
- [ ] Cron job execution logs
- [ ] Email sending success rates
- [ ] User disability/reactivation counts
- [ ] Error rates and failed logins

### **Weekly Reviews**
- [ ] User feedback and support tickets
- [ ] Church membership completion trends
- [ ] Admin usage of override features
- [ ] System performance impact

---

## 🚀 **Future Enhancements (Post-MVP)**

### **V2 Features**
- [ ] SMS notifications for warnings
- [ ] In-app notification system integration
- [ ] Automated church matching suggestions
- [ ] Bulk admin operations for exemptions

### **V3 Features**
- [ ] Machine learning for church recommendations
- [ ] Integration with external church directories  
- [ ] Advanced analytics dashboard
- [ ] Multi-language email templates

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-03  
**Status**: Ready for Review  
**Estimated Development Time**: 2-3 weeks  
**Dependencies**: Existing email service, cron infrastructure