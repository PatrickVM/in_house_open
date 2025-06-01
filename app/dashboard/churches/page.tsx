import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import ChurchSelector from "@/components/dashboard/ChurchSelector";

export default async function ChurchesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/churches");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Find Your Church</h1>
        <p className="text-muted-foreground mt-2">
          Connect with a local church community to get started
        </p>
      </div>

      <ChurchSelector />
    </div>
  );
}
