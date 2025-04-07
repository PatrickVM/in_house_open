"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, HomeIcon, UsersIcon, User2Icon } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user?.role === "ADMIN";

  const handleSignOut = async () => {
    await signOut({ redirect: true, redirectTo: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <HomeIcon className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">In-House</span>
        </Link>
        <NavigationMenu className="ml-auto">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/directory" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <span className="flex items-center">
                    <UsersIcon className="mr-2 h-4 w-4" />
                    Directory
                  </span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {isAuthenticated ? (
              <>
                <NavigationMenuItem>
                  <Link href="/profile" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname?.startsWith("/profile") && "text-primary"
                      )}
                    >
                      <span className="flex items-center">
                        <User2Icon className="mr-2 h-4 w-4" />
                        Profile
                      </span>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                {isAdmin && (
                  <NavigationMenuItem>
                    <Link href="/admin" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          pathname?.startsWith("/admin") && "text-primary"
                        )}
                      >
                        Admin
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )}

                <NavigationMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8 ml-2"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {session?.user?.name
                              ? session.user.name[0]
                              : session?.user?.email?.[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/invite">Invite</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>
              </>
            ) : (
              <>
                <NavigationMenuItem>
                  <Link href="/login" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Sign in
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button asChild size="sm">
                    <Link href="/register">Join now</Link>
                  </Button>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
