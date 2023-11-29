'use client';

import * as React from 'react';
import {
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { useWagmiConfig } from '@/src/hooks/useWagmiConfig';
import '@rainbow-me/rainbowkit/styles.css';


export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    const { wagmiConfig, chains } = useWagmiConfig()


    return (
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains}>
                {mounted && children}
            </RainbowKitProvider>
        </WagmiConfig>
    );
}