import { describe, it, expect } from "vitest";
import { mockStore } from "@/lib/supabase/mock-store";
import { dataService } from "@/lib/data-service";
import { DEFAULT_POLL_ID } from "@/lib/constants";
import { getTimeRemaining } from "@/lib/utils/date";

describe("Admin Vote Closing & Deadline Management", () => {
  const adminId = "a0000000-0000-0000-0000-000000000001"; // Vaibhav Das
  const memberId = "a0000000-0000-0000-0000-000000000002"; // Priya Sharma

  it("allows admin to set a custom voting deadline", async () => {
    const poll = mockStore.getPoll(DEFAULT_POLL_ID);
    const newDeadline = new Date(Date.now() + 48 * 3600000).toISOString();

    const updatedPoll = await dataService.updatePollConfig(
      poll.id,
      { voting_deadline: newDeadline },
      adminId
    );

    expect(updatedPoll.voting_deadline).toBe(newDeadline);

    // Verify time remaining reflects the new deadline
    const remaining = getTimeRemaining(newDeadline);
    expect(remaining.isExpired).toBe(false);
    expect(remaining.days).toBeGreaterThanOrEqual(1);
  });

  it("allows admin to close poll immediately and locks member voting while keeping admin voting permitted", async () => {
    const poll = mockStore.getPoll(DEFAULT_POLL_ID);
    const pastDeadline = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago

    // Admin sets deadline in the past and closes poll
    const closedPoll = await dataService.updatePollConfig(
      poll.id,
      { voting_deadline: pastDeadline, status: "closed" },
      adminId
    );

    expect(closedPoll.status).toBe("closed");
    const remaining = getTimeRemaining(pastDeadline);
    expect(remaining.isExpired).toBe(true);

    // Regular member should be prevented from voting
    const options = mockStore.getPollOptions(poll.id);
    await expect(
      dataService.castOrUpdateVote(poll.id, options[0].id, memberId, "Member tries to vote after close")
    ).rejects.toThrow();

    // Administrator is permitted to vote even when closed
    const adminVoteResult = await dataService.castOrUpdateVote(
      poll.id,
      options[0].id,
      adminId,
      "Admin vote after close"
    );
    expect(adminVoteResult.success).toBe(true);
  });

  it("allows admin to re-open poll and extend voting window", async () => {
    const poll = mockStore.getPoll(DEFAULT_POLL_ID);
    const futureDeadline = new Date(Date.now() + 7 * 86400000).toISOString();

    const reopenedPoll = await dataService.updatePollConfig(
      poll.id,
      { voting_deadline: futureDeadline, status: "open" },
      adminId
    );

    expect(reopenedPoll.status).toBe("open");
    expect(reopenedPoll.voting_deadline).toBe(futureDeadline);

    // Member can now vote again
    const options = mockStore.getPollOptions(poll.id);
    const memberVoteResult = await dataService.castOrUpdateVote(
      poll.id,
      options[1].id,
      memberId,
      "Member votes after poll is re-opened"
    );
    expect(memberVoteResult.success).toBe(true);
  });
});

