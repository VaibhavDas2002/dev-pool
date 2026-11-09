import { describe, it, expect } from "vitest";
import { mockStore } from "@/lib/supabase/mock-store";
import { getInitials } from "@/lib/utils";

describe("Admin Member Management & Voter Initials", () => {
  const defaultPollId = "b0000000-0000-0000-0000-000000000001";

  it("should allow an admin to toggle a member status from active to inactive and back", () => {
    const admin = mockStore.findProfileByMobile("6297977842");
    expect(admin).toBeDefined();
    expect(admin?.role).toBe("admin");

    const member = mockStore.findProfileByMobile("9876543211"); // Priya
    expect(member).toBeDefined();
    expect(member?.is_active).not.toBe(false);

    // Deactivate member
    const deactivated = mockStore.toggleMemberStatus(member!.id, admin!.id, false);
    expect(deactivated.is_active).toBe(false);

    // Check in public members list
    const publicMembers = mockStore.getPublicMembers();
    const priyaPublic = publicMembers.find((p) => p.id === member!.id);
    expect(priyaPublic?.is_active).toBe(false);

    // Reactivate member
    const reactivated = mockStore.toggleMemberStatus(member!.id, admin!.id, true);
    expect(reactivated.is_active).toBe(true);
  });

  it("should prevent deactivating the primary admin (Vaibhav Das)", () => {
    const admin = mockStore.findProfileByMobile("6297977842");
    expect(admin).toBeDefined();

    expect(() => {
      mockStore.toggleMemberStatus(admin!.id, admin!.id, false);
    }).toThrow(/Primary Administrator account cannot be deactivated/i);
  });

  it("should prevent self-deactivation", () => {
    const priya = mockStore.findProfileByMobile("9876543211");
    expect(priya).toBeDefined();

    expect(() => {
      mockStore.toggleMemberStatus(priya!.id, priya!.id, false);
    }).toThrow(/You cannot deactivate your own admin account/i);
  });

  it("should block inactive members from casting votes", () => {
    const admin = mockStore.findProfileByMobile("6297977842");
    const member = mockStore.findProfileByMobile("9876543211");
    const poll = mockStore.getPoll(defaultPollId);
    const options = mockStore.getPollOptions(poll.id);

    expect(member).toBeDefined();
    expect(options.length).toBeGreaterThan(0);

    // Deactivate member
    mockStore.toggleMemberStatus(member!.id, admin!.id, false);

    // Try to vote while inactive
    expect(() => {
      mockStore.castOrUpdateVote(poll.id, options[0].id, member!.id);
    }).toThrow(/Your account has been deactivated/i);

    // Restore member
    mockStore.toggleMemberStatus(member!.id, admin!.id, true);
  });

  it("should include voter initials and full details in poll results", () => {
    const results = mockStore.getPollResults(defaultPollId);
    expect(results).toBeDefined();

    // Options should include voters array with initials
    for (const opt of results.options) {
      expect(Array.isArray(opt.voters)).toBe(true);
      if (opt.voters && opt.voters.length > 0) {
        for (const voter of opt.voters) {
          expect(voter.full_name).toBeDefined();
          expect(voter.initials).toBe(getInitials(voter.full_name));
          expect(voter.user_id).toBeDefined();
        }
      }
    }
  });
});
