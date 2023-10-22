"use client";

import React, { useEffect } from "react";
import {
  SismoConnectResponse,
  SismoConnectConfig,
  ClaimRequest,
  AuthRequest,
  SignatureRequest,
} from "@sismo-core/sismo-connect-client";
import { useSismoConnect } from "./hooks";

type ButtonProps = {
  claim?: ClaimRequest;
  claims?: ClaimRequest[];
  auth?: AuthRequest;
  auths?: AuthRequest[];
  signature?: SignatureRequest;
  onResponse?: (response: SismoConnectResponse) => void;
  onResponseBytes?: (responseBytes: string) => void;
  config: SismoConnectConfig;
  // [Deprecated]
  callbackPath?: string;
  callbackUrl?: string;
  namespace?: string;
  // [Deprecated]
  verifying?: boolean;
  loading?: boolean;
  text?: string;
  overrideStyle?: React.CSSProperties;
  disabled?: boolean;
  theme?: "light" | "dark" | "black";
};

import styles from "./ConnectButton.module.scss";
import { FaSpinner, FaUser, FaUserInjured } from "react-icons/fa6";

export const SismoConnectButton = ({
  claims,
  claim,
  auths,
  auth,
  signature,
  onResponse,
  onResponseBytes,
  config,
  // [Deprecated]
  callbackPath,
  callbackUrl,
  namespace,
  // [Deprecated]
  verifying,
  text,
  loading,
  disabled,
  theme = "dark",
}: ButtonProps) => {
  if (!claims && !auths && !signature && !claim && !auth) {
    throw new Error(
      "Please specify at least one claimRequest or authRequest or signatureRequest"
    );
  }

  if (claim && claims) {
    throw new Error("You can't use both claim and claims props");
  }
  if (auth && auths) {
    throw new Error("You can't use both auth and auths props");
  }

  const { sismoConnect, response, responseBytes } = useSismoConnect({
    config,
  });

  useEffect(() => {
    if (!response || !onResponse) return;
    onResponse(response);
  }, [response]);

  useEffect(() => {
    if (!responseBytes || !onResponseBytes) return;
    onResponseBytes(responseBytes);
  }, [responseBytes]);

  return (
    <button
      className={styles.container}
      disabled={disabled}
      onClick={() => {
        if (verifying || loading || disabled) return;
        sismoConnect.request({
          claims,
          auths,
          claim,
          auth,
          signature,
          callbackPath,
          callbackUrl,
          namespace,
        });
      }}
    >
      <span className={styles.icon}>
        {verifying || loading ? (
          <FaSpinner />
        ) : response?.proofs?.length ? (
          <FaUser />
        ) : (
          <FaUserInjured />
        )}
      </span>
      <div className={styles.caption}>{text || "Sign in with Sismo"}</div>
    </button>
  );
};
