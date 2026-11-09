import { 
  Profile, 
  Poll, 
  PollOption, 
  Vote, 
  PollResults, 
  ChatMessage, 
  Announcement, 
  PublicProfile,
  PollAuditLog,
  OptionVoter 
} from "@/types";
import { getInitials } from "@/lib/utils";

// In-memory persistent state during server runtime
class CampusReunionStore {
  private profiles: Profile[] = [
    {
      id: "a0000000-0000-0000-0000-000000000001",
      full_name: "Vaibhav Das",
      mobile_number: "6297977842",
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
      label: "Opening Day",
      note: "First day certificates are issued at the counter",
      is_recommended: false,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "c0000000-0000-0000-0000-000000000002",
      poll_id: "b0000000-0000-0000-0000-000000000001",
      option_date: "2026-11-27",
      label: "⭐ Recommended (Friday)",
      note: "Full counter staffing & alumni hangout afterwards",
      is_recommended: true,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "c0000000-0000-0000-0000-000000000003",
      poll_id: "b0000000-0000-0000-0000-000000000001",
      option_date: "2026-11-30",
      label: "Month End Monday",
      note: "Less rush, easy parking on campus",
      is_recommended: false,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "c0000000-0000-0000-0000-000000000004",
      poll_id: "b0000000-0000-0000-0000-000000000001",
      option_date: "2026-12-02",
      label: "December Buffer",
      note: "Backup date for out-of-station batchmates",
      is_recommended: false,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];

  private votes: Vote[] = [
    // 27 Nov (Option 2): 6 seed votes
    { id: "v1", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000002", user_id: "a0000000-0000-0000-0000-000000000001", reason: "Convenient Friday before weekend; counters confirmed open.", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v2", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000002", user_id: "a0000000-0000-0000-0000-000000000002", reason: "Weekend travel is easiest for outstation batchmates.", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v3", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000002", user_id: "a0000000-0000-0000-0000-000000000003", reason: "Planning group lunch at Maggi Point after certificate counter! 🍜", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v4", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000002", user_id: "a0000000-0000-0000-0000-000000000004", reason: "Best day for batch photo on library stairs with everyone. 📸", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v5", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000002", user_id: "a0000000-0000-0000-0000-000000000005", reason: "Coming with Priya and Rohan in car pool.", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v6", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000002", user_id: "a0000000-0000-0000-0000-000000000006", reason: "Confirmed faculty & HOD available that morning.", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    // 30 Nov (Option 3): 3 votes
    { id: "v7", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000003", user_id: "a0000000-0000-0000-0000-000000000007", reason: "Taking leave from office on Monday.", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v8", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000003", user_id: "a0000000-0000-0000-0000-000000000008", reason: "Month end date works nicely.", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v9", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000003", user_id: "a0000000-0000-0000-0000-000000000009", reason: "Free after project submission.", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    // 25 Nov (Option 1): 2 votes
    { id: "v10", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000001", user_id: "a0000000-0000-0000-0000-000000000010", reason: "Earliest official day to collect certificates.", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "v11", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000001", user_id: "a0000000-0000-0000-0000-000000000011", reason: "Less crowd expected on day one.", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    // 02 Dec (Option 4): 1 vote
    { id: "v12", poll_id: "b0000000-0000-0000-0000-000000000001", option_id: "c0000000-0000-0000-0000-000000000004", user_id: "a0000000-0000-0000-0000-000000000012", reason: "December timing gives extra preparation buffer.", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
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
  public getAllProfiles(): Profile[] {
    return [...this.profiles];
  }

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
      role: (mobile === (process.env.INITIAL_ADMIN_MOBILE || "6297977842") || mobile === "6297977842") ? "admin" : "member",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.profiles.push(newProfile);
    return newProfile;
  }

  public getActiveProfiles(): Profile[] {
    return this.profiles.filter((p) => p.is_active !== false);
  }

  public getPublicMembers(onlyActive = false): PublicProfile[] {
    const defaultPoll = this.polls[0];
    const sourceProfiles = onlyActive ? this.profiles.filter((p) => p.is_active !== false) : this.profiles;
    return sourceProfiles.map((p) => {
      const vote = this.votes.find((v) => v.user_id === p.id && v.poll_id === defaultPoll?.id);
      const votedOption = vote ? this.pollOptions.find((po) => po.id === vote.option_id) : undefined;
      return {
        id: p.id,
        full_name: p.full_name,
        role: p.role,
        is_active: p.is_active !== false,
        created_at: p.created_at,
        has_voted: !!vote,
        voted_option_id: vote ? vote.option_id : null,
        voted_date: votedOption ? votedOption.option_date : null,
        voted_reason: vote ? vote.reason : null,
        mobile_number: p.mobile_number, // needed for resilient deactivation across cold-starts
      };
    });
  }

  public toggleMemberStatus(
    userId: string,
    actorId: string,
    isActive?: boolean,
    fallbackData?: { full_name?: string; mobile_number?: string }
  ): Profile {
    // 1. Primary lookup: by ID
    let profile = this.profiles.find((p) => p.id === userId);

    // 2. Fallback: by mobile number (handles cold-start ID mismatch)
    if (!profile && fallbackData?.mobile_number) {
      profile = this.profiles.find((p) => p.mobile_number === fallbackData.mobile_number);
      if (profile) {
        // Update the in-memory profile ID to match what the client sent
        // so future lookups work correctly in this server instance
        profile.id = userId;
      }
    }

    // 3. Auto-register: if member was created in a previous server instance (cold-start),
    //    re-create the profile so the status toggle can proceed
    if (!profile && fallbackData?.full_name) {
      const newProfile: Profile = {
        id: userId,
        full_name: fallbackData.full_name,
        mobile_number: fallbackData.mobile_number || "",
        role: "member",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.profiles.push(newProfile);
      profile = newProfile;
    }

    if (!profile) throw new Error("Member profile not found");

    if (profile.role === "admin" && profile.mobile_number === "6297977842" && isActive === false) {
      throw new Error("Primary Administrator account cannot be deactivated");
    }

    if (userId === actorId && isActive === false) {
      throw new Error("You cannot deactivate your own admin account");
    }

    const newStatus = isActive !== undefined ? isActive : profile.is_active === false;
    profile.is_active = newStatus;
    profile.updated_at = new Date().toISOString();

    this.auditLogs.push({
      id: "aud_" + Math.random().toString(36).substring(2, 9),
      poll_id: this.polls[0]?.id || "b0000000-0000-0000-0000-000000000001",
      actor_id: actorId,
      action: "UPDATE_MEMBER_STATUS",
      old_value: { userId, is_active: !newStatus },
      new_value: { userId, is_active: newStatus },
      created_at: new Date().toISOString(),
    });

    return profile;
  }

  // ==================== POLLS & OPTIONS ====================
  public getPoll(pollId: string): Poll {
    const found = this.polls.find((p) => p.id === pollId);
    if (found) return found;
    if (this.polls.length > 0) return this.polls[this.polls.length - 1];
    return this.createPoll({});
  }

  public createPoll(data: Partial<Poll>, initialDates?: string[]): Poll {
    const newId = data.id || ("b" + Math.random().toString(36).substring(2, 11) + "-0000-0000-0000");
    const minDate = data.min_date || "2026-11-25";
    if (minDate < "2026-11-25") {
      throw new Error("Date must be after November 24, 2026");
    }

    const newPoll: Poll = {
      id: newId,
      title: data.title || "When Should We Visit College?",
      subtitle: data.subtitle || "Let's choose the perfect day to collect our B.Tech certificates together!",
      description: data.description || "The administration office requires all B.Tech degree holders to be present with signed clearance forms. Let's go as one batch, take graduation photos on the library stairs, and celebrate together!",
      min_date: minDate,
      max_date: data.max_date || "2026-12-31",
      voting_deadline: data.voting_deadline || "2026-11-23T23:59:59+05:30",
      status: data.status || "open",
      created_by: data.created_by || "a0000000-0000-0000-0000-000000000001",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.polls.unshift(newPoll);

    // Initial dates
    const dates = initialDates && initialDates.length > 0 
      ? initialDates 
      : ["2026-11-25", "2026-11-27", "2026-11-30", "2026-12-02"];

    dates.forEach((d) => {
      if (d >= minDate) {
        this.pollOptions.push({
          id: "c" + Math.random().toString(36).substring(2, 11) + "-0000-0000",
          poll_id: newId,
          option_date: d,
          created_at: new Date().toISOString(),
        });
      }
    });

    return newPoll;
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
  public castOrUpdateVote(
    pollId: string,
    optionId: string,
    userId: string,
    reason?: string | null,
    optionDate?: string | null
  ) {
    let poll = this.polls.find((p) => p.id === pollId) || this.polls[0];
    if (!poll) {
      throw new Error("Poll not found");
    }
    const resolvedPollId = poll.id;

    const userProfile = this.profiles.find((p) => p.id === userId);
    const isAdmin = userProfile?.role === "admin";

    if (userProfile && userProfile.is_active === false) {
      throw new Error("Your account has been deactivated by the administrator.");
    }

    // Administrators can vote in any poll regardless of status or deadline
    if (!isAdmin) {
      if (poll.status !== "open") {
        throw new Error(`Voting is currently ${poll.status}`);
      }

      if (new Date(poll.voting_deadline).getTime() < Date.now()) {
        throw new Error("The voting deadline has expired");
      }
    }

    // Multi-stage option resolution to guarantee accurate option mapping
    let option = this.pollOptions.find((po) => po.id === optionId && po.poll_id === resolvedPollId);
    if (!option) {
      // Check if option ID exists across any poll
      option = this.pollOptions.find((po) => po.id === optionId);
    }
    if (!option && optionDate) {
      // Find by explicit optionDate
      option = this.pollOptions.find((po) => po.option_date === optionDate && po.poll_id === resolvedPollId)
        || this.pollOptions.find((po) => po.option_date === optionDate);
    }
    if (!option && optionId && /^\d{4}-\d{2}-\d{2}$/.test(optionId)) {
      // Option ID itself is a date string
      option = this.pollOptions.find((po) => po.option_date === optionId && po.poll_id === resolvedPollId)
        || this.pollOptions.find((po) => po.option_date === optionId);
    }

    // Auto-create / ensure option if date is a valid reunion date (>= 2026-11-25)
    const effectiveDate = optionDate || (/^\d{4}-\d{2}-\d{2}$/.test(optionId) ? optionId : null);
    if (!option && effectiveDate && effectiveDate >= "2026-11-25") {
      const newOption: PollOption = {
        id: "c0000000-0000-0000-0000-" + Math.random().toString(16).substring(2, 14),
        poll_id: resolvedPollId,
        option_date: effectiveDate,
        label: null,
        note: null,
        is_recommended: false,
        created_at: new Date().toISOString(),
      };
      this.pollOptions.push(newOption);
      option = newOption;
    }

    if (!option) {
      throw new Error("Invalid date option selected for this poll");
    }

    const resolvedOptionId = option.id;
    const targetPollId = option.poll_id || resolvedPollId;

    const existingIndex = this.votes.findIndex((v) => v.poll_id === targetPollId && v.user_id === userId);
    let voteId: string;
    let isUpdate = false;
    const cleanReason = reason !== undefined ? (reason ? reason.trim() : null) : undefined;

    if (existingIndex >= 0) {
      isUpdate = true;
      this.votes[existingIndex].option_id = resolvedOptionId;
      if (cleanReason !== undefined) {
        this.votes[existingIndex].reason = cleanReason;
      }
      this.votes[existingIndex].updated_at = new Date().toISOString();
      voteId = this.votes[existingIndex].id;
    } else {
      voteId = "v_" + Math.random().toString(36).substring(2, 9);
      this.votes.push({
        id: voteId,
        poll_id: targetPollId,
        option_id: resolvedOptionId,
        user_id: userId,
        reason: cleanReason !== undefined ? cleanReason : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      vote_id: voteId,
      is_update: isUpdate,
      selected_date: option.option_date,
      reason: cleanReason !== undefined ? cleanReason : (existingIndex >= 0 ? this.votes[existingIndex].reason : null),
      poll_id: targetPollId,
      option_id: resolvedOptionId,
    };
  }

  // ==================== POLL RESULTS ====================
  public getPollResults(pollId: string): PollResults {
    const poll = this.getPoll(pollId);
    if (!poll) throw new Error("Poll not found");

    const options = this.getPollOptions(pollId);
    const votesForPoll = this.votes.filter((v) => v.poll_id === pollId);
    const totalVotes = votesForPoll.length;
    const totalMembers = this.profiles.filter((p) => p.is_active !== false).length;

    // Count per option
    const optionResults = options.map((opt) => {
      const optionVotes = votesForPoll.filter((v) => v.option_id === opt.id);
      const count = optionVotes.length;
      const percentage = totalVotes > 0 ? Number(((count / totalVotes) * 100).toFixed(1)) : 0;
      const voters: OptionVoter[] = optionVotes
        .filter((v) => {
          const prof = this.profiles.find((p) => p.id === v.user_id);
          return !prof || prof.is_active !== false;
        })
        .map((v) => {
          const prof = this.profiles.find((p) => p.id === v.user_id);
          const name = prof?.full_name || "Batchmate";
          return {
            user_id: v.user_id,
            full_name: name,
            initials: getInitials(name),
            role: prof?.role || "member",
            reason: v.reason || null,
            voted_at: v.updated_at || v.created_at,
          };
        });
      return {
        option_id: opt.id,
        option_date: opt.option_date,
        label: opt.label,
        note: opt.note,
        is_recommended: opt.is_recommended,
        vote_count: count,
        percentage,
        voters,
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
  public addPollOption(
    pollId: string,
    optionDate: string,
    label?: string | null,
    note?: string | null,
    isRecommended?: boolean
  ): PollOption {
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
      label: label?.trim() || null,
      note: note?.trim() || null,
      is_recommended: !!isRecommended,
      created_at: new Date().toISOString(),
    };
    this.pollOptions.push(newOption);
    return newOption;
  }

  public updatePollOption(
    optionId: string,
    updates: {
      option_date?: string;
      label?: string | null;
      note?: string | null;
      is_recommended?: boolean;
    },
    actorId?: string
  ): PollOption {
    const opt = this.pollOptions.find((po) => po.id === optionId);
    if (!opt) throw new Error("Date option not found");

    if (updates.option_date !== undefined) {
      if (updates.option_date < "2026-11-25") {
        throw new Error("Date must be after November 24, 2026");
      }
      const duplicate = this.pollOptions.some(
        (po) => po.poll_id === opt.poll_id && po.id !== optionId && po.option_date === updates.option_date
      );
      if (duplicate) {
        throw new Error("Another option already exists for this date");
      }
      opt.option_date = updates.option_date;
    }

    if (updates.label !== undefined) {
      opt.label = updates.label?.trim() || null;
    }
    if (updates.note !== undefined) {
      opt.note = updates.note?.trim() || null;
    }
    if (updates.is_recommended !== undefined) {
      opt.is_recommended = updates.is_recommended;
    }

    if (actorId) {
      this.auditLogs.push({
        id: "aud_" + Math.random().toString(36).substring(2, 9),
        poll_id: opt.poll_id,
        actor_id: actorId,
        action: "UPDATE_POLL_OPTION",
        old_value: null,
        new_value: updates,
        created_at: new Date().toISOString(),
      });
    }

    return opt;
  }

  public batchSyncDateOptions(pollId: string, dates: string[], actorId?: string): PollOption[] {
    for (const d of dates) {
      if (d < "2026-11-25") {
        throw new Error(`All dates must be after November 24, 2026 (${d} is invalid)`);
      }
    }

    const existing = this.pollOptions.filter((po) => po.poll_id === pollId);
    const existingDateMap = new Map(existing.map((po) => [po.option_date, po]));
    const targetSet = new Set(dates);

    // Add new ones
    for (const d of dates) {
      if (!existingDateMap.has(d)) {
        this.pollOptions.push({
          id: "po_" + Math.random().toString(36).substring(2, 9),
          poll_id: pollId,
          option_date: d,
          label: null,
          note: null,
          is_recommended: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Remove ones not in dates
    for (const po of existing) {
      if (!targetSet.has(po.option_date)) {
        this.removePollOption(po.id, actorId || "admin");
      }
    }

    return this.getPollOptions(pollId);
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

