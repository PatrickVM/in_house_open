# InHouse Connect Mobile App - Documentation

This folder contains all documentation for the InHouse Connect mobile application (React Native).

---

## 📚 Document Overview

### **1. Start Here**
📄 **[PHASE_1_START_PLAN.md](./PHASE_1_START_PLAN.md)**
- **Purpose:** Decision framework for starting Phase 1 implementation
- **Read first:** Discusses Backend First vs Mobile First approach
- **Includes:** Detailed task breakdown, timeline, code samples
- **Status:** Ready for decision

---

### **2. Project Scope**
📄 **[MOBILE_APP_PHASE_1_SCOPE.md](./MOBILE_APP_PHASE_1_SCOPE.md)**
- **Purpose:** Complete feature scope and technical specifications for Phase 1
- **Covers:**
  - What's included in Phase 1 (auth, profile, directory, ping)
  - What's deferred to Phase 2/3 (push notifications, QR codes, analytics)
  - Technology stack (React Native, Expo, React Navigation, etc.)
  - Authentication strategy (JWT-based mobile auth)
  - Backend endpoints required
  - Mobile app structure
  - Feature specifications (detailed screens and flows)
  - 8-week timeline with deliverables
  - Testing strategy
  - App Store requirements
- **Status:** Finalized, ready for implementation

---

### **3. Architecture Decisions**
📄 **[MOBILE_APP_ARCHITECTURE_DECISIONS.md](./MOBILE_APP_ARCHITECTURE_DECISIONS.md)**
- **Purpose:** Technical architecture analysis and decisions
- **Covers:**
  - Production API access (`https://in-house.tech`)
  - Monorepo vs Separate Repository (detailed comparison)
  - Development environment setup (Mac + Xcode)
  - Why Tailscale is NOT needed
  - Color scheme extraction from web app
  - CORS configuration
  - Repository structure
  - Updated timeline without Tailscale setup
- **Key Decision:** Separate repository recommended for Phase 1
- **Status:** Final decisions locked in

---

### **4. Backend Safety**
📄 **[BACKEND_SAFETY_GUARANTEE.md](./BACKEND_SAFETY_GUARANTEE.md)**
- **Purpose:** Guarantee that mobile backend changes won't affect web app
- **Covers:**
  - Detailed safety analysis for every backend change
  - Isolation principles (new files, new routes, new tables)
  - Impact assessment for each modification
  - Testing strategy before each deployment
  - Rollback plans
  - Code review guidelines
  - Incremental deployment strategy
- **Key Promise:** Web app at `https://in-house.tech` will remain 100% functional
- **Status:** Binding commitment

---

### **5. Original Strategy (Reference)**
📄 **[MOBILE_APP_COMPANION_STRATEGY.md](./MOBILE_APP_COMPANION_STRATEGY.md)**
- **Purpose:** Original mobile app concepts and planning (historical)
- **Note:** This document contains the initial exploration of mobile app concepts
- **Status:** Reference only - decisions from this doc are now in the updated documents above

---

## 🗺️ Documentation Reading Order

### **For Implementation:**
1. **PHASE_1_START_PLAN.md** - Decide backend vs mobile first
2. **MOBILE_APP_PHASE_1_SCOPE.md** - Understand full scope
3. **BACKEND_SAFETY_GUARANTEE.md** - Review safety measures
4. **MOBILE_APP_ARCHITECTURE_DECISIONS.md** - Technical reference

### **For Quick Reference:**
- **Need API info?** → ARCHITECTURE_DECISIONS.md (Section 1, 6, 7)
- **Need feature specs?** → PHASE_1_SCOPE.md (Sections 5, 6, 7, 8)
- **Need backend tasks?** → START_PLAN.md (Backend First section)
- **Need safety confirmation?** → BACKEND_SAFETY_GUARANTEE.md

---

## 🎯 Key Information Quick Reference

### **Production Environment**
- **Web URL:** https://in-house.tech
- **API Base:** https://in-house.tech/api
- **Database:** Neon PostgreSQL (production)
- **Deployment:** Vercel (auto-deploy from GitHub)

### **Mobile App**
- **Repository:** `PatrickVM/inhouse-mobile` (to be created)
- **Platform:** React Native + Expo
- **Primary Target:** iOS (Mac development)
- **API Connection:** Production API (no local setup needed)

### **Timeline**
- **Phase 1:** 8 weeks
- **Backend Setup:** Week 1 (8-12 hours)
- **Mobile Development:** Weeks 2-7
- **Polish & Testing:** Week 8

### **Key Decisions**
✅ Separate repository (not monorepo)
✅ Production API (not Tailscale)
✅ iOS first (Android later)
✅ Backend first (recommended approach)
✅ Zero web app changes (safety guaranteed)

---

## 📋 Implementation Checklist

**Before Starting:**
- [ ] Read PHASE_1_START_PLAN.md
- [ ] Review BACKEND_SAFETY_GUARANTEE.md
- [ ] Confirm production URL works: `curl https://in-house.tech/api/users/profile`
- [ ] Decide: Backend First, Mobile First, or Parallel?

**Backend First Path:**
- [ ] Create mobile auth endpoints (Week 1)
- [ ] Add database migration (Week 1)
- [ ] Set up CORS middleware (Week 1)
- [ ] Test endpoints with Postman (Week 1)
- [ ] Verify web app still works (Week 1)
- [ ] Then start mobile development (Week 2)

**Mobile First Path:**
- [ ] Create GitHub repo: `inhouse-mobile`
- [ ] Initialize Expo project
- [ ] Set up project structure
- [ ] Build theme system
- [ ] Create navigation
- [ ] Then build backend (later)

---

## 🔗 Related Documentation

**In Parent Directory (`../`):**
- `API_REFERENCE.md` - Existing API endpoints
- `PING_SETUP_INSTRUCTIONS.md` - Ping system (already implemented on web)
- `SETUP_AND_CONFIGURATION.md` - Web app setup

---

## 📞 Questions or Issues?

**If you need clarification on:**
- **Scope:** Review MOBILE_APP_PHASE_1_SCOPE.md Section "Questions & Clarifications"
- **Safety:** Review BACKEND_SAFETY_GUARANTEE.md Section "Safety Checklist"
- **Start Priority:** Review PHASE_1_START_PLAN.md Section "My Recommendation"

**All documents are ready for implementation. Next step: Decide start priority and begin!**

---

## Document History

- **2025-09-29:** Initial documentation created
  - Phase 1 scope finalized
  - Architecture decisions locked in
  - Safety guarantee documented
  - Start plan created
- **Status:** All documents approved and ready for Phase 1 implementation

---

**Last Updated:** 2025-09-29
**Total Documents:** 5
**Status:** ✅ Complete - Ready to Start