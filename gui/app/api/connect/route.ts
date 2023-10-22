// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// in src/app/api/verify/route.ts

import {
  AuthType,
  ClaimType,
  SismoConnect,
  SismoConnectVerifiedResult,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";

const sismoConnect = SismoConnect({
  config: {
    appId: "0x26c0bb84bb9f17935c0f727cf033d841",
  },
});

// this is the API route that is called by the SismoConnectButton
export async function POST(req: Request) {
  const sismoConnectResponse = await req.json();
  try {
    // verify the sismo connect response that corresponds to the request
    const result: SismoConnectVerifiedResult = await sismoConnect.verify(
      sismoConnectResponse,
      {
        auths: [
          { authType: AuthType.EVM_ACCOUNT },
          // { authType: AuthType.VAULT },
          // { authType: AuthType.GITHUB },
          // { authType: AuthType.TWITTER },
          // { authType: AuthType.TELEGRAM },
        ],
        claims: [
          // ENS DAO Voters
          // { groupId: "0x85c7ee90829de70d0d51f52336ea4722" },
          // Gitcoin passport with at least a score of 15
          // {
          //   groupId: "0x1cde61966decb8600dfd0749bd371f12",
          //   value: 15,
          //   claimType: ClaimType.GTE,
          // },
        ],
        // verify signature from users.
        signature: { message: "I vote Yes to Privacy" },
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(e.message, { status: 500 });
  }
}
