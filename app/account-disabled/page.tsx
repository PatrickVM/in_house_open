import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowRight, Mail, Search } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import AccountDisabledContent from "./AccountDisabledContent";

export default function AccountDisabledPage() {
  return (
    <Suspense fallback={<AccountDisabledFallback />}>
      <AccountDisabledContent />
    </Suspense>
  );
}

function AccountDisabledFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Loading...</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
