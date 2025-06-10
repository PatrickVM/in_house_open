"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  User,
  Building,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Globe,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  churchSignupSchema,
  type ChurchSignupInput,
} from "@/lib/validators/church-invitation";

interface ChurchSignupFlowProps {
  token: string;
  inviterName: string;
  inviterEmail: string;
  customMessage?: string;
}

export default function ChurchSignupFlow({
  token,
  inviterName,
  inviterEmail,
  customMessage,
}: ChurchSignupFlowProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ChurchSignupInput>({
    resolver: zodResolver(churchSignupSchema),
  });

  const onSubmit = async (data: ChurchSignupInput) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/church-signup/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to complete signup");
      }

      toast.success(
        "Account created and church application submitted successfully!"
      );
      router.push("/login?message=signup-success");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to complete signup";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* User Registration Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              Create Your Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name *
                </Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    {...register("firstName")}
                    className={
                      errors.firstName ? "border-red-500 pl-10" : "pl-10"
                    }
                  />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name *
                </Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...register("lastName")}
                    className={
                      errors.lastName ? "border-red-500 pl-10" : "pl-10"
                    }
                  />
                </div>
                {errors.lastName && (
                  <p className="text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500 pl-10" : "pl-10"}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and
                number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number (Optional)
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  {...register("phone")}
                  className={errors.phone ? "border-red-500 pl-10" : "pl-10"}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Church Application Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Building className="h-4 w-4 text-primary" />
              </div>
              Church Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="churchName" className="text-sm font-medium">
                  Church Name *
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="churchName"
                    placeholder="First Baptist Church"
                    {...register("churchName")}
                    className={
                      errors.churchName ? "border-red-500 pl-10" : "pl-10"
                    }
                  />
                </div>
                {errors.churchName && (
                  <p className="text-sm text-red-600">
                    {errors.churchName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadPastorName" className="text-sm font-medium">
                  Lead Pastor Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="leadPastorName"
                    placeholder="Pastor John Smith"
                    {...register("leadPastorName")}
                    className={
                      errors.leadPastorName ? "border-red-500 pl-10" : "pl-10"
                    }
                  />
                </div>
                {errors.leadPastorName && (
                  <p className="text-sm text-red-600">
                    {errors.leadPastorName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="churchWebsite" className="text-sm font-medium">
                Church Website (Optional)
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="churchWebsite"
                  type="url"
                  placeholder="https://www.yourchurch.org"
                  {...register("churchWebsite")}
                  className={
                    errors.churchWebsite ? "border-red-500 pl-10" : "pl-10"
                  }
                />
              </div>
              {errors.churchWebsite && (
                <p className="text-sm text-red-600">
                  {errors.churchWebsite.message}
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Church Location
              </h4>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Street Address *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    {...register("address")}
                    className={
                      errors.address ? "border-red-500 pl-10" : "pl-10"
                    }
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-red-600">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    City *
                  </Label>
                  <Input
                    id="city"
                    placeholder="Springfield"
                    {...register("city")}
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium">
                    State *
                  </Label>
                  <Input
                    id="state"
                    placeholder="IL"
                    {...register("state")}
                    className={errors.state ? "border-red-500" : ""}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-600">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm font-medium">
                    ZIP Code *
                  </Label>
                  <Input
                    id="zipCode"
                    placeholder="62701"
                    {...register("zipCode")}
                    className={errors.zipCode ? "border-red-500" : ""}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-600">
                      {errors.zipCode.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {submitError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {submitError}
            </AlertDescription>
          </Alert>
        )}

        {/* Next Steps Info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              What happens next?
            </h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>Your account will be created immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>
                  Your church application will be submitted for admin review
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>
                  You'll receive an email confirmation with next steps
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>
                  Once approved, you can start managing your church on InHouse
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 text-base font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Account & Submitting Application...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Create Account & Submit Church Application
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
