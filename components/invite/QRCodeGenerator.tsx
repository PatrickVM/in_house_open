"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  QrCode,
  Download,
  Share2,
  RefreshCw,
  Users,
  Eye,
  CheckCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface QRCodeData {
  qrCodeDataUrl: string;
  inviteCode: string;
  inviteUrl: string;
}

interface InviteAnalytics {
  analytics: {
    userInvitesScanned: number;
    userInvitesCompleted: number;
  };
  inviteCode: {
    code: string;
    scans: number;
    createdAt: string;
    lastScannedAt?: string;
  } | null;
  invitees: Array<{
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    createdAt: string;
  }>;
}

export default function QRCodeGenerator() {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [analytics, setAnalytics] = useState<InviteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEligible, setIsEligible] = useState(true);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/invite/qr-code");
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setIsEligible(false);
          setError(data.error);
        } else {
          throw new Error(data.error || "Failed to generate QR code");
        }
        return;
      }

      setQrData(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate QR code"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/invite/analytics");
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };

  useEffect(() => {
    fetchQRCode();
    fetchAnalytics();
  }, []);

  const handleCopyUrl = async () => {
    if (qrData?.inviteUrl) {
      await navigator.clipboard.writeText(qrData.inviteUrl);
      toast.success("Invite URL copied to clipboard!");
    }
  };

  const handleCopyCode = async () => {
    if (qrData?.inviteCode) {
      await navigator.clipboard.writeText(qrData.inviteCode);
      toast.success("Invite code copied to clipboard!");
    }
  };

  const handleDownloadQR = () => {
    if (qrData?.qrCodeDataUrl) {
      const link = document.createElement("a");
      link.download = `invite-qr-${qrData.inviteCode}.png`;
      link.href = qrData.qrCodeDataUrl;
      link.click();
      toast.success("QR code downloaded!");
    }
  };

  const handleRefresh = () => {
    fetchQRCode();
    fetchAnalytics();
  };

  if (!isEligible) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800">
            {error ||
              "Only verified church members can generate invite codes. Please join and get verified by a church to access this feature."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="py-12">
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleRefresh}
              className="mt-4 w-full"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* QR Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Your Invitation QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* QR Code Display */}
            <div className="flex-1 flex flex-col items-center space-y-4">
              {qrData?.qrCodeDataUrl && (
                <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                  <img
                    src={qrData.qrCodeDataUrl}
                    alt="Invitation QR Code"
                    className="w-64 h-64"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleDownloadQR} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Code and URL Details */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Invite Code
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-3 bg-muted rounded font-mono text-lg">
                    {qrData?.inviteCode}
                  </code>
                  <Button onClick={handleCopyCode} size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Invite URL
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-3 bg-muted rounded text-sm break-all">
                    {qrData?.inviteUrl}
                  </code>
                  <Button onClick={handleCopyUrl} size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics?.inviteCode?.scans || 0}
                    </div>
                    <div className="text-sm text-blue-600">QR Scans</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics?.invitees?.length || 0}
                    </div>
                    <div className="text-sm text-green-600">Sign-ups</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Card */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Invitation Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.analytics.userInvitesScanned}
                </div>
                <div className="text-sm text-muted-foreground">Total Scans</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.analytics.userInvitesCompleted}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.invitees.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Users
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-amber-600">
                  {analytics.analytics.userInvitesScanned > 0
                    ? Math.round(
                        (analytics.analytics.userInvitesCompleted /
                          analytics.analytics.userInvitesScanned) *
                          100
                      )
                    : 0}
                  %
                </div>
                <div className="text-sm text-muted-foreground">Conversion</div>
              </div>
            </div>

            {/* Recent Invitees */}
            {analytics.invitees.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Recent Invitees</h4>
                <div className="space-y-2">
                  {analytics.invitees.slice(0, 5).map((invitee) => (
                    <div
                      key={invitee.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {invitee.firstName && invitee.lastName
                            ? `${invitee.firstName} ${invitee.lastName}`
                            : invitee.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invitee.email}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Joined
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(invitee.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Scan */}
            {analytics.inviteCode?.lastScannedAt && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  Last scanned:{" "}
                  {new Date(
                    analytics.inviteCode.lastScannedAt
                  ).toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>How to Share Your Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">📱 Mobile Sharing</h4>
              <p className="text-sm text-muted-foreground">
                Show the QR code to someone in person, or save it to your photos
                to share via text or social media.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🔗 URL Sharing</h4>
              <p className="text-sm text-muted-foreground">
                Copy the invite URL and share it via email, text, or messaging
                apps. The code will be automatically applied.
              </p>
            </div>
          </div>
          <Alert>
            <AlertDescription>
              <strong>Share with confidence:</strong> Your personal invite code
              can be used by multiple trusted friends and family. Each
              successful registration will be tracked, and you'll get credit for
              every new member you help join our community.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
