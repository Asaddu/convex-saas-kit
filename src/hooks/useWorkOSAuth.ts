import { useEffect, useState } from "react";
import { useConvexAuth } from "convex/react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

export type Provider = "google" | "github" | "microsoft";

export function useWorkOSAuth() {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  // Convex queries and mutations
  const user = useQuery(api.users.getUser, {});
  const signInWithWorkOS = useMutation(api.auth.signIn);
  const signOutMutation = useMutation(api.auth.signOut);
  
  useEffect(() => {
    // Check for OAuth callback
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const provider = url.searchParams.get("provider");
    
    if (code && provider && !isAuthenticated) {
      // Handle authentication callback
      const handleCallback = async () => {
        try {
          const redirectUri = `${window.location.origin}/auth/callback`;
          
          await signInWithWorkOS({
            providerId: "workos",
            payload: {
              code,
              provider,
              redirectUri,
            },
          });
          
          // Clear the URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate({ to: "/dashboard" });
        } catch (err) {
          console.error("Authentication error:", err);
          setError("Failed to authenticate. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      
      handleCallback();
    } else {
      setIsLoading(authLoading);
    }
  }, [authLoading, isAuthenticated, navigate, signInWithWorkOS]);
  
  // Login function
  const login = async (provider: Provider) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const authUrl = `https://api.workos.com/sso/authorize?client_id=${process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID}&provider=${provider}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
      
      window.location.href = authUrl;
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to initiate login. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await signOutMutation();
      navigate({ to: "/" });
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    isAuthenticated,
    user,
    login,
    logout,
    error,
  };
} 