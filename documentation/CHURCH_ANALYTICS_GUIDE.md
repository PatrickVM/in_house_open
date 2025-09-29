# Church Invitation Analytics Dashboard Guide

## Overview

The Church Invitation Analytics Dashboard provides church leaders with comprehensive insights into their church members' invitation activity. This dashboard is specifically designed for church lead contacts to monitor and understand their congregation's outreach efforts.

## Access & Navigation

### Requirements

- **Role**: Church lead contact (CHURCH role)
- **Church Status**: Approved church application
- **Path**: `/church/dashboard/invitations`

### Navigation

The dashboard is accessible through the church sidebar navigation:

```
Church Dashboard
├── Overview
├── Members
├── Invitations ← New feature
└── Area Items
```

## Dashboard Structure

### Tab Layout

The dashboard consists of two main tabs:

1. **Invitations** (Default) - Detailed invitation activity
2. **Member Board** - Individual member leaderboard

## Invitations Tab

### Filter Section

The filter section allows church leaders to refine their view of invitation data:

**Status Filter**

- Multiple selection dropdown
- Options: PENDING, CLAIMED, EXPIRED, CANCELLED
- Default: All statuses

**Date Range Filter**

- Preset options: Last 7 days, This month, All time
- Custom date ranges supported
- Default: All time

**Type Filter**

- Toggle between "Church Invitations" and "User Invitations"
- Church: Invitations to church contacts
- User: QR code invitations to individuals

**Reset Functionality**

- "Reset Filters" button clears all selections
- Returns to default view

### Invitations Table

**Data Scope**

- Shows only invitations sent by verified members of the current church
- Automatically filtered by church membership
- No cross-church data visibility

**Columns**

- **Member Name**: Church member who sent the invitation
- **Invitee Email**: Email address of invitation recipient
- **Date Sent**: When the invitation was sent (with relative time)
- **Status**: Visual status indicator with color coding
- **Actions**: Currently view-only (no modification capabilities)

**Pagination**

- Default: 15 items per page
- Options: 10, 15, 25, 50 items per page
- Full pagination controls with page numbers

**Sorting**

- Default: Most recent invitations first
- Sortable by date and status

### Status Indicators

**Visual Status System**

- 🟡 **PENDING**: Invitation sent, awaiting response
- 🟢 **CLAIMED**: Recipient has registered/joined
- 🔴 **EXPIRED**: Invitation expired (7 days for church invitations)
- ⚫ **CANCELLED**: Invitation was cancelled

**Cross-Church Invitations**
When a church member invites someone who joins a different church:

- Invitation shows as "CLAIMED"
- Claimant email is displayed
- No special handling required

## Member Board Tab

### Individual Member Statistics

The Member Board provides transparency into individual member performance:

**Top Categories**

1. **Top Converters** - Highest conversion rate
2. **Most Active Inviters** - Highest scan count
3. **Church-Wide Statistics** - Overall metrics

### Top Converters

**Metrics Displayed**

- Member name and email
- Total invitations sent
- Total scans received
- Successful conversions
- Conversion rate percentage

**Calculation**

```
Conversion Rate = (Completed Invitations / Scanned Invitations) × 100
```

**Ranking**

- Ordered by conversion rate (highest first)
- Minimum threshold: 3+ scans for ranking

### Most Active Inviters

**Metrics Displayed**

- Member name and email
- Total QR code scans
- Total invitations sent
- Activity level indicator

**Ranking**

- Ordered by total scan count
- Shows engagement level

### Church-Wide Statistics

**Aggregate Metrics**

- Total Church Invitations Sent
- Total User Invitations (QR codes)
- Total Scans Across All Members
- Total Conversions
- Overall Church Conversion Rate

**Performance Indicators**

- Month-over-month growth
- Comparison to previous periods
- Trend analysis

## Data Privacy & Security

### Church-Scoped Data

- All data is automatically filtered to the current church
- No cross-church data access possible
- Lead contact authentication required

### Member Privacy

- Full transparency model: Church leaders can see all member activity
- Individual member performance is visible
- No sensitive personal data exposed

### Security Measures

- Session-based authentication
- Church ownership validation
- Secure API endpoints
- Rate limiting on requests

## Technical Implementation

### Database Queries

**Church Member Identification**

```sql
-- Get verified church members
SELECT * FROM users
WHERE churchId = ?
AND churchMembershipStatus = 'VERIFIED'
```

**Church-Scoped Invitations**

```sql
-- Church invitations by church members
SELECT * FROM church_invitations
WHERE inviterEmail IN (church_member_emails)

-- User invitations by church members
SELECT * FROM invite_codes
WHERE userId IN (church_member_ids)
```

### API Endpoints

**Church Analytics APIs**

- `GET /api/church/analytics/invitations` - Invitation data
- `GET /api/church/analytics/leaderboard` - Member statistics
- `GET /api/church/analytics/member-stats` - Individual metrics

### Performance Optimization

**Database Indexes**

- `churchId` and `churchMembershipStatus` for member queries
- `inviterEmail` for invitation filtering
- `userId` for invite code lookup

**Caching Strategy**

- Church member IDs cached for filter queries
- Aggregate statistics cached for performance
- Real-time data for invitation status

## User Experience Features

### Loading States

- Skeleton loaders during data fetch
- Progressive loading for large datasets
- Smooth transitions between tabs

### Error Handling

- Graceful error messages
- Retry mechanisms for failed requests
- Fallback states for missing data

### Responsive Design

- Mobile-friendly table display
- Adaptive pagination controls
- Touch-friendly filter interface

### Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode compatibility

## Future Enhancements

### Planned Features (Phase 3+)

**Invitation Management**

- Expire invitations sent by members
- Resend failed invitations
- Cancel pending invitations

**Advanced Analytics**

- Trend analysis over time
- Comparative church performance
- Detailed conversion funnel

**Export Capabilities**

- CSV export of invitation data
- PDF reports for church leadership
- Scheduled report delivery

**Notification System**

- Email alerts for invitation status changes
- Weekly summary reports
- Goal achievement notifications

## Troubleshooting

### Common Issues

**No Data Showing**

- Verify church has verified members
- Check that members have sent invitations
- Confirm church approval status

**Performance Issues**

- Large churches may experience slower load times
- Pagination helps with large datasets
- Contact support for optimization

**Access Denied**

- Ensure user has CHURCH role
- Verify church application is approved
- Check lead contact assignment

### Support Contacts

**Technical Issues**

- Check API endpoint responses
- Review browser console for errors
- Verify session authentication

**Data Discrepancies**

- Compare with admin analytics
- Check invitation timestamps
- Verify member church assignments

## Best Practices

### For Church Leaders

**Monitoring Strategy**

- Review analytics weekly
- Focus on conversion rates over volume
- Celebrate top performers

**Member Engagement**

- Share success stories
- Provide invitation training
- Set reasonable goals

**Data Interpretation**

- Consider seasonal variations
- Look at trends over time
- Balance individual and church metrics

### For System Administrators

**Performance Monitoring**

- Track query execution times
- Monitor memory usage
- Optimize slow queries

**Data Integrity**

- Regular backup verification
- Audit trail maintenance
- Cross-reference with admin data

## Conclusion

The Church Invitation Analytics Dashboard provides church leaders with powerful insights into their congregation's outreach efforts. By offering both detailed invitation tracking and individual member performance metrics, it enables data-driven decisions to improve community growth and engagement.

The dashboard is designed with security, performance, and usability in mind, ensuring that church leaders can effectively monitor and encourage their members' invitation activities while maintaining appropriate data privacy and access controls.
