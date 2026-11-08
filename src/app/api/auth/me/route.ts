import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { dataService } from "@/lib/data-service";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const profile = await dataService.getProfileById(session.id);
    return NextResponse.json({
      user: {
        id: session.id,
        full_name: profile?.full_name || session.full_name,
        role: profile?.role || session.role,
      },
    });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}

