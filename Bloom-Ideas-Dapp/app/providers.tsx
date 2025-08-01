'use client';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, cookieToInitialState } from 'wagmi';
import { ReactNode } from 'react';
import { config } from '@/lib/wagmi';
import { Toaster } from 'sonner';
import { GardenThemeProvider } from '@/components/garden-theme-context';

type Props = {
  children: ReactNode;
  cookie?: string | null;
};

export default function Providers({ children, cookie }: Props) {
  const initialState = cookieToInitialState(config, cookie);
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <GardenThemeProvider>
            <Toaster 
              position="top-left" 
              toastOptions={{
                classNames: {
                  toast: "bg-white/95 backdrop-blur-sm border-emerald-200 text-emerald-900 shadow-lg",
                  title: "text-emerald-900 font-semibold",
                  description: "text-emerald-700",
                  actionButton: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
                  cancelButton: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
                  closeButton: "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100",
                },
                duration: 4000,
              }}
              closeButton={true}
            />
            {children}
          </GardenThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 