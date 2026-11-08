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

    const { full_name, mobile_number, password } = validation.data;

    // Admin password authentication check
    const isAdminMobile = mobile_number === "6297977842" || mobile_number === (process.env.INITIAL_ADMIN_MOBILE || "6297977842");
    if (isAdminMobile) {
      const requiredPassword = process.env.ADMIN_PASSWORD || "abcd@1234";
      if (!password || password !== requiredPassword) {
        return NextResponse.json(
          { error: "Incorrect administrator password for Vaibhav Das." },
          { status: 401 }
        );
      }
    }

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

