"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  MessageCircle, 
  XCircle, 
  Zap 
} from 'lucide-react';
import { toast } from 'sonner';
import { usePingCount } from '@/hooks/usePingCount';

interface PingButtonProps {
  targetUserId: string;
  currentUserId: string;
  pingStatus: any;
  canSendPing: boolean;
  canViewContact: boolean;
  relationshipStatus: string;
  onPingUpdate: () => void;
}

export default function PingButton({
  targetUserId,
  currentUserId,
  pingStatus,
  canSendPing,
  canViewContact,
  relationshipStatus,
  onPingUpdate,
}: PingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshPingCount } = usePingCount();

  const handleSendPing = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ping/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: targetUserId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          data.autoAccepted 
            ? 'Ping auto-accepted! Contact info is now visible.'
            : 'Ping sent successfully!'
        );
        onPingUpdate();
        refreshPingCount();
      } else {
        toast.error(data.error || 'Failed to send ping');
      }
    } catch (error) {
      console.error('Error sending ping:', error);
      toast.error('Failed to send ping');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToPing = async (action: 'ACCEPT' | 'REJECT') => {
    if (!pingStatus?.id) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ping/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pingId: pingStatus.id,
          action,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (action === 'ACCEPT') {
          toast.success('Ping accepted! Contact info is now visible to both of you.');
        } else {
          toast.success('Ping declined.');
        }
        onPingUpdate();
        refreshPingCount();
      } else {
        toast.error(data.error || `Failed to ${action.toLowerCase()} ping`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing ping:`, error);
      toast.error(`Failed to ${action.toLowerCase()} ping`);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show anything for current user
  if (targetUserId === currentUserId) {
    return null;
  }

  // Show status badges and buttons based on relationship status
  switch (relationshipStatus) {
    case 'connected':
      return (
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        </div>
      );

    case 'pending_sent':
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-blue-200 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Ping Sent
          </Badge>
        </div>
      );

    case 'pending_received':
      return (
        <div className="space-y-2">
          <Badge variant="outline" className="border-orange-200 text-orange-800 mb-2">
            <AlertCircle className="w-3 h-3 mr-1" />
            Ping Received
          </Badge>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleRespondToPing('ACCEPT')}
              disabled={isLoading}
              className="flex-1"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRespondToPing('REJECT')}
              disabled={isLoading}
              className="flex-1"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Decline
            </Button>
          </div>
        </div>
      );

    case 'none':
    default:
      if (canSendPing) {
        return (
          <Button
            onClick={handleSendPing}
            disabled={isLoading}
            size="sm"
            className="w-full"
          >
            <Zap className="w-3 h-3 mr-1" />
            {isLoading ? 'Sending...' : 'Send Ping'}
          </Button>
        );
      }
      return null;
  }
}