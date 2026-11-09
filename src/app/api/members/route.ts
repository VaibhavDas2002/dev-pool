import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/lib/data-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("include_inactive") === "true";
    const allMembers = await dataService.getPublicMembers();
    const members = includeInactive ? allMembers : allMembers.filter((m) => m.is_active !== false);
    return NextResponse.json({ members });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load members" },
      { status: 500 }
    );
  }
}

