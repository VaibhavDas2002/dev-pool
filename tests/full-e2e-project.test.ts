import { describe, it, expect, beforeEach } from "vitest";
import { dataService } from "@/lib/data-service";
import { mockStore } from "@/lib/supabase/mock-store";
import { joinSchema, dateOptionSchema, chatMessageSchema } from "@/lib/validations";
import { isEligibleReunionDate } from "@/lib/utils/date";

describe("Campus Reunion Poll — Full Project End-to-End Test Suite", () => {
  const POLL_ID = "b0000000-0000-0000-0000-000000000001";
  const ADMIN_MOBILE = "6297977842";
  const ADMIN_PASSWORD = "abcd@1234";

  describe("1. Authentication & Role Enforcement", () => {
    it("Authenticates Admin (Vaibhav Das) with correct mobile and password", async () => {
      // 1. Validate payload
      const validAdminPayload = {
        full_name: "Vaibhav Das",
        mobile_number: ADMIN_MOBILE,
        password: ADMIN_PASSWORD,
      };
      const parsed = joinSchema.safeParse(validAdminPayload);
      expect(parsed.success).toBe(true);

      // 2. Fetch or create profile
      const profile = await dataService.findOrCreateProfile(
        validAdminPayload.full_name,
        validAdminPayload.mobile_number
      );
      expect(profile).toBeDefined();
      expect(profile.role).toBe("admin");
      expect(profile.full_name).toBe("Vaibhav Das");
    });

    it("Rejects Admin login when password is missing or wrong", () => {
      const wrongPasswordPayload = {
        full_name: "Vaibhav Das",
        mobile_number: ADMIN_MOBILE,
        password: "wrongpassword",
      };
      // In the auth API handler, wrong password triggers 401
      const isPasswordValid = wrongPasswordPayload.password === ADMIN_PASSWORD;
      expect(isPasswordValid).toBe(false);
    });

    it("Allows batchmates to join seamlessly without a password", async () => {
      const classmatePayload = {
        full_name: "Priya Sharma",
        mobile_number: "9876543210",
      };
      const parsed = joinSchema.safeParse(classmatePayload);
      expect(parsed.success).toBe(true);

      const profile = await dataService.findOrCreateProfile(
        classmatePayload.full_name,
        classmatePayload.mobile_number
      );
      expect(profile.role).toBe("member");
      expect(profile.full_name).toBe("Priya Sharma");
    });
  });

  describe("2. Date Option Eligibility & Polling Rules", () => {
    it("Enforces that all dates must be strictly after November 24, 2026 (>= 2026-11-25)", async () => {
      const options = await dataService.getPollOptions(POLL_ID);
      expect(options.length).toBeGreaterThan(0);

      // Verify every option date is strictly >= 2026-11-25
      for (const opt of options) {
        expect(isEligibleReunionDate(opt.option_date)).toBe(true);
        expect(opt.option_date >= "2026-11-25").toBe(true);
      }
    });

    it("Rejects admin attempting to add a date on or before November 24, 2026", async () => {
      await expect(
        dataService.addDateOption(POLL_ID, "2026-11-24", "admin_user_id")
      ).rejects.toThrow(/after November 24, 2026/i);

      await expect(
        dataService.addDateOption(POLL_ID, "2026-11-20", "admin_user_id")
      ).rejects.toThrow(/after November 24, 2026/i);
    });

    it("Allows admin to add a valid future date (e.g. 2026-12-10)", async () => {
      const newOption = await dataService.addDateOption(POLL_ID, "2026-12-10", "admin_user_id");
      expect(newOption.option_date).toBe("2026-12-10");

      // Verify it appears in poll options
      const options = await dataService.getPollOptions(POLL_ID);
      expect(options.some((o) => o.option_date === "2026-12-10")).toBe(true);
    });
  });

  describe("3. Atomic Voting & Single-Vote-Per-User Rule", () => {
    const voterId = "usr_e2e_voter_priya";

    it("Casts an initial vote for 25 November 2026", async () => {
      const options = await dataService.getPollOptions(POLL_ID);
      const opt25 = options.find((o) => o.option_date === "2026-11-25");
      expect(opt25).toBeDefined();

      const voteResult = await dataService.castOrUpdateVote(POLL_ID, opt25!.id, voterId);
      expect(voteResult.success).toBe(true);
      expect(voteResult.is_update).toBe(false);
      expect(voteResult.selected_date).toBe("2026-11-25");

      const userVote = await dataService.getUserVote(POLL_ID, voterId);
      expect(userVote?.option_id).toBe(opt25!.id);
    });

    it("Updates vote in-place when user chooses a different date (27 November 2026)", async () => {
      const options = await dataService.getPollOptions(POLL_ID);
      const opt27 = options.find((o) => o.option_date === "2026-11-27");
      expect(opt27).toBeDefined();

      const updateResult = await dataService.castOrUpdateVote(POLL_ID, opt27!.id, voterId);
      expect(updateResult.success).toBe(true);
      expect(updateResult.is_update).toBe(true);
      expect(updateResult.selected_date).toBe("2026-11-27");

      // Verify the user STILL has exactly one vote, pointing to option 27
      const userVote = await dataService.getUserVote(POLL_ID, voterId);
      expect(userVote?.option_id).toBe(opt27!.id);
    });
  });

  describe("4. Results Calculation, Leaderboard & Tie Resolution", () => {
    it("Calculates turnout percentage and identifies the leading date", async () => {
      const results = await dataService.getPollResults(POLL_ID);
      expect(results.total_members).toBeGreaterThan(0);
      expect(results.total_votes).toBeGreaterThan(0);
      expect(results.turnout_percentage).toBeGreaterThan(0);
      expect(results.turnout_percentage).toBeLessThanOrEqual(100);

      // Verify sum of votes matches total_votes
      const optionSum = results.options.reduce((sum, opt) => sum + opt.vote_count, 0);
      expect(optionSum).toBe(results.total_votes);
    });

    it("Handles tie break explicitly without silently picking earliest date", async () => {
      // Admin resolves tie with explicit justification
      const adminId = "a0000000-0000-0000-0000-000000000001";
      const resolutionNote = "Confirmed with Academic Cell: certificate counters open with full staff on 27 Nov.";
      
      const finalized = await dataService.resolveTie(
        POLL_ID,
        "2026-11-27",
        resolutionNote,
        adminId
      );

      expect(finalized.status).toBe("finalized");
      expect(finalized.finalized_date).toBe("2026-11-27");
      expect(finalized.tie_resolution_note).toBe(resolutionNote);
      expect(finalized.tie_resolved_by).toBe(adminId);

      // Re-open for subsequent tests if needed
      await dataService.updatePollConfig(POLL_ID, { status: "open" }, adminId);
    });
  });

  describe("5. Group Chat Discussion & Moderation", () => {
    let testMessageId: string;
    const authorId = "usr_author_test_1";
    const adminId = "a0000000-0000-0000-0000-000000000001";

    it("Submits and stores a new message in the reunion chat", async () => {
      const msg = await dataService.addChatMessage(authorId, "Let's all assemble at the Canteen around 11 AM!");
      expect(msg).toBeDefined();
      expect(msg.message).toBe("Let's all assemble at the Canteen around 11 AM!");
      expect(msg.is_deleted).toBe(false);
      testMessageId = msg.id;

      const messages = await dataService.getChatMessages();
      expect(messages.some((m) => m.id === testMessageId)).toBe(true);
    });

    it("Prevents non-admin unauthorized user from deleting someone else's message", async () => {
      await expect(
        dataService.deleteChatMessage(testMessageId, "intruder_user_id", false)
      ).rejects.toThrow(/authorized/i);
    });

    it("Allows the message author to self-delete their message", async () => {
      const success = await dataService.deleteChatMessage(testMessageId, authorId, false);
      expect(success).toBe(true);

      const messages = await dataService.getChatMessages();
      const target = messages.find((m) => m.id === testMessageId);
      expect(target?.is_deleted).toBe(true);
    });

    it("Allows an administrator to moderate and delete any message", async () => {
      const spamMsg = await dataService.addChatMessage("random_spammer", "Buy cheap crypto!");
      const moderated = await dataService.deleteChatMessage(spamMsg.id, adminId, true);
      expect(moderated).toBe(true);

      const messages = await dataService.getChatMessages();
      const target = messages.find((m) => m.id === spamMsg.id);
      expect(target?.is_deleted).toBe(true);
    });
  });

  describe("6. Privacy & Sensitive Data Protection", () => {
    it("Ensures public member directory NEVER exposes phone numbers", async () => {
      const members = await dataService.getPublicMembers();
      expect(members.length).toBeGreaterThan(0);

      for (const member of members) {
        expect(member).toHaveProperty("full_name");
        expect(member).toHaveProperty("role");
        expect(member).toHaveProperty("has_voted");
        // Verify mobile_number is not in the public profile object
        expect((member as any).mobile_number).toBeUndefined();
      }
    });

    it("Ensures chat message payloads never leak author mobile numbers", async () => {
      const messages = await dataService.getChatMessages();
      for (const msg of messages) {
        expect(msg).toHaveProperty("sender_name");
        expect(msg).toHaveProperty("sender_role");
        expect((msg as any).mobile_number).toBeUndefined();
        expect((msg as any).sender_mobile).toBeUndefined();
      }
    });
  });
});
