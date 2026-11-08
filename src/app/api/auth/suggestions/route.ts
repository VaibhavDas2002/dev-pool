import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/lib/data-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase().trim() || "";

    const allProfiles = await dataService.getSavedProfiles();

    if (!query) {
      return NextResponse.json({ profiles: allProfiles });
    }

    const filtered = allProfiles.filter(
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

