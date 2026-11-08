import { NextRequest, NextResponse } from "next/server";
import { joinSchema } from "@/lib/validations";
import { dataService } from "@/lib/data-service";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = joinSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { full_name, mobile_number } = validation.data;

    // Create or retrieve profile
    const profile = await dataService.findOrCreateProfile(full_name, mobile_number);

    // Set secure HTTP-only signed session cookie
    await setSessionCookie({
      id: profile.id,
      full_name: profile.full_name,
      mobile_number: profile.mobile_number,
      role: profile.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        full_name: profile.full_name,
        role: profile.role,
      },
    });
  } catch (err: unknown) {
    console.error("Auth login error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Authentication failed" },
      { status: 500 }
    );
  }
}

