import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useWorkOSAuth } from "@/hooks/useWorkOSAuth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, isLoading, isAuthenticated, error } = useWorkOSAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
            You're already logged in!
          </h1>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleLogin = async (provider: "google" | "github" | "microsoft") => {
    setIsLoggingIn(true);
    try {
      await login(provider);
    } catch (error) {
      console.error("Login error:", error);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Sign in to your account
        </h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={() => handleLogin("google")}
            disabled={isLoading || isLoggingIn}
            className="w-full flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="mr-2 h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15.545 6.558a9.42 9.42 0 0 0 .139 1.626c2.434-.243 4.316-2.193 4.316-4.65 0-2.6-2.1-4.714-4.707-4.714-1.282 0-2.442.51-3.293 1.337A9.358 9.358 0 0 0 10 .069a9.358 9.358 0 0 0-2 .187C7.148.844 5.988.333 4.707.333 2.1.333 0 2.447 0 5.047c0 2.457 1.882 4.407 4.316 4.65a9.42 9.42 0 0 0 .139-1.626c0-1.573-.769-2.633-1.867-2.633-.763 0-1.377.363-1.662.969-.07.178-.133.363-.133.363l2.417 9.815s.65.215.947.215c.296 0 .947-.215.947-.215L7.954 6.71s-.062-.185-.133-.363c-.285-.606-.899-.969-1.662-.969-1.098 0-1.867 1.06-1.867 2.633 0 .562.047 1.102.139 1.626C2.43 9.9 0 7.667 0 5.047 0 2.26 2.238 0 5 0c1.164 0 2.233.41 3.069 1.096A9.974 9.974 0 0 1 10 .069a9.936 9.936 0 0 1 1.931 1.027C12.767.41 13.836 0 15 0c2.762 0 5 2.26 5 5.047 0 2.62-2.43 4.853-4.316 4.653.092-.524.139-1.064.139-1.626 0-1.573-.769-2.633-1.867-2.633-.763 0-1.377.363-1.662.969-.07.178-.133.363-.133.363l2.417 9.815s.65.215.947.215c.296 0 .947-.215.947-.215L15.545 6.558Z" />
            </svg>
            Sign in with Google
          </button>
          
          <button
            onClick={() => handleLogin("github")}
            disabled={isLoading || isLoggingIn}
            className="w-full flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="mr-2 h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            Sign in with GitHub
          </button>

          <button
            onClick={() => handleLogin("microsoft")}
            disabled={isLoading || isLoggingIn}
            className="w-full flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="mr-2 h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.55 21H3v-8.55h8.55V21zM21 21h-8.55v-8.55H21V21zm-9.45-9.45H3V3h8.55v8.55zm9.45 0h-8.55V3H21v8.55z" />
            </svg>
            Sign in with Microsoft
          </button>
        </div>
        
        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 