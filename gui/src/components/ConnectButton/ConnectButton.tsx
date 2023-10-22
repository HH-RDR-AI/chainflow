// Next.js https://nextjs.org/docs/getting-started/installation
// in src/page.tsx
"use client";

import { FC } from "react";
import { SismoConnectButton } from "./SismoConnectButton";
import {
  AuthType,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-client";

export const ConnectButton: FC = () => {
  return (
    <SismoConnectButton
      config={{
        appId: "0x26c0bb84bb9f17935c0f727cf033d841", // replace with your appId
      }}
      // request proof of Data Sources ownership (e.g EVM, GitHub, twitter or telegram)
      auths={[
        { authType: AuthType.EVM_ACCOUNT },
        // { authType: AuthType.GITHUB, isOptional: true },
        // { authType: AuthType.TWITTER, isOptional: true },
        // { authType: AuthType.TELEGRAM, isOptional: true },
        // {
        //   authType: AuthType.VAULT,
        //   isOptional: true,
        //   isSelectableByUser: true,
        // },
      ]}
      // request zk proof that Data Source are part of a group
      // (e.g NFT ownership, Dao Participation, GitHub commits)
      claims={
        [
          // ENS DAO Voters
          // { groupId: "0x85c7ee90829de70d0d51f52336ea4722" },
          // Gitcoin passport with at least a score of 15
          // {
          //   groupId: "0x1cde61966decb8600dfd0749bd371f12",
          //   value: 15,
          //   claimType: ClaimType.GTE,
          // },
        ]
      }
      // request message signature from users.
      signature={{ message: "I vote Yes to Privacy" }}
      // retrieve the Sismo Connect Reponse from the user's Sismo data vault
      onResponse={async (response: SismoConnectResponse) => {
        const res = await fetch("/api/connect", {
          method: "POST",
          body: JSON.stringify(response),
        });
        console.log(await res.json());
      }}
      // reponse in bytes to call a contract
      // onResponseBytes={async (response: string) => {
      //   console.log(response);
      // }}
    />
  );
};
