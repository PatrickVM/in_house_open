import { User as PrismaUser, Prisma } from "@prisma/client";

// TypeSafe enum for Item Status
export enum ItemStatus {
  AVAILABLE = "AVAILABLE",
  CLAIMED = "CLAIMED",
  COMPLETED = "COMPLETED",
}

// TypeSafe enum for User Roles
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  CHURCH = "CHURCH",
}

// Extended User type with location fields
export interface User extends PrismaUser {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
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
}
