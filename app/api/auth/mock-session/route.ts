import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    user: {
      id: "demo-user-id",
      email: "demo@example.com",
      role: "Admin",
      permissions: ["*"]
    }
  });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({
    success: true,
    user: {
      id: "demo-user-id",
      email: "demo@example.com",
      role: "Admin",
      permissions: ["*"]
    }
  });
}