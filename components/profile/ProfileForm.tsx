"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { User } from "@/types";
import { signOut } from "next-auth/react";

// Profile form schema
const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50)
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50)
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  churchSelection: z.string().optional(),
  churchName: z.string().max(100).optional(),
  churchWebsite: z
    .string()
    .url("Please enter a valid URL")
    .max(100)
    .optional()
    .or(z.literal("")),
  services: z
    .string()
    .max(200, "Services must be less than 200 characters")
    .optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zipCode: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface Church {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface ProfileFormProps {
  user: Partial<User> & {
    church?: {
      id: string;
      name: string;
      city: string;
      state: string;
    } | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [churches, setChurches] = useState<Church[]>([]);
  const [isLoadingChurches, setIsLoadingChurches] = useState(true);

  // Determine initial church selection
  const getInitialChurchSelection = () => {
    if (user.church?.id) {
      return user.church.id; // User is linked to an existing church
    } else if (user.churchName) {
      return "other"; // User has manual church entry
    }
    return ""; // No church selected
  };

  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
      churchSelection: getInitialChurchSelection(),
      churchName: user.churchName || "",
      churchWebsite: user.churchWebsite || "",
      services: user.services || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      zipCode: user.zipCode || "",
      phone: user.phone || "",
    },
  });

  // Watch church selection to show/hide manual entry fields
  const churchSelection = form.watch("churchSelection");

  // Fetch approved churches on component mount
  useEffect(() => {
    const fetchChurches = async () => {
      try {
        const response = await fetch("/api/churches/approved");
        if (response.ok) {
          const data = await response.json();
          setChurches(data.churches || []);
        }
      } catch (error) {
        console.error("Error fetching churches:", error);
      } finally {
        setIsLoadingChurches(false);
      }
    };

    fetchChurches();
  }, []);

  // Form submission handler
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const result = await response.json();

      if (result.verificationRequested) {
        toast.success(
          "Profile updated and church verification request submitted!"
        );
      } else {
        toast.success("Profile updated successfully!");
      }

      router.push("/profile");
      router.refresh();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete profile handler
  const handleDeleteProfile = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/users/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete profile");
      }

      toast.success("Account deleted successfully");

      // Sign out the user and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Profile deletion error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete profile. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell others about yourself..."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description about yourself that will appear in the
                    directory.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Church Information</h2>
            <FormField
              control={form.control}
              name="churchSelection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Your Church</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingChurches
                              ? "Loading churches..."
                              : "Select a church or choose Other"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {churches.map((church) => (
                        <SelectItem key={church.id} value={church.id}>
                          {church.name}, {church.city}, {church.state}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other (not listed)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select your church from the list. If your church isn't
                    listed, choose "Other" to enter it manually.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {churchSelection === "other" && (
              <div className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="churchName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Church Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First Community Church"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="churchWebsite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Church Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Services & Skills</h2>
            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Services & Skills</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Carpentry, Electrical, Plumbing, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of services or skills you can provide.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Location Information</h2>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Your City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Your State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional: Add a phone number for others to contact you
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/profile")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </div>

        {/* Delete Profile Section */}
        <div className="border-t pt-8 mt-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Danger Zone
            </h3>
            <p className="text-red-700 mb-4">
              Once you delete your account, there is no going back. This action
              cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isDeleting}
                  type="button"
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteProfile}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Yes, delete my account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </form>
    </Form>
  );
}
