'use client';

import { useEffect, useState } from 'react';

interface TokenData {
  current: number;
  max: number;
  percentage: number;
  error?: string;
}

let updateInterval: ReturnType<typeof setInterval> | null = null;
let lastUpdate = 0;

// Shared state for all instances
let sharedTokenData: TokenData = {
  current: 0,
  max: 200000,
  percentage: 0
};

const listeners = new Set<(data: TokenData) => void>();

async function fetchTokenData() {
  try {
    // Use API endpoint instead of static file
    const response = await fetch('/api/openclaw-status?' + Date.now());
    if (response.ok) {
      const data = await response.json();
      sharedTokenData = {
        current: data.current || 0,
        max: data.max || 200000,
        percentage: data.percentage || 0
      };
    } else {
      // If API fails, keep previous data
      console.error('API response not ok:', response.status);
    }
    
    // Notify all listeners
    listeners.forEach(listener => listener(sharedTokenData));
    lastUpdate = Date.now();
    
  } catch (error) {
    console.error('Error fetching token data:', error);
    // Keep existing data on error
  }
}

// Start polling if not already running
function startPolling() {
  if (!updateInterval) {
    // Initial fetch
    fetchTokenData();
    
    // Poll every 5 seconds
    updateInterval = setInterval(fetchTokenData, 5000);
  }
}

// Stop polling when no listeners
function stopPolling() {
  if (updateInterval && listeners.size === 0) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

export function useOpenClawTokens() {
  const [tokens, setTokens] = useState<TokenData>(sharedTokenData);

  useEffect(() => {
    // Add listener
    listeners.add(setTokens);
    startPolling();
    
    // Update immediately if we have recent data
    if (Date.now() - lastUpdate < 5000) {
      setTokens(sharedTokenData);
    } else {
      fetchTokenData();
    }
    
    // Cleanup
    return () => {
      listeners.delete(setTokens);
      stopPolling();
    };
  }, []);

  return tokens;
}