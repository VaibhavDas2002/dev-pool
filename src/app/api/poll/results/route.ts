import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/lib/data-service";
import { getSessionUser } from "@/lib/session";
import { DEFAULT_POLL_ID } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pollId = searchParams.get("poll_id") || DEFAULT_POLL_ID;

    const [poll, results, options, user] = await Promise.all([
      dataService.getPoll(pollId),
      dataService.getPollResults(pollId),
      dataService.getPollOptions(pollId),
      getSessionUser(),
    ]);

    let userVote = null;
    if (user) {
      userVote = await dataService.getUserVote(pollId, user.id);
    }

    return NextResponse.json({
      poll,
      results,
      options,
      userVote,
    });
  } catch (err: unknown) {
    console.error("Results fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load poll results" },
      { status: 500 }
    );
  }
}
