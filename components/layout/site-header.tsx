"use client";

import SignOutButton from "@/components/auth/SignOutButton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { HomeIcon, MapIcon, Menu, User2Icon, UsersIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user?.role === "ADMIN";
  const isChurch = session?.user?.role === "CHURCH";

  const navigationItems = [
    {
      href: "/map",
      label: "Map",
      icon: MapIcon,
      show: true,
    },
    {
      href: "/directory",
      label: "Directory",
      icon: UsersIcon,
      show: true,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: HomeIcon,
      show: isAuthenticated,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User2Icon,
      show: isAuthenticated,
    },
    {
      href: "/admin",
      label: "Admin",
      icon: null,
      show: isAdmin,
    },
    {
      href: "/church/dashboard",
      label: "Church Dashboard",
      icon: null,
      show: isChurch,
    },
  ];

  const MobileNavItem = ({ href, label, icon: Icon, onClick }: any) => (
    <SheetClose asChild>
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex items-center space-x-3 px-4 py-3 text-lg font-medium rounded-lg transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          pathname?.startsWith(href) &&
            href !== "/" &&
            "bg-accent text-accent-foreground"
        )}
      >
        {Icon && <Icon className="h-5 w-5" />}
        <span>{label}</span>
      </Link>
    </SheetClose>
  );

  if (isMobile) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <HomeIcon className="h-6 w-6" />
            <span className="font-bold">In-House</span>
          </Link>

          {/* Mobile Menu */}
          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
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
                  <DropdownMenuItem className="p-0 hover:bg-transparent focus:bg-transparent">
                    <SignOutButton
                      variant="ghost"
                      className="w-full justify-start h-8 font-normal"
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-left">Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {navigationItems
                    .filter((item) => item.show)
                    .map((item) => (
                      <MobileNavItem
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        onClick={() => setMobileMenuOpen(false)}
                      />
                    ))}

                  {!isAuthenticated && (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <MobileNavItem
                          href="/login"
                          label="Sign in"
                          onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="px-4 py-2">
                          <Button asChild className="w-full">
                            <Link href="/register">Join now</Link>
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    );
  }

  // Desktop version (existing code with minor adjustments)
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
              <Link href="/map" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    pathname?.startsWith("/map") && "text-primary"
                  )}
                >
                  <span className="flex items-center">
                    <MapIcon className="mr-2 h-4 w-4" />
                    Map
                  </span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

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
                  <Link href="/dashboard" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname?.startsWith("/dashboard") && "text-primary"
                      )}
                    >
                      <span className="flex items-center">
                        <HomeIcon className="mr-2 h-4 w-4" />
                        Dashboard
                      </span>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

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

                {isChurch && (
                  <NavigationMenuItem>
                    <Link href="/church/dashboard" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          pathname?.startsWith("/church/dashboard") &&
                            "text-primary"
                        )}
                      >
                        Church Dashboard
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
                      <DropdownMenuItem className="p-0 hover:bg-transparent focus:bg-transparent">
                        <SignOutButton
                          variant="ghost"
                          className="w-full justify-start h-8 font-normal"
                        />
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
