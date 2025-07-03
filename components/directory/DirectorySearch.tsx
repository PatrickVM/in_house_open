"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, UserIcon, Church, Users, X } from "lucide-react";
import Link from "next/link";

/*
 * DIRECTORY SEARCH ENHANCEMENTS - Future Implementation Ideas
 *
 * PHASE 2 - Enhanced Search Features:
 * - Search suggestions/autocomplete for common services
 * - Search result highlighting (highlight matching terms in results)
 * - Advanced filters: location radius, specific service categories
 * - Sort options: alphabetical, most recent, most services
 * - Search history/recent searches
 * - Debounced search input (300ms delay) for performance
 *
 * PHASE 3 - Advanced Features:
 * - Server-side search API for scalability (when member count > 100)
 * - Full-text search with relevance scoring
 * - Search analytics (popular search terms, no-result queries)
 * - Saved searches for frequent lookups
 * - Export search results functionality
 * - Integration with map view for location-based search
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Virtual scrolling for large result sets
 * - Lazy loading of user details
 * - Search result caching
 * - Fuzzy search for typo tolerance
 *
 * UI/UX IMPROVEMENTS:
 * - Search filters panel (collapsible)
 * - Tag-based service filtering
 * - Member profile quick preview on hover
 * - Share member contact via generated link
 * - Print-friendly member directory view
 */

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  bio: string | null;
  services: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  verifiedAt: Date | null;
}

interface DirectorySearchProps {
  initialUsers: User[];
  churchName: string;
  isVerifiedChurchMember: boolean;
}

export default function DirectorySearch({
  initialUsers,
  churchName,
  isVerifiedChurchMember,
}: DirectorySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return initialUsers;
    }

    const searchLower = searchTerm.toLowerCase().trim();

    return initialUsers.filter((user) => {
      // Search in name (firstName + lastName)
      const fullName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (fullName.includes(searchLower)) {
        return true;
      }

      // Search in individual services (split by comma)
      if (user.services) {
        const services = user.services
          .split(",")
          .map((service) => service.trim().toLowerCase());

        if (services.some((service) => service.includes(searchLower))) {
          return true;
        }
      }

      // Search in bio
      if (user.bio && user.bio.toLowerCase().includes(searchLower)) {
        return true;
      }

      return false;
    });
  }, [initialUsers, searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (!isVerifiedChurchMember) {
    return (
      <div className="text-center py-12">
        <Church className="mx-auto h-16 w-16 text-muted-foreground opacity-20 mb-6" />
        <h2 className="text-xl font-medium mb-4">Join a Church Community</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          To access the community directory, you need to be a verified member of
          a church. Connect with a local church to see and connect with other
          members.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard/churches">
              <Church className="w-4 h-4 mr-2" />
              Find Churches
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Users className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (initialUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <UserIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
        <h2 className="mt-4 text-lg font-medium">No members found</h2>
        <p className="mt-2 text-muted-foreground">
          Be the first to complete your profile and appear in the {churchName}{" "}
          directory!
        </p>
        <Button asChild className="mt-4">
          <Link href="/profile/edit">Complete Your Profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Search Bar */}
      <div className="relative w-full md:w-auto md:min-w-[300px] mb-8">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10 pr-10"
          placeholder="Search by name or service..."
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Stats */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>
          {searchTerm ? (
            <>
              Showing {filteredUsers.length} of {initialUsers.length} member
              {initialUsers.length !== 1 ? "s" : ""} from {churchName}
              {searchTerm && (
                <span className="ml-1">matching &quot;{searchTerm}&quot;</span>
              )}
            </>
          ) : (
            <>
              Showing {initialUsers.length} verified member
              {initialUsers.length !== 1 ? "s" : ""} from {churchName}
            </>
          )}
        </span>
      </div>

      {/* No Search Results */}
      {searchTerm && filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
          <h2 className="mt-4 text-lg font-medium">No results found</h2>
          <p className="mt-2 text-muted-foreground">
            No members match &quot;{searchTerm}&quot;. Try a different search
            term.
          </p>
          <Button variant="outline" onClick={clearSearch} className="mt-4">
            Clear Search
          </Button>
        </div>
      ) : (
        /* Users Grid */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader className="pb-3">
                <CardTitle>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Church className="w-3 h-3" />
                  {churchName} Member
                  {user.verifiedAt && (
                    <span className="text-xs">
                      • Verified{" "}
                      {new Date(user.verifiedAt).toLocaleDateString()}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.bio && (
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                )}

                {(user.phone || user.email) && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      CONTACT
                    </p>
                    <div className="text-sm space-y-1">
                      {user.phone && <p>{user.phone}</p>}
                      <p>{user.email}</p>
                    </div>
                  </div>
                )}

                {user.services && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      SERVICES & SKILLS
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {user.services
                        .split(",")
                        .map((service: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {service.trim()}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
