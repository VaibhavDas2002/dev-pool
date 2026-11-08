import { describe, it, expect } from "vitest";
import { mockStore } from "@/lib/supabase/mock-store";
import { getTimeRemaining } from "@/lib/utils/date";

describe("Campus Reunion Poll — Edge Cases & Concurrency", () => {
  const pollId = "b0000000-0000-0000-0000-000000000001";

  it("Edge Case: Prevents voting when poll status is closed or draft", () => {
    // Temporarily set to closed
    mockStore.updatePollConfig(pollId, { status: "closed" });
    expect(() => {
      mockStore.castOrUpdateVote(pollId, "c0000000-0000-0000-0000-000000000002", "usr_new_test_voter");
    }).toThrow(/closed/i);

    // Restore to open
    mockStore.updatePollConfig(pollId, { status: "open" });
  });

  it("Edge Case: Prevents adding a date earlier than November 25, 2026", () => {
    expect(() => {
      mockStore.addPollOption(pollId, "2026-11-20");
    }).toThrow(/after November 24, 2026/i);

    expect(() => {
      mockStore.addPollOption(pollId, "2026-11-24");
    }).toThrow(/after November 24, 2026/i);
  });

  it("Edge Case: Prevents adding duplicate date options for same poll", () => {
    expect(() => {
      mockStore.addPollOption(pollId, "2026-11-27");
    }).toThrow(/already exists/i);
  });

  it("Edge Case: Admin removing an option audits and cleans up votes cleanly", () => {
    // Add temp option
    const tempOption = mockStore.addPollOption(pollId, "2026-12-08");
    expect(tempOption.option_date).toBe("2026-12-08");

    // Vote on it
    mockStore.castOrUpdateVote(pollId, tempOption.id, "usr_edge_case_voter");

    // Remove it
    const removal = mockStore.removePollOption(tempOption.id, "a0000000-0000-0000-0000-000000000001");
    expect(removal.success).toBe(true);
    expect(removal.affectedVotes).toBe(1);

    // Verify option is gone
    const options = mockStore.getPollOptions(pollId);
    expect(options.some((o) => o.id === tempOption.id)).toBe(false);
  });

  it("Edge Case: Countdown calculation accurately flags expired targets", () => {
    const pastTime = new Date(Date.now() - 10000).toISOString();
    const result = getTimeRemaining(pastTime);
    expect(result.isExpired).toBe(true);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);

    const futureTime = new Date(Date.now() + 86400000 * 2).toISOString();
    const futureResult = getTimeRemaining(futureTime);
    expect(futureResult.isExpired).toBe(false);
    expect(futureResult.days).toBeGreaterThanOrEqual(1);
  });
});

