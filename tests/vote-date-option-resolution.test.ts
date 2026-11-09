import { describe, it, expect, beforeEach } from "vitest";
import { mockStore } from "@/lib/supabase/mock-store";
import { dataService } from "@/lib/data-service";
import { DEFAULT_POLL_ID } from "@/lib/constants";

describe("Vote Date Option Lookup & Resilient Resolution", () => {
  const memberId = "a0000000-0000-0000-0000-000000000002"; // Priya Sharma
  const adminId = "a0000000-0000-0000-0000-000000000001"; // Vaibhav Das

  it("casts vote successfully with valid poll_id and option_id", async () => {
    const poll = mockStore.getPoll(DEFAULT_POLL_ID);
    const options = mockStore.getPollOptions(poll.id);
    const targetOption = options[0];

    const result = await dataService.castOrUpdateVote(
      poll.id,
      targetOption.id,
      memberId,
      "Free after exams and ready to celebrate",
      targetOption.option_date
    );

    expect(result.success).toBe(true);
    expect(result.selected_date).toBe(targetOption.option_date);
    expect(result.reason).toBe("Free after exams and ready to celebrate");
  });

  it("resolves option by option_date when option_id is outdated or mismatched", async () => {
    const poll = mockStore.getPoll(DEFAULT_POLL_ID);
    const bogusOptionId = "c0000000-0000-0000-0000-999999999999";
    const selectedDate = "2026-11-27";

    const result = await dataService.castOrUpdateVote(
      poll.id,
      bogusOptionId,
      memberId,
      "Resolved by date",
      selectedDate
    );

    expect(result.success).toBe(true);
    expect(result.selected_date).toBe("2026-11-27");
  });

  it("resolves option when option_id belongs to another poll reference", async () => {
    const poll = mockStore.getPoll(DEFAULT_POLL_ID);
    const options = mockStore.getPollOptions(poll.id);
    const targetOption = options[1];

    // Pass a different pollId (e.g. dynamic UUID), but real optionId
    const fakePollId = "b9999999-0000-0000-0000-000000000099";

    const result = await dataService.castOrUpdateVote(
      fakePollId,
      targetOption.id,
      memberId,
      "Test optionId crossover",
      targetOption.option_date
    );

    expect(result.success).toBe(true);
    expect(result.selected_date).toBe(targetOption.option_date);
  });

  it("auto-creates option when user votes for a valid reunion date >= 2026-11-25 not in initial options", async () => {
    const poll = mockStore.getPoll(DEFAULT_POLL_ID);
    const newValidDate = "2026-12-05"; // Saturday / valid date >= 2026-11-25

    const result = await dataService.castOrUpdateVote(
      poll.id,
      "c_unregistered_id",
      adminId,
      "Added new date on the fly",
      newValidDate
    );

    expect(result.success).toBe(true);
    expect(result.selected_date).toBe(newValidDate);

    // Verify option is now in poll options
    const updatedOptions = mockStore.getPollOptions(poll.id);
    expect(updatedOptions.some((o) => o.option_date === newValidDate)).toBe(true);
  });

  it("rejects invalid dates before November 25, 2026", async () => {
    const poll = mockStore.getPoll(DEFAULT_POLL_ID);
    const invalidDate = "2026-11-20";

    await expect(
      dataService.castOrUpdateVote(
        poll.id,
        "bogus_id",
        adminId,
        "Invalid early date",
        invalidDate
      )
    ).rejects.toThrow();
  });
});

