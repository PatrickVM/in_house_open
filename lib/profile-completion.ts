import { User } from "@/types";

interface UserWithChurch {
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  churchName?: string | null;
  services?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  phone?: string | null;
  church?: {
    id: string;
    name: string;
    city: string;
    state: string;
  } | null;
}

export function calculateProfileCompletion(user: UserWithChurch): {
  completionPercentage: number;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
} {
  // Define all profile fields with their weights and labels
  const profileFields = [
    {
      key: "firstName",
      value: user.firstName,
      label: "First Name",
      weight: 1,
    },
    {
      key: "lastName",
      value: user.lastName,
      label: "Last Name",
      weight: 1,
    },
    {
      key: "bio",
      value: user.bio,
      label: "Bio",
      weight: 1,
    },
    {
      key: "church",
      value: user.church?.name || user.churchName,
      label: "Church Information",
      weight: 1,
    },
    {
      key: "services",
      value: user.services,
      label: "Services & Skills",
      weight: 1,
    },
    {
      key: "location",
      value: user.address || (user.city && user.state),
      label: "Location",
      weight: 1,
    },
    {
      key: "phone",
      value: user.phone,
      label: "Phone Number",
      weight: 0.5, // Optional field, lower weight
    },
  ];

  // Calculate completion
  const completedFields = profileFields.filter(
    (field) => field.value && field.value.toString().trim() !== ""
  );

  const totalWeight = profileFields.reduce(
    (sum, field) => sum + field.weight,
    0
  );
  const completedWeight = completedFields.reduce(
    (sum, field) => sum + field.weight,
    0
  );

  const completionPercentage = Math.round(
    (completedWeight / totalWeight) * 100
  );

  // Get missing fields for suggestions
  const missingFields = profileFields
    .filter((field) => !field.value || field.value.toString().trim() === "")
    .map((field) => field.label);

  return {
    completionPercentage,
    completedFields: completedFields.length,
    totalFields: profileFields.length,
    missingFields,
  };
}

export function isProfileComplete(
  user: UserWithChurch,
  threshold: number = 80
): boolean {
  const { completionPercentage } = calculateProfileCompletion(user);
  return completionPercentage >= threshold;
}

export function getProfileCompletionStatus(user: UserWithChurch): {
  isComplete: boolean;
  completionPercentage: number;
  nextSteps: string[];
} {
  const { completionPercentage, missingFields } =
    calculateProfileCompletion(user);
  const isComplete = completionPercentage >= 80;

  // Prioritize missing fields for next steps
  const priorityOrder = [
    "First Name",
    "Last Name",
    "Bio",
    "Church Information",
    "Services & Skills",
    "Location",
    "Phone Number",
  ];

  const nextSteps = priorityOrder
    .filter((field) => missingFields.includes(field))
    .slice(0, 3);

  return {
    isComplete,
    completionPercentage,
    nextSteps,
  };
}
