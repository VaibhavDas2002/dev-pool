import { 
  Profile, 
  Poll, 
  PollOption, 
  Vote, 
  PollResults, 
  ChatMessage, 
  Announcement, 
  PublicProfile,
  PollAuditLog 
} from "@/types";

// In-memory persistent state during server runtime
class CampusReunionStore {
  private profiles: Profile[] = [
    {
      id: "a0000000-0000-0000-0000-000000000001",
      full_name: "Rahul Das (Class Rep)",
      mobile_number: "9876543210",
      role: "admin",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000002",
      full_name: "Priya Sharma",
      mobile_number: "9876543211",
      role: "member",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000003",
      full_name: "Rohan Gupta",
      mobile_number: "9876543212",
      role: "member",
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000004",
      full_name: "Sneha Patel",
      mobile_number: "9876543213",
      role: "member",
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000005",
      full_name: "Amit Verma",
      mobile_number: "9876543214",
      role: "member",
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000006",
      full_name: "Pooja Nair",
      mobile_number: "9876543215",
      role: "member",
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000007",
      full_name: "Vikram Singh",
      mobile_number: "9876543216",
      role: "member",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000008",
      full_name: "Ananya Sen",
      mobile_number: "9876543217",
      role: "member",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000009",
      full_name: "Karthik Raja",
      mobile_number: "9876543218",
      role: "member",
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000010",
      full_name: "Neha Deshmukh",
      mobile_number: "9876543219",
      role: "member",
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000011",
      full_name: "Aditya Joshi",
      mobile_number: "9811122233",
      role: "member",
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000012",
      full_name: "Meera Krishnan",
      mobile_number: "9822233344",
      role: "member",
      created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000013",
      full_name: "Siddharth Roy",
      mobile_number: "9833344455",
      role: "member",
      created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000014",
      full_name: "Tanvi Kulkarni",
      mobile_number: "9844455566",
      role: "member",
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: "a0000000-0000-0000-0000-000000000015",
      full_name: "Arjun Nambiar",
      mobile_number: "9855566677",
      role: "member",
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
  ];

  private polls: Poll[] = [
    {
      id: "b0000000-0000-0000-0000-000000000001",
      title: "When Should We Visit College?",
      subtitle: "Let's choose the perfect day to collect our B.Tech certificates together!",
      description: "The administration office requires all B.Tech degree holders to be present with signed clearance forms. Let's go as one batch, take graduation photos on the library stairs, and celebrate together!",
      min_date: "2026-11-25",
      max_date: "2026-12-10",
      voting_deadline: "2026-11-23T23:59:59+05:30",
      status: "open",
      created_by: "a0000000-0000-0000-0000-000000000001",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];

  private pollOptions: PollOption[] = [
    {
      id: "c0000000-0000-0000-0000-000000000001",
      poll_id: "b0000000-0000-0000-0000-000000000001",
      option_date: "2026-11-25",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "c0000000-0000-0000-0000-000000000002",
      poll_id: "b0000000-0000-0000-0000-000000000001",
      option_date: "2026-11-27",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "c0000000-0000-0000-0000-000000000003",
      poll_id: "b0000000-0000-0000-0000-000000000001",
      option_date: "2026-11-30",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "c0000000-0000-0000-0000-000000000004",
      poll_id: "b0000000-0000-0000-0000-000000000001",
      option_date: "2026-12-02",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];

  private votes: Vote[] = [
    // 27 Nov (Option 2): 6 seed votes
    { id: "v1", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000002", user_id: "a0000000-0000-0000-0000-000000000001", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v2", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000002", user_id: "a0000000-0000-0000-0000-000000000002", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v3", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000002", user_id: "a0000000-0000-0000-0000-000000000003", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v4", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000002", user_id: "a0000000-0000-0000-0000-000000000004", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v5", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000002", user_id: "a0000000-0000-0000-0000-000000000005", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v6", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000002", user_id: "a0000000-0000-0000-0000-000000000006", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    // 30 Nov (Option 3): 3 votes
    { id: "v7", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000003", user_id: "a0000000-0000-0000-0000-000000000007", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v8", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000003", user_id: "a0000000-0000-0000-0000-000000000008", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v9", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000003", user_id: "a0000000-0000-0000-0000-000000000009", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    // 25 Nov (Option 1): 2 votes
    { id: "v10", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000001", user_id: "a0000000-0000-0000-0000-000000000010", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v11", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000001", user_id: "a0000000-0000-0000-0000-000000000011", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    // 02 Dec (Option 4): 1 vote
    { id: "v12", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000004", user_id: "a0000000-0000-0000-0000-000000000012", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];

  private chatMessages: ChatMessage[] = [
    {
      id: "d0000000-0000-0000-0000-000000000001",
      user_id: "a0000000-0000-0000-0000-000000000001",
      sender_name: "Rahul Das (Class Rep)",
      sender_role: "admin",
      message: "Hey everyone! Welcome to our official certificate collection planner! Please vote your date by Nov 23 so we can notify the registrar! 🎓",
      is_deleted: false,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: "d0000000-0000-0000-0000-000000000002",
      user_id: "a0000000-0000-0000-0000-000000000002",
      sender_name: "Priya Sharma",
      sender_role: "member",
      message: "Finally! Super excited to see everyone. I voted for 27 Nov because Friday is perfect before the weekend!",
      is_deleted: false,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "d0000000-0000-0000-0000-000000000003",
      user_id: "a0000000-0000-0000-0000-000000000003",
      sender_name: "Rohan Gupta",
      sender_role: "member",
      message: "Count me in for 27th! Are we doing lunch at Maggi point near gate 2? 🍜",
      is_deleted: false,
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: "d0000000-0000-0000-0000-000000000004",
      user_id: "a0000000-0000-0000-0000-000000000004",
      sender_name: "Sneha Patel",
      sender_role: "member",
      message: "Definitely Maggi point! Also make sure to bring your college ID card or provisional certificate copy for smooth counter processing.",
      is_deleted: false,
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ];

  private announcements: Announcement[] = [
    {
      id: "e0000000-0000-0000-0000-000000000001",
      poll_id: "b0000000-0000-0000-0000-000000000001",
      title: "📢 College Visit Guidelines & Timelines",
      content: "Dear Batchmates: The Academic Section confirmed that B.Tech degrees will be handed over starting Nov 25. Please bring your library No-Dues receipt and student ID card. Vote for your preferred day before polling closes on Nov 23!",
      is_pinned: true,
      created_by: "a0000000-0000-0000-0000-000000000001",
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
  ];

  private auditLogs: PollAuditLog[] = [];

  // ==================== PROFILES ====================
  public findProfileByMobile(mobile: string): Profile | undefined {
    return this.profiles.find((p) => p.mobile_number === mobile);
  }

  public findProfileById(id: string): Profile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  public createOrGetProfile(fullName: string, mobile: string): Profile {
    const existing = this.findProfileByMobile(mobile);
    if (existing) {
      return existing;
    }
    const newProfile: Profile = {
      id: "usr_" + Math.random().toString(36).substring(2, 11),
      full_name: fullName,
      mobile_number: mobile,
      role: mobile === "9876543210" ? "admin" : "member",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.profiles.push(newProfile);
    return newProfile;
  }

  public getPublicMembers(): PublicProfile[] {
    const defaultPoll = this.polls[0];
    return this.profiles.map((p) => {
      const vote = this.votes.find((v) => v.user_id === p.id && v.poll_id === defaultPoll?.id);
      return {
        id: p.id,
        full_name: p.full_name,
        role: p.role,
        created_at: p.created_at,
        has_voted: !!vote,
        voted_option_id: vote ? vote.option_id : null,
      };
    });
  }

  // ==================== POLLS & OPTIONS ====================
  public getPoll(pollId: string): Poll | undefined {
    return this.polls.find((p) => p.id === pollId) || this.polls[0];
  }

  public getPollOptions(pollId: string): PollOption[] {
    return this.pollOptions
      .filter((po) => po.poll_id === pollId)
      .sort((a, b) => a.option_date.localeCompare(b.option_date));
  }

  public getUserVote(pollId: string, userId: string): Vote | undefined {
    return this.votes.find((v) => v.poll_id === pollId && v.user_id === userId);
  }

  // ==================== ATOMIC VOTING ====================
  public castOrUpdateVote(pollId: string, optionId: string, userId: string) {
    const poll = this.getPoll(pollId);
    if (!poll) {
      throw new Error("Poll not found");
    }

    if (poll.status !== "open") {
      throw new Error(`Voting is currently ${poll.status}`);
    }

    if (new Date(poll.voting_deadline).getTime() < Date.now()) {
      throw new Error("The voting deadline has expired");
    }

    const option = this.pollOptions.find((po) => po.id === optionId && po.poll_id === pollId);
    if (!option) {
      throw new Error("Invalid date option selected for this poll");
    }

    const existingIndex = this.votes.findIndex((v) => v.poll_id === pollId && v.user_id === userId);
    let voteId: string;
    let isUpdate = false;

    if (existingIndex >= 0) {
      isUpdate = true;
      this.votes[existingIndex].option_id = optionId;
      this.votes[existingIndex].updated_at = new Date().toISOString();
      voteId = this.votes[existingIndex].id;
    } else {
      voteId = "v_" + Math.random().toString(36).substring(2, 9);
      this.votes.push({
        id: voteId,
        poll_id: pollId,
        option_id: optionId,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      vote_id: voteId,
      is_update: isUpdate,
      selected_date: option.option_date,
    };
  }

  // ==================== POLL RESULTS ====================
  public getPollResults(pollId: string): PollResults {
    const poll = this.getPoll(pollId);
    if (!poll) throw new Error("Poll not found");

    const options = this.getPollOptions(pollId);
    const votesForPoll = this.votes.filter((v) => v.poll_id === pollId);
    const totalVotes = votesForPoll.length;
    const totalMembers = this.profiles.length;

    // Count per option
    const optionResults = options.map((opt) => {
      const count = votesForPoll.filter((v) => v.option_id === opt.id).length;
      const percentage = totalVotes > 0 ? Number(((count / totalVotes) * 100).toFixed(1)) : 0;
      return {
        option_id: opt.id,
        option_date: opt.option_date,
        vote_count: count,
        percentage,
      };
    });

    // Check for highest vote count
    let maxVotes = 0;
    optionResults.forEach((o) => {
      if (o.vote_count > maxVotes) maxVotes = o.vote_count;
    });

    const topOptions = maxVotes > 0 ? optionResults.filter((o) => o.vote_count === maxVotes) : [];
    const isTie = topOptions.length > 1;

    let leadingDate: string | null = null;
    let leadingOptionId: string | null = null;

    if (!isTie && topOptions.length === 1) {
      leadingDate = topOptions[0].option_date;
      leadingOptionId = topOptions[0].option_id;
    }

    return {
      poll_id: poll.id,
      status: poll.status,
      finalized_date: poll.finalized_date || null,
      total_members: totalMembers,
      total_votes: totalVotes,
      pending_members: Math.max(0, totalMembers - totalVotes),
      turnout_percentage: totalMembers > 0 ? Number(((totalVotes / totalMembers) * 100).toFixed(1)) : 0,
      is_tie: isTie,
      leading_date: leadingDate,
      leading_option_id: leadingOptionId,
      leading_votes: maxVotes,
      tied_options: topOptions.map((t) => ({
        option_id: t.option_id,
        option_date: t.option_date,
        vote_count: t.vote_count,
      })),
      options: optionResults,
    };
  }

  // ==================== ADMIN ACTIONS ====================
  public addPollOption(pollId: string, optionDate: string): PollOption {
    if (optionDate < "2026-11-25") {
      throw new Error("Date must be after November 24, 2026");
    }
    const exists = this.pollOptions.some((po) => po.poll_id === pollId && po.option_date === optionDate);
    if (exists) {
      throw new Error("Date option already exists");
    }
    const newOption: PollOption = {
      id: "po_" + Math.random().toString(36).substring(2, 9),
      poll_id: pollId,
      option_date: optionDate,
      created_at: new Date().toISOString(),
    };
    this.pollOptions.push(newOption);
    return newOption;
  }

  public removePollOption(optionId: string, actorId: string): { success: boolean; affectedVotes: number } {
    const votesCount = this.votes.filter((v) => v.option_id === optionId).length;
    this.pollOptions = this.pollOptions.filter((po) => po.id !== optionId);
    this.votes = this.votes.filter((v) => v.option_id !== optionId);

    this.auditLogs.push({
      id: "aud_" + Math.random().toString(36).substring(2, 9),
      poll_id: this.polls[0].id,
      actor_id: actorId,
      action: "REMOVE_POLL_OPTION",
      old_value: { optionId, removedVotesCount: votesCount },
      new_value: null,
      created_at: new Date().toISOString(),
    });

    return { success: true, affectedVotes: votesCount };
  }

  public updatePollConfig(
    pollId: string,
    updates: Partial<Pick<Poll, "title" | "status" | "voting_deadline" | "min_date" | "max_date">>
  ): Poll {
    const poll = this.getPoll(pollId);
    if (!poll) throw new Error("Poll not found");
    Object.assign(poll, updates);
    return poll;
  }

  public finalizePoll(pollId: string, finalDate?: string): Poll {
    const poll = this.getPoll(pollId);
    if (!poll) throw new Error("Poll not found");

    if (finalDate) {
      poll.finalized_date = finalDate;
    } else {
      const results = this.getPollResults(pollId);
      if (results.is_tie) {
        throw new Error("Cannot auto-finalize a poll that has a tie. Admin must resolve the tie first.");
      }
      if (!results.leading_date) {
        throw new Error("No votes have been recorded to finalize the poll.");
      }
      poll.finalized_date = results.leading_date;
    }

    poll.status = "finalized";
    poll.finalized_at = new Date().toISOString();
    return poll;
  }

  public resolveTie(pollId: string, selectedDate: string, note: string, adminId: string): Poll {
    const poll = this.getPoll(pollId);
    if (!poll) throw new Error("Poll not found");

    poll.finalized_date = selectedDate;
    poll.finalized_at = new Date().toISOString();
    poll.status = "finalized";
    poll.tie_resolved_by = adminId;
    poll.tie_resolution_note = note;

    this.auditLogs.push({
      id: "aud_" + Math.random().toString(36).substring(2, 9),
      poll_id: pollId,
      actor_id: adminId,
      action: "RESOLVE_TIE",
      old_value: null,
      new_value: { selectedDate, note },
      created_at: new Date().toISOString(),
    });

    return poll;
  }

  // ==================== CHAT ====================
  public getChatMessages(): ChatMessage[] {
    return this.chatMessages
      .map((msg) => {
        const sender = this.findProfileById(msg.user_id);
        return {
          ...msg,
          sender_name: sender?.full_name || "Batchmate",
          sender_role: sender?.role || "member",
        };
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  public addChatMessage(userId: string, message: string): ChatMessage {
    const sender = this.findProfileById(userId);
    const newMsg: ChatMessage = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      sender_name: sender?.full_name || "Batchmate",
      sender_role: sender?.role || "member",
      message: message.trim(),
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.chatMessages.push(newMsg);
    return newMsg;
  }

  public deleteChatMessage(messageId: string, actorId: string, isAdmin: boolean): boolean {
    const msg = this.chatMessages.find((m) => m.id === messageId);
    if (!msg) return false;
    if (msg.user_id !== actorId && !isAdmin) {
      throw new Error("You are not authorized to delete this message");
    }
    msg.is_deleted = true;
    msg.deleted_by = actorId;
    msg.updated_at = new Date().toISOString();
    return true;
  }

  // ==================== ANNOUNCEMENTS ====================
  public getAnnouncements(): Announcement[] {
    return this.announcements.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
  }
}

// Global singleton instance for server session lifetime
const globalForStore = globalThis as unknown as { campusStore?: CampusReunionStore };
export const mockStore = globalForStore.campusStore || new CampusReunionStore();
if (process.env.NODE_ENV !== "production") globalForStore.campusStore = mockStore;
