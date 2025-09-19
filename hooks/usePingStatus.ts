"use client";

import { useState, useEffect } from 'react';

interface PingStatus {
  id: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  message?: string;
  isSender: boolean;
}

interface PingState {
  pingStatus: PingStatus | null;
  canSendPing: boolean;
  canViewContact: boolean;
  relationshipStatus: string;
  loading: boolean;
  error: string | null;
}

export function usePingStatus(targetUserId: string) {
  const [pingState, setPingState] = useState<PingState>({
    pingStatus: null,
    canSendPing: true,
    canViewContact: false,
    relationshipStatus: 'none',
    loading: true,
    error: null,
  });

  const fetchPingStatus = async () => {
    if (!targetUserId) return;
    
    try {
      setPingState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`/api/ping/status?targetUserId=${targetUserId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ping status');
      }
      
      const data = await response.json();
      
      setPingState({
        pingStatus: data.pingStatus,
        canSendPing: data.canSendPing,
        canViewContact: data.canViewContact,
        relationshipStatus: data.relationshipStatus,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching ping status:', error);
      setPingState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load ping status',
      }));
    }
  };

  useEffect(() => {
    fetchPingStatus();
  }, [targetUserId]);

  const refreshPingStatus = () => {
    fetchPingStatus();
  };

  return {
    ...pingState,
    refreshPingStatus,
  };
}