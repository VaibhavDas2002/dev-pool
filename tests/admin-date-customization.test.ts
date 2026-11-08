import { describe, it, expect, beforeEach } from "vitest";
import { dateOptionSchema, updateDateOptionSchema, batchSyncDateOptionsSchema, MIN_POLL_DATE } from "@/lib/validations";
import { mockStore } from "@/lib/supabase/mock-store";
import { dataService } from "@/lib/data-service";

describe("Admin Date Customization & Interactive Selection Tests", () => {
  const pollId = "b0000000-0000-0000-0000-000000000001";
  const adminId = "a0000000-0000-0000-0000-000000000001";

  it("should validate and accept custom labels, admin notes, and recommended flags", () => {
    const input = {
      poll_id: pollId,
      option_date: "2026-11-28",
      label: "⭐ Recommended (Saturday Special)",
      note: "Academic cell counter verified with HOD clearance",
      is_recommended: true,
    };

    const parsed = dateOptionSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.label).toBe("⭐ Recommended (Saturday Special)");
      expect(parsed.data.note).toBe("Academic cell counter verified with HOD clearance");
      expect(parsed.data.is_recommended).toBe(true);
    }
  });

  it("should reject date customization for dates on or before Nov 24, 2026", () => {
    const input = {
      poll_id: pollId,
      option_date: "2026-11-24",
      label: "Opening Early",
    };

    const parsed = dateOptionSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("should add a customized date option in dataService/mockStore with label and note", async () => {
    const option = await dataService.addDateOption(
      pollId,
      "2026-12-08",
      {
        label: "Dean's Clearance",
        note: "Dean guaranteed fast counter processing for batch of 2026",
        is_recommended: true,
      },
      adminId
    );

    expect(option.option_date).toBe("2026-12-08");
    expect(option.label).toBe("Dean's Clearance");
    expect(option.note).toBe("Dean guaranteed fast counter processing for batch of 2026");
    expect(option.is_recommended).toBe(true);
  });

  it("should update an existing option's label, note, and recommended status", async () => {
    const options = await dataService.getPollOptions(pollId);
    const target = options[0];

    const updated = await dataService.updateDateOption(
      target.id,
      {
        label: "Super Opening Day",
        note: "All 4 counters open simultaneously",
        is_recommended: true,
      },
      adminId
    );

    expect(updated.label).toBe("Super Opening Day");
    expect(updated.note).toBe("All 4 counters open simultaneously");
    expect(updated.is_recommended).toBe(true);
  });

  it("should batch sync dates via batchSyncDateOptions", async () => {
    const targetDates = ["2026-11-25", "2026-11-27", "2026-12-04", "2026-12-11"];
    const synced = await dataService.batchSyncDateOptions(pollId, targetDates, adminId);

    const syncedDates = synced.map((o) => o.option_date);
    expect(syncedDates).toContain("2026-11-25");
    expect(syncedDates).toContain("2026-11-27");
    expect(syncedDates).toContain("2026-12-04");
    expect(syncedDates).toContain("2026-12-11");
  });

  it("should reject batch sync dates containing any date prior to Nov 25, 2026", async () => {
    const invalidBatch = ["2026-11-24", "2026-11-27"];
    await expect(
      dataService.batchSyncDateOptions(pollId, invalidBatch, adminId)
    ).rejects.toThrow("All dates must be after November 24, 2026");
  });

  it("should reflect custom labels and notes in poll results", async () => {
    const results = await dataService.getPollResults(pollId);
    expect(results.options.length).toBeGreaterThan(0);
    const hasLabelOrNote = results.options.some((o) => o.label || o.note || o.is_recommended);
    expect(hasLabelOrNote).toBe(true);
  });

  it("should retrieve saved profiles for autocomplete suggestions with full name and mobile number", async () => {
    const profiles = await dataService.getSavedProfiles();
    expect(profiles.length).toBeGreaterThan(0);

    const vaibhav = profiles.find((p) => p.mobile_number === "6297977842");
    expect(vaibhav).toBeDefined();
    expect(vaibhav?.full_name).toBe("Vaibhav Das");
    expect(vaibhav?.role).toBe("admin");

    const priya = profiles.find((p) => p.mobile_number === "9876543211");
    expect(priya).toBeDefined();
    expect(priya?.full_name).toBe("Priya Sharma");
  });
});

