import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWorkOSAuth } from "@/hooks/useWorkOSAuth";
import React from "react";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const { isLoading, isAuthenticated, error } = useWorkOSAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect to dashboard after successful authentication
      const timer = setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
      
      return () => clearTimeout(timer);
    } else if (!isLoading && !isAuthenticated && !error) {
      // Redirect to login if authentication failed without error
      const timer = setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      
      return () => clearTimeout(timer);
    } else if (!isLoading) {
      setIsProcessing(false);
    }
  }, [isLoading, isAuthenticated, error]);
  
  // Show error if there is one
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold text-red-600">
            Authentication Error
          </h1>
          <p className="text-center text-gray-700">{error}</p>
          <div className="mt-6 flex justify-center">
            <a
              href="/login"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          {isProcessing ? "Authenticating..." : "Authentication Successful"}
        </h1>
        {isProcessing ? (
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
          </div>
        ) : (
          <p className="text-center text-gray-700">
            You have been successfully authenticated. Redirecting...
          </p>
        )}
      </div>
    </div>
  );
} 