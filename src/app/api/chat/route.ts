import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { chatMessageSchema } from "@/lib/validations";
import { dataService } from "@/lib/data-service";

export async function GET() {
  try {
    const messages = await dataService.getChatMessages();
    return NextResponse.json({ messages });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load chat" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to participate in the discussion." }, { status: 401 });
    }

    const body = await req.json();
    const validation = chatMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid message format" },
        { status: 400 }
      );
    }

    const message = await dataService.addChatMessage(user.id, validation.data.message);

    return NextResponse.json({ success: true, message });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send message" },
      { status: 500 }
    );
  }
}

