import { User as PrismaUser, Prisma } from "@prisma/client";

// TypeSafe enum for Item Status
export enum ItemStatus {
  AVAILABLE = "AVAILABLE",
  CLAIMED = "CLAIMED",
  COMPLETED = "COMPLETED",
}

// TypeSafe enum for Member Request Status
export enum MemberRequestStatus {
  REQUESTED = "REQUESTED",
  RECEIVED = "RECEIVED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

// TypeSafe enum for User Roles
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  CHURCH = "CHURCH",
}

// User type - using Prisma generated type
export type User = PrismaUser;

// Church type - basic interface for references
export interface Church {
  id: string;
  name: string;
  leadPastorName: string;
  website?: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number | null;
  longitude?: number | null;
  applicationStatus: string;
  leadContactId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Item type
export interface Item {
  id: string;
  title: string;
  description: string | null;
  category: string;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
  claimedAt: Date | null;
  completedAt: Date | null;
  ownerId: string;
  claimerId: string | null;
  owner: User;
  claimer?: User | null;
  // New fields for member offering
  offerToMembers: boolean;
  memberDescription: string | null;
  // Relations
  memberRequests?: MemberItemRequest[];
}

// New MemberItemRequest type
export interface MemberItemRequest {
  id: string;
  itemId: string;
  userId: string;
  churchId: string;
  requestedAt: Date;
  expiresAt: Date;
  status: MemberRequestStatus;
  memberNotes: string | null;
  // Optional relations
  item?: Item;
  user?: User;
  church?: Church;
}
