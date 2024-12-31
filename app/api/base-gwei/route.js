import { NextResponse } from "next/server";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const BASE_RPC_URL = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

async function fetchGasPrice() {
  try {
    const response = await fetch(BASE_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_gasPrice",
        params: [],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch gas price");
    }

    const data = await response.json();

    // Convert from wei to gwei (1 gwei = 10^9 wei)
    const gweiPrice = parseInt(data.result, 16) / 1e9;

    return {
      success: true,
      data: {
        gwei: Number(gweiPrice.toFixed(4)), // Round to 4 decimal places
      },
    };
  } catch (error) {
    console.error("Error fetching gas price:", error);
    return {
      success: false,
      error: "Failed to fetch gas price",
    };
  }
}

export async function GET() {
  const result = await fetchGasPrice();

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
