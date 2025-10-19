import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://localhost:3001/api/kyc/pending");
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Backend fetch error:", error);
    return NextResponse.json({ applications: [], total: 0, pending: 0, error: error.message }, { status: 500 });
  }
}
