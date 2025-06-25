import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarIcon, CheckCircleIcon, UsersIcon } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6 space-y-10 xl:space-y-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                Community Directory
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Connect with your community
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                A private directory for connecting local services and skills.
                Share your talents and discover others in your community.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg">
                  <Link href="/register">Join the community</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/directory">Explore the directory</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto max-w-sm lg:max-w-none">
              <div className="aspect-video overflow-hidden rounded-xl bg-primary-foreground/30 object-cover shadow-xl">
                <div className="p-6 md:p-10 flex flex-col space-y-6">
                  <div className="rounded-xl bg-background p-4 shadow-sm">
                    <div className="space-y-2">
                      <h3 className="font-semibold">John Doe</h3>
                      <p className="text-sm text-muted-foreground">
                        Carpentry, Electrical, Plumbing
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <UsersIcon className="h-4 w-4 text-blue-500" />
                        <span>Echo Community Church</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-background p-4 shadow-sm">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Jane Smith</h3>
                      <p className="text-sm text-muted-foreground">
                        Tutoring, Child Care, Web Development
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <UsersIcon className="h-4 w-4 text-blue-500" />
                        <span>Mercy Chapel</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                How It Works
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Grow your community together
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                In-House helps you connect with local service providers through
                your trusted network.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col justify-between items-center space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="p-3 rounded-full bg-primary/10">
                <UsersIcon className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="font-bold">Create your profile</h3>
                <p className="text-sm text-muted-foreground">
                  Add your skills, services, and church information to be found
                  in the directory.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between items-center space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="p-3 rounded-full bg-primary/10">
                <CheckCircleIcon className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="font-bold">Invite someone new</h3>
                <p className="text-sm text-muted-foreground">
                  Generate a unique QR code to invite one trusted person to join
                  the community.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between items-center space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="p-3 rounded-full bg-primary/10">
                <CalendarIcon className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="font-bold">Discover services</h3>
                <p className="text-sm text-muted-foreground">
                  Browse the directory to find local services offered by
                  community members.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to get started?
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join our growing community of service providers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg">
                <Link href="/register">Create your account</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
