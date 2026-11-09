import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/lib/data-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase().trim() || "";

    // Fetch all saved profiles and strictly filter only active members
    const allProfiles = await dataService.getSavedProfiles();
    const activeProfiles = allProfiles.filter((p) => (p as { is_active?: boolean }).is_active !== false);

    if (!query) {
      return NextResponse.json({ profiles: activeProfiles });
    }

    const filtered = activeProfiles.filter(
      (p) =>
        p.full_name.toLowerCase().includes(query) ||
        p.mobile_number.includes(query)
    );

    return NextResponse.json({ profiles: filtered });
  } catch (err: unknown) {
    console.error("Error retrieving profile suggestions:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to retrieve suggestions" },
      { status: 500 }
    );
  }
}

