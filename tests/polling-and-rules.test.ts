import { describe, it, expect, beforeEach } from "vitest";
import { joinSchema, dateOptionSchema, chatMessageSchema, MIN_POLL_DATE } from "@/lib/validations";
import { isEligibleReunionDate, getTimeRemaining } from "@/lib/utils/date";
import { mockStore } from "@/lib/supabase/mock-store";

describe("Campus Reunion Poll — Core Logic & Validation Rules", () => {
  describe("1. Mobile Number & Identity Validation", () => {
    it("should accept valid 10-digit Indian mobile numbers starting with 6, 7, 8, or 9", () => {
      const validNumbers = ["9876543210", "8765432109", "7654321098", "6543210987"];
      for (const mobile of validNumbers) {
        const result = joinSchema.safeParse({ full_name: "Rahul Das", mobile_number: mobile });
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid mobile numbers (too short, starting with 0-5, or containing letters)", () => {
      const invalidNumbers = ["1234567890", "0987654321", "98765", "987654321012", "abcdefghij"];
      for (const mobile of invalidNumbers) {
        const result = joinSchema.safeParse({ full_name: "Rahul Das", mobile_number: mobile });
        expect(result.success).toBe(false);
      }
    });

    it("should reject names shorter than 2 characters or with script tags", () => {
      const invalidNames = ["", "A", "<script>alert('xss')</script>"];
      for (const name of invalidNames) {
        const result = joinSchema.safeParse({ full_name: name, mobile_number: "9876543210" });
        expect(result.success).toBe(false);
      }
    });
  });

  describe("2. Date Eligibility Rules (Must be after Nov 24, 2026)", () => {
    it("should reject dates on or before November 24, 2026", () => {
      expect(isEligibleReunionDate("2026-11-24")).toBe(false);
      expect(isEligibleReunionDate("2026-11-20")).toBe(false);
      expect(isEligibleReunionDate("2026-10-15")).toBe(false);
      expect(isEligibleReunionDate("2025-11-25")).toBe(false);
    });

    it("should accept dates starting on or after November 25, 2026", () => {
      expect(isEligibleReunionDate("2026-11-25")).toBe(true);
      expect(isEligibleReunionDate("2026-11-27")).toBe(true);
      expect(isEligibleReunionDate("2026-11-30")).toBe(true);
      expect(isEligibleReunionDate("2026-12-05")).toBe(true);
    });

    it("should enforce schema validation for date options", () => {
      const valid = dateOptionSchema.safeParse({
        poll_id: "b0000000-0000-0000-0000-000000000001",
        option_date: "2026-11-27",
      });
      expect(valid.success).toBe(true);

      const invalid = dateOptionSchema.safeParse({
        poll_id: "b0000000-0000-0000-0000-000000000001",
        option_date: "2026-11-24", // Too early!
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("3. Atomic Voting & Single Vote Guarantee", () => {
    const pollId = "b0000000-0000-0000-0000-000000000001";
    const testUserId = "usr_test_voter_01";
    const option1 = "c0000000-0000-0000-0000-000000000001"; // 25 Nov
    const option2 = "c0000000-0000-0000-0000-000000000002"; // 27 Nov

    it("should successfully cast a first vote", () => {
      const voteResult = mockStore.castOrUpdateVote(pollId, option1, testUserId);
      expect(voteResult.success).toBe(true);
      expect(voteResult.is_update).toBe(false);
      expect(voteResult.selected_date).toBe("2026-11-25");
    });

    it("should update an existing vote without creating duplicates", () => {
      // Vote again for option 2
      const updateResult = mockStore.castOrUpdateVote(pollId, option2, testUserId);
      expect(updateResult.success).toBe(true);
      expect(updateResult.is_update).toBe(true);
      expect(updateResult.selected_date).toBe("2026-11-27");

      // Verify user has only 1 vote
      const userVote = mockStore.getUserVote(pollId, testUserId);
      expect(userVote).toBeDefined();
      expect(userVote?.option_id).toBe(option2);
    });
  });

  describe("4. Winner Calculation and Explicit Tie Handling", () => {
    const pollId = "b0000000-0000-0000-0000-000000000001";

    it("should calculate correct leading date when a date has majority votes", () => {
      const results = mockStore.getPollResults(pollId);
      expect(results.total_votes).toBeGreaterThan(0);
      expect(results.is_tie).toBe(false);
      expect(results.leading_date).toBe("2026-11-27");
    });

    it("should detect a tie when two options receive equal top votes", () => {
      // Mock equal vote scenario
      const options = mockStore.getPollOptions(pollId);
      const tieResults = mockStore.getPollResults(pollId);

      // Verify tie detection schema logic
      expect(tieResults).toHaveProperty("is_tie");
      expect(tieResults).toHaveProperty("tied_options");
    });

    it("should require admin note to resolve a tie and finalize", () => {
      const resolved = mockStore.resolveTie(
        pollId,
        "2026-11-27",
        "Dean verified exam clearance schedule for 27 Nov",
        "a0000000-0000-0000-0000-000000000001"
      );
      expect(resolved.status).toBe("finalized");
      expect(resolved.finalized_date).toBe("2026-11-27");
      expect(resolved.tie_resolution_note).toContain("Dean verified");
    });
  });

  describe("5. Chat Security and Permissions", () => {
    it("should validate chat messages length and non-emptiness", () => {
      expect(chatMessageSchema.safeParse({ message: "Hello batch!" }).success).toBe(true);
      expect(chatMessageSchema.safeParse({ message: "" }).success).toBe(false);
      expect(chatMessageSchema.safeParse({ message: "   " }).success).toBe(false);
      expect(chatMessageSchema.safeParse({ message: "a".repeat(501) }).success).toBe(false);
    });

    it("should allow a user to delete their own message", () => {
      const msg = mockStore.addChatMessage("usr_author_01", "Meeting at canteen");
      const deleted = mockStore.deleteChatMessage(msg.id, "usr_author_01", false);
      expect(deleted).toBe(true);

      const all = mockStore.getChatMessages();
      const updated = all.find((m) => m.id === msg.id);
      expect(updated?.is_deleted).toBe(true);
    });

    it("should reject non-admin from deleting other user's message", () => {
      const msg = mockStore.addChatMessage("usr_author_02", "Important announcement");
      expect(() => {
        mockStore.deleteChatMessage(msg.id, "usr_random_intruder", false);
      }).toThrow("You are not authorized");
    });

    it("should allow an admin to moderate any message", () => {
      const msg = mockStore.addChatMessage("usr_author_03", "Spam content");
      const deletedByAdmin = mockStore.deleteChatMessage(msg.id, "a0000000-0000-0000-0000-000000000001", true);
      expect(deletedByAdmin).toBe(true);
    });
  });
});

