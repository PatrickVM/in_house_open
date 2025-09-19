"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Users, X, XCircle } from 'lucide-react';
import { usePingCount } from '@/hooks/usePingCount';
import { toast } from 'sonner';

interface PingNotificationBannerProps {
  onPingUpdate?: () => void;
}

interface PendingPing {
  id: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  expiresAt: string;
  message?: string;
}

export default function PingNotificationBanner({ onPingUpdate }: PingNotificationBannerProps) {
  const { pendingReceived, refreshPingCount } = usePingCount();
  const [pendingPings, setPendingPings] = useState<PendingPing[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Fetch pending ping details when component mounts or count changes
  useEffect(() => {
    if (pendingReceived > 0) {
      fetchPendingPings();
    }
  }, [pendingReceived]);

  const fetchPendingPings = async () => {
    try {
      const response = await fetch('/api/ping/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingPings(data.pings || []);
      }
    } catch (error) {
      console.error('Error fetching pending pings:', error);
    }
  };

  const handlePingResponse = async (pingId: string, action: 'ACCEPT' | 'REJECT') => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/ping/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pingId, action }),
      });

      const data = await response.json();

      if (response.ok) {
        if (action === 'ACCEPT') {
          toast.success('Ping accepted! Contact info is now visible to both of you.');
        } else {
          toast.success('Ping declined.');
        }
        
        // Remove this ping from the list
        setPendingPings(prev => prev.filter(p => p.id !== pingId));
        
        // Refresh counts
        refreshPingCount();
        onPingUpdate?.();
      } else {
        toast.error(data.error || `Failed to ${action.toLowerCase()} ping`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing ping:`, error);
      toast.error(`Failed to ${action.toLowerCase()} ping`);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  // Don't render if no pending pings or banner is dismissed
  if (pendingReceived === 0 || !isVisible) {
    return null;
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-orange-900">
                  You have {pendingReceived} pending ping{pendingReceived > 1 ? 's' : ''}
                </h3>
                <Badge variant="outline" className="border-orange-300 text-orange-700">
                  <Users className="w-3 h-3 mr-1" />
                  {pendingReceived}
                </Badge>
              </div>
              <p className="text-sm text-orange-800 mb-3">
                Other church members want to connect with you. Review and respond to their requests below.
              </p>
              
              {/* Show individual pending pings */}
              <div className="space-y-2">
                {pendingPings.slice(0, 3).map((ping) => (
                  <div 
                    key={ping.id} 
                    className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-orange-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">
                        {ping.senderName} wants to connect
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ping.createdAt).toLocaleDateString()} • 
                        Expires {new Date(ping.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handlePingResponse(ping.id, 'ACCEPT')}
                        disabled={loading}
                        className="h-7 px-3 text-xs"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePingResponse(ping.id, 'REJECT')}
                        disabled={loading}
                        className="h-7 px-3 text-xs"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
                
                {pendingPings.length > 3 && (
                  <p className="text-xs text-orange-700 pl-3">
                    + {pendingPings.length - 3} more ping{pendingPings.length - 3 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-orange-600 hover:text-orange-800 hover:bg-orange-100 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}