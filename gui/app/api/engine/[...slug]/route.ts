import { NextRequest, NextResponse } from "next/server";

const handler = async (req: Request, { params }: any) => {
  const { searchParams } = new URL(req.url);
  const requestUrl = params?.slug?.join("/") || "";
  const requestBody =
    req.method === "POST" && req.body ? await req.text() : undefined;

  const query = Object.entries(Object.fromEntries(searchParams))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const url = `https://chainflow-engine.dexguru.biz/engine-rest/${requestUrl}${
    query ? `?${query}` : ""
  }`;

  try {
    const result = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("demo" + ":" + "demo"),
      },
      method: req.method === "POST" ? "POST" : "GET",
      body: requestBody,
    });

    if (!result.ok) {
      return NextResponse.json(
        { url: requestUrl, message: result.statusText, status: result.status },
        {
          status: result.status,
        }
      );
    }

    return NextResponse.json(await result.json(), { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { message: e.message, status: 500 },
      { status: 500 }
    );
  }
};

export const GET = handler;
export const POST = handler;
