import { NextResponse } from "next/server";
import { dataService } from "@/lib/data-service";

export async function GET() {
  try {
    const members = await dataService.getPublicMembers();
    return NextResponse.json({ members });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load members" },
      { status: 500 }
    );
  }
}

