import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { dataService } from "@/lib/data-service";
import {
  dateOptionSchema,
  updateDateOptionSchema,
  batchSyncDateOptionsSchema,
  tieResolutionSchema,
  createPollSchema,
} from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Access denied: Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "CREATE_POLL") {
      const pollPayload = body.poll_data || body;
      const validation = createPollSchema.safeParse(pollPayload);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error.errors[0]?.message || "Invalid poll creation data" }, { status: 400 });
      }
      const newPoll = await dataService.createPoll(validation.data, user.id);
      return NextResponse.json({ success: true, poll: newPoll });
    }

    if (action === "ADD_OPTION") {
      const validation = dateOptionSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error.errors[0]?.message }, { status: 400 });
      }
      const newOption = await dataService.addDateOption(
        validation.data.poll_id,
        validation.data.option_date,
        {
          label: validation.data.label,
          note: validation.data.note,
          is_recommended: validation.data.is_recommended,
        },
        user.id
      );
      return NextResponse.json({ success: true, option: newOption });
    }

    if (action === "UPDATE_OPTION") {
      const validation = updateDateOptionSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error.errors[0]?.message }, { status: 400 });
      }
      const updated = await dataService.updateDateOption(
        validation.data.option_id,
        {
          option_date: validation.data.option_date,
          label: validation.data.label,
          note: validation.data.note,
          is_recommended: validation.data.is_recommended,
        },
        user.id
      );
      return NextResponse.json({ success: true, option: updated });
    }

    if (action === "BATCH_SYNC_OPTIONS") {
      const validation = batchSyncDateOptionsSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error.errors[0]?.message }, { status: 400 });
      }
      const options = await dataService.batchSyncDateOptions(
        validation.data.poll_id,
        validation.data.dates,
        user.id
      );
      return NextResponse.json({ success: true, options });
    }

    if (action === "REMOVE_OPTION") {
      const { option_id, poll_id } = body;
      if (!option_id) return NextResponse.json({ error: "Option ID is required" }, { status: 400 });
      const result = await dataService.removeDateOption(option_id, user.id);
      return NextResponse.json({ success: true, result });
    }

    if (action === "UPDATE_CONFIG") {
      const { poll_id, updates } = body;
      if (!poll_id || !updates) return NextResponse.json({ error: "Missing config data" }, { status: 400 });
      const updatedPoll = await dataService.updatePollConfig(poll_id, updates, user.id);
      return NextResponse.json({ success: true, poll: updatedPoll });
    }

    if (action === "RESOLVE_TIE") {
      const validation = tieResolutionSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error.errors[0]?.message }, { status: 400 });
      }
      const updatedPoll = await dataService.resolveTie(
        validation.data.poll_id,
        validation.data.selected_date,
        validation.data.resolution_note,
        user.id
      );
      return NextResponse.json({ success: true, poll: updatedPoll });
    }

    if (action === "FINALIZE") {
      const { poll_id, selected_date } = body;
      if (!poll_id) return NextResponse.json({ error: "Poll ID is required" }, { status: 400 });
      const finalizedPoll = await dataService.finalizePoll(poll_id, selected_date, user.id);
      return NextResponse.json({ success: true, poll: finalizedPoll });
    }

    return NextResponse.json({ error: "Unsupported admin action" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Admin action error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to perform admin operation" },
      { status: 500 }
    );
  }
}

