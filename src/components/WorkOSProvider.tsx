import React, { createContext, useContext, useEffect, useState } from 'react';
import { useConvexAuth } from 'convex/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, convexMutation } from '@convex-dev/react-query';
import { api } from '../../convex/_generated/api';

// Create context for WorkOS authentication
interface WorkOSContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  organization: any | null;
  login: (provider: string) => Promise<void>;
  logout: () => Promise<void>;
  createOrganization: (name: string, domain?: string) => Promise<any>;
}

const WorkOSContext = createContext<WorkOSContextType | undefined>(undefined);

export function WorkOSProvider({ children }: { children: React.ReactNode }) {
  const { isLoading: convexLoading, isAuthenticated } = useConvexAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Get the current user data
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => convexQuery(api.workos.getUser, {}),
    enabled: isAuthenticated,
  });
  
  // Get the user's organization
  const { data: organization } = useQuery({
    queryKey: ['organization'],
    queryFn: () => convexQuery(api.workos.getUserOrganization, {}),
    enabled: isAuthenticated && !!user,
  });
  
  // Mutations
  const generateAuthUrl = useMutation({
    mutationFn: (args: { provider: string, redirectUri: string }) => 
      convexMutation(api.workos.generateAuthUrl, args),
  });
  
  const createOrganizationMutation = useMutation({
    mutationFn: (args: { name: string, domain?: string }) => 
      convexMutation(api.workos.createOrganization, args),
  });
  
  useEffect(() => {
    // Check for authentication callback in URL
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    
    if (code && !isAuthenticated) {
      // Handle the authentication callback
      const handleCallback = async () => {
        try {
          const redirectUri = `${window.location.origin}/auth/callback`;
          const result = await convexMutation(api.workos.handleAuthCallback, {
            code,
            redirectUri,
          });
          
          // Clear the URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Authentication error:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      handleCallback();
    } else {
      setIsLoading(convexLoading);
    }
  }, [convexLoading, isAuthenticated]);
  
  // Login function
  const login = async (provider: string) => {
    const redirectUri = `${window.location.origin}/auth/callback`;
    const authUrl = await generateAuthUrl.mutateAsync({
      provider,
      redirectUri,
    });
    
    window.location.href = authUrl;
  };
  
  // Logout function
  const logout = async () => {
    await convexMutation(api.auth.signOut, {});
    window.location.href = '/';
  };
  
  // Create organization function
  const createOrganization = async (name: string, domain?: string) => {
    return await createOrganizationMutation.mutateAsync({
      name,
      domain,
    });
  };
  
  const value = {
    isLoading,
    isAuthenticated,
    user: user || null,
    organization: organization || null,
    login,
    logout,
    createOrganization,
  };
  
  return (
    <WorkOSContext.Provider value={value}>
      {children}
    </WorkOSContext.Provider>
  );
}

// Hook for consuming the WorkOS context
export function useWorkOS() {
  const context = useContext(WorkOSContext);
  if (context === undefined) {
    throw new Error('useWorkOS must be used within a WorkOSProvider');
  }
  return context;
} 