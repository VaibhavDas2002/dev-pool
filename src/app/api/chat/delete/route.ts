import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { dataService } from "@/lib/data-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message_id } = await req.json();
    if (!message_id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const isAdmin = user.role === "admin";
    const success = await dataService.deleteChatMessage(message_id, user.id, isAdmin);

    if (!success) {
      return NextResponse.json({ error: "Could not delete message" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete message" },
      { status: 403 }
    );
  }
}

