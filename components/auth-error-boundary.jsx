"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error("Auth Error Boundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Check if it's an auth-related error
      const isAuthError = this.state.error?.message?.includes("auth") ||
                         this.state.error?.message?.includes("session") ||
                         this.state.error?.message?.includes("login") ||
                         this.state.error?.message?.includes("permission");

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full">
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {isAuthError ? "Authentication Error" : "Something went wrong"}
                    </h3>
                    <p className="text-sm">
                      {isAuthError
                        ? "There was a problem with the authentication system. This might be due to session issues or network problems."
                        : "An unexpected error occurred. Please try again."
                      }
                    </p>
                  </div>

                  {process.env.NODE_ENV === "development" && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium">
                        Error Details (Development)
                      </summary>
                      <pre className="mt-2 text-xs bg-red-100 dark:bg-red-800/30 p-2 rounded overflow-auto">
                        {this.state.error?.toString()}
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </details>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={this.handleRetry}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>

                    {isAuthError && (
                      <Button
                        onClick={this.handleReload}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        Reload Page
                      </Button>
                    )}
                  </div>

                  {isAuthError && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-2">
                      <p className="font-semibold">Troubleshooting tips:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Check your internet connection</li>
                        <li>Clear browser cache and cookies</li>
                        <li>Try logging in again</li>
                        <li>Disable browser extensions temporarily</li>
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;