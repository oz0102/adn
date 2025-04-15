import { NextResponse } from 'next/server';

export async function GET() {
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

export async function POST() {
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