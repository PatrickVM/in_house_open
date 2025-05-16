"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  churchApplicationSchema,
  type ChurchApplicationValues,
} from "@/lib/validators/church-application";
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
import { Checkbox } from "@/components/ui/checkbox"; // For consent
import { toast } from "sonner";

interface ChurchApplicationFormProps {
  // Props for API submission success/error, current user, etc. can be added later
  onFormSubmit: (
    values: ChurchApplicationValues & { consent: boolean }
  ) => Promise<{ success: boolean; message?: string }>;
}

export default function ChurchApplicationForm({
  onFormSubmit,
}: ChurchApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChurchApplicationValues & { consent: boolean }>({
    resolver: zodResolver(
      churchApplicationSchema.extend({
        consent: z.boolean().refine((val) => val === true, {
          message: "You must agree to the terms to submit an application.",
        }),
      })
    ),
    defaultValues: {
      name: "",
      leadPastorName: "",
      website: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      consent: false,
    },
  });

  async function onSubmit(
    values: ChurchApplicationValues & { consent: boolean }
  ) {
    setIsSubmitting(true);
    try {
      const result = await onFormSubmit(values); // Call the server action

      if (result.success) {
        toast.success(result.message || "Application submitted successfully!");
        form.reset(); // Reset form on success
      } else {
        toast.error(result.message || "Failed to submit application.");
      }
    } catch (error) {
      // This catch block might not be strictly necessary if onFormSubmit always returns a structured error
      console.error("Error in onSubmit after calling onFormSubmit:", error);
      toast.error(
        "An unexpected client-side error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Church Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Grace Community Church" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="leadPastorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead Pastor's Full Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Church Website (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., https://yourchurch.org" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h3 className="text-lg font-medium pt-4 border-t">Church Location</h3>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 123 Main St" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Anytown" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>State *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., CA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>ZIP Code *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 90210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Consent & Agreement *</FormLabel>
                <FormDescription>
                  By submitting this application, you affirm that the
                  information provided is accurate and that you agree to InHouse
                  Network's terms of service for participating churches. (Actual
                  terms to be detailed elsewhere).
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting Application..." : "Submit Application"}
        </Button>
      </form>
    </Form>
  );
}
