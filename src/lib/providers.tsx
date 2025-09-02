// React Context Providers for TanStack Query and other global state
// This wraps the entire application with necessary providers

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

// Create a provider component to wrap the app
export function Providers({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance
  // We create it inside the component to ensure it's not shared between requests in SSR
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          // Default cache time: how long unused data stays in cache
          gcTime: 1000 * 60 * 60 * 24, // 24 hours
          // Default stale time: how long data is considered fresh
          staleTime: 1000 * 60 * 5, // 5 minutes
          // Retry failed requests
          retry: (failureCount, error) => {
            // Don't retry on 4xx errors (client errors)
            if (error instanceof Error && error.message.includes('HTTP 4')) {
              return false;
            }
            // Retry up to 3 times for other errors
            return failureCount < 3;
          },
          // Refetch on window focus (great for real-time updates)
          refetchOnWindowFocus: true,
          // Refetch on reconnect
          refetchOnReconnect: true,
        },
        mutations: {
          // Retry mutations once
          retry: 1,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Development tools for debugging queries */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
}

// Export the QueryClient type for use in other components if needed
export type { QueryClient };
