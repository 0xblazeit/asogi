import { NextResponse } from "next/server";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const ALCHEMY_BASE_URL = "https://base-mainnet.g.alchemy.com/v2";

export async function GET() {
  try {
    const response = await fetch(`${ALCHEMY_BASE_URL}/${ALCHEMY_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: ["latest", false],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        number: parseInt(data.result.number, 16),
        timestamp: parseInt(data.result.timestamp, 16),
        hash: data.result.hash,
        parentHash: data.result.parentHash,
        nonce: data.result.nonce,
        gasUsed: parseInt(data.result.gasUsed, 16),
        gasLimit: parseInt(data.result.gasLimit, 16),
      },
    });
  } catch (error) {
    console.error("Error fetching Base block:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch block data" }, { status: 500 });
  }
}
