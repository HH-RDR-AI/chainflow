// Next.js https://nextjs.org/docs/getting-started/installation
// in src/page.tsx
"use client";

import { FC, ReactElement } from "react";
import { ConnectButton as CustomRainbowConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./ConnectButton.module.scss";
import { FaSpinner, FaUser, FaUserInjured } from "react-icons/fa6";

export const ConnectButton: FC = () => {
  return (
    <CustomRainbowConnectButton.Custom>
      {({
        account,
        chain,
        openConnectModal,
        openChainModal,
        openAccountModal,
        authenticationStatus,
        mounted,
      }): ReactElement => {
        const loading = authenticationStatus === "loading";
        return (
          <button
            className={styles.container}
            disabled={loading}
            onClick={() => {
              if (loading) return;
              if (chain?.unsupported) {
                openChainModal();
                return;
              }
              if (account?.address) {
                openAccountModal();
                return;
              }
              openConnectModal();
            }}
          >
            <span className={styles.icon}>
              {loading ? (
                <FaSpinner />
              ) : chain?.unsupported ? (
                <FaUserInjured />
              ) : (
                <FaUser />
              )}
            </span>
            <div className={styles.caption}>
              <CustomRainbowConnectButton
                accountStatus="address"
                chainStatus="icon"
                showBalance={false}
              />
            </div>
          </button>
        );
      }}
    </CustomRainbowConnectButton.Custom>
  );
};
