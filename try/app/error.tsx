"use client";

import { useEffect } from "react";
import { IconButton } from "./components/ui/IconButton";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center h-100 p-5 text-center">
      <h2 className="mb-4">Something went wrong!</h2>
      <p className="text-muted mb-4">We encountered an unexpected error while loading this page.</p>
      <div className="d-flex gap-3">
        <IconButton 
          icon="refresh" 
          label="Try again" 
          className="btn btn-primary"
          onClick={() => reset()} 
        />
        <IconButton 
          icon="home" 
          label="Go home" 
          className="btn btn-outline-secondary"
          href="/" 
        />
      </div>
    </div>
  );
}
