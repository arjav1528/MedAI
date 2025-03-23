import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId || userId !== session.user.id) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // In a real application, you would fetch notifications from a database
  // This is a mock implementation
  const notifications = [
    {
      id: "1",
      userId: session.user.id,
      message: "Your query has been reviewed by Dr. Smith",
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "2",
      userId: session.user.id,
      message: "New AI response available for your query",
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  return NextResponse.json(notifications);
}
