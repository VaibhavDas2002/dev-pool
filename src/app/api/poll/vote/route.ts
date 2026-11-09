import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { voteSchema } from "@/lib/validations";
import { dataService } from "@/lib/data-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please join or log in first." }, { status: 401 });
    }

    const userProfile = await dataService.getProfileById(user.id);
    if (userProfile && userProfile.is_active === false) {
      return NextResponse.json(
        { error: "Your account has been deactivated by the administrator." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = voteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid vote input" },
        { status: 400 }
      );
    }

    const { poll_id, option_id, option_date, reason } = validation.data;

    // Cast or update vote atomically with robust option and date resolution
    const result = await dataService.castOrUpdateVote(poll_id, option_id, user.id, reason, option_date);
    const resolvedPollId = (result && "poll_id" in result && result.poll_id) ? (result.poll_id as string) : poll_id;
    const updatedResults = await dataService.getPollResults(resolvedPollId);
    const updatedVote = await dataService.getUserVote(resolvedPollId, user.id);

    return NextResponse.json({
      success: true,
      result,
      vote: updatedVote,
      results: updatedResults,
    });
  } catch (err: unknown) {
    console.error("Voting error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record vote" },
      { status: 400 }
    );
  }
}

