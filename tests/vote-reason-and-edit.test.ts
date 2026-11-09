import { describe, it, expect } from "vitest";
import { voteSchema } from "@/lib/validations";
import { mockStore } from "@/lib/supabase/mock-store";
import { PRESET_VOTE_REASONS } from "@/components/polling/VoteConfirmationModal";

describe("Vote Reason Configuration & Self-Vote Editing", () => {
  const pollId = "b0000000-0000-0000-0000-000000000001";
  const optionId1 = "c0000000-0000-0000-0000-000000000001"; // 25 Nov
  const optionId2 = "c0000000-0000-0000-0000-000000000002"; // 27 Nov

  it("should validate voteSchema with preset reasons and custom messages", () => {
    // Valid custom message
    const res1 = voteSchema.safeParse({
      poll_id: pollId,
      option_id: optionId1,
      reason: "Coming with Priya and Rohan; meeting at gate 2 around 11am.",
    });
    expect(res1.success).toBe(true);

    // Valid preset message
    const preset = PRESET_VOTE_REASONS[0];
    const res2 = voteSchema.safeParse({
      poll_id: pollId,
      option_id: optionId2,
      reason: preset.text,
    });
    expect(res2.success).toBe(true);

    // Valid without reason
    const res3 = voteSchema.safeParse({
      poll_id: pollId,
      option_id: optionId1,
    });
    expect(res3.success).toBe(true);

    // Reject message exceeding 300 characters
    const res4 = voteSchema.safeParse({
      poll_id: pollId,
      option_id: optionId1,
      reason: "a".repeat(301),
    });
    expect(res4.success).toBe(false);
  });

  it("should record a new vote with reason in mockStore", () => {
    // Create new test user
    const user = mockStore.createOrGetProfile("Ritu Sen", "9876543299");
    const reasonText = "Free after semester clearance & final exams.";

    const voteRes = mockStore.castOrUpdateVote(pollId, optionId1, user.id, reasonText);
    expect(voteRes.success).toBe(true);
    expect(voteRes.is_update).toBe(false);
    expect(voteRes.reason).toBe(reasonText);

    // Verify stored user vote
    const userVote = mockStore.getUserVote(pollId, user.id);
    expect(userVote).toBeDefined();
    expect(userVote?.option_id).toBe(optionId1);
    expect(userVote?.reason).toBe(reasonText);
  });

  it("should allow a user to edit and update their vote date and reason", () => {
    const user = mockStore.createOrGetProfile("Ritu Sen", "9876543299");

    // Initial vote was on optionId1 (25 Nov)
    const initialVote = mockStore.getUserVote(pollId, user.id);
    expect(initialVote?.option_id).toBe(optionId1);

    // Edit vote: change date to optionId2 (27 Nov) and update reason
    const updatedReason = "Changed plans - joining group lunch at Maggi point!";
    const updateRes = mockStore.castOrUpdateVote(pollId, optionId2, user.id, updatedReason);
    expect(updateRes.success).toBe(true);
    expect(updateRes.is_update).toBe(true);
    expect(updateRes.reason).toBe(updatedReason);

    // Verify updated vote in store
    const updatedVote = mockStore.getUserVote(pollId, user.id);
    expect(updatedVote?.option_id).toBe(optionId2);
    expect(updatedVote?.reason).toBe(updatedReason);
  });

  it("should make other batchmates votes and reasons visible in poll results", () => {
    const results = mockStore.getPollResults(pollId);
    expect(results).toBeDefined();

    // Option 2 (27 Nov) has multiple votes
    const opt2 = results.options.find((o) => o.option_id === optionId2);
    expect(opt2).toBeDefined();
    expect(opt2!.voters && opt2!.voters.length > 0).toBe(true);

    // Check that voters have reasons populated
    const votersWithReason = opt2!.voters!.filter((v) => !!v.reason);
    expect(votersWithReason.length).toBeGreaterThan(0);
    expect(typeof votersWithReason[0].reason).toBe("string");
  });
});
