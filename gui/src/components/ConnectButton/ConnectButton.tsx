"use client";

import { FC, ReactElement } from "react";
import { ConnectButton as CustomRainbowConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./ConnectButton.module.scss";
import { FaRegUser, FaSpinner, FaUserInjured } from "react-icons/fa6";
import { getShortAddress } from "@/src/utils/common";
import { clsx } from "clsx";
import Avatar from "../Avatar";

export const ConnectButton: FC<{ className?: string }> = ({ className }) => {
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
            className={clsx(styles.container, className, {
              [styles.wrong]: chain?.unsupported,
            })}
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
              ) : !!account ? (
                <Avatar address={account.address} />
              ) : (
                <FaRegUser />
              )}
            </span>
            <div className={styles.caption}>
              {loading
                ? "Connecting..."
                : chain?.unsupported
                ? "Wrong chain"
                : !!account
                ? getShortAddress(account.address)
                : "Connect wallet"}
            </div>
          </button>
        );
      }}
    </CustomRainbowConnectButton.Custom>
  );
};
