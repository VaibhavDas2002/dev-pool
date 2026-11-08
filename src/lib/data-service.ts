import { isSupabaseConfigured, createAdminClient } from "./supabase/server";
import { mockStore } from "./supabase/mock-store";
import { 
  Profile, 
  Poll, 
  PollOption, 
  Vote, 
  PollResults, 
  PublicProfile, 
  ChatMessage, 
  Announcement 
} from "@/types";

export const dataService = {
  /**
   * Find or create profile by full name and mobile number
   */
  async findOrCreateProfile(fullName: string, mobileNumber: string): Promise<Profile> {
    if (!isSupabaseConfigured()) {
      return mockStore.createOrGetProfile(fullName, mobileNumber);
    }

    const supabase = createAdminClient();
    
    // Check existing
    const { data: existing, error: findError } = await supabase
      .from("profiles")
      .select("*")
      .eq("mobile_number", mobileNumber)
      .maybeSingle();

    if (existing && !findError) {
      return existing as Profile;
    }

    // Role: default to admin if mobile is 9876543210 (or configured initial admin)
    const isAdmin = mobileNumber === (process.env.INITIAL_ADMIN_MOBILE || "9876543210");
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        full_name: fullName,
        mobile_number: mobileNumber,
        role: isAdmin ? "admin" : "member",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Profile creation error:", insertError);
      throw new Error(insertError.message || "Failed to create profile");
    }

    return newProfile as Profile;
  },

  /**
   * Get profile by ID
   */
  async getProfileById(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured()) {
      return mockStore.findProfileById(userId) || null;
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as Profile;
  },

  /**
   * Get main poll details
   */
  async getPoll(pollId: string): Promise<Poll | null> {
    if (!isSupabaseConfigured()) {
      return mockStore.getPoll(pollId) || null;
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("polls")
      .select("*")
      .eq("id", pollId)
      .maybeSingle();

    if (error || !data) {
      // Fallback to first available poll
      const { data: firstPoll } = await supabase.from("polls").select("*").limit(1).maybeSingle();
      return firstPoll as Poll;
    }
    return data as Poll;
  },

  /**
   * Get poll options
   */
  async getPollOptions(pollId: string): Promise<PollOption[]> {
    if (!isSupabaseConfigured()) {
      return mockStore.getPollOptions(pollId);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("poll_options")
      .select("*")
      .eq("poll_id", pollId)
      .order("option_date", { ascending: true });

    if (error) return [];
    return data as PollOption[];
  },

  /**
   * Get user's active vote
   */
  async getUserVote(pollId: string, userId: string): Promise<Vote | null> {
    if (!isSupabaseConfigured()) {
      return mockStore.getUserVote(pollId, userId) || null;
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .eq("poll_id", pollId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as Vote;
  },

  /**
   * Cast or update a vote atomically
   */
  async castOrUpdateVote(pollId: string, optionId: string, userId: string) {
    if (!isSupabaseConfigured()) {
      return mockStore.castOrUpdateVote(pollId, optionId, userId);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("cast_or_update_vote", {
      p_poll_id: pollId,
      p_option_id: optionId,
      p_user_id: userId,
    });

    if (error) {
      throw new Error(error.message || "Failed to record vote");
    }

    return data;
  },

  /**
   * Get poll results, leading date, turnout and tie status
   */
  async getPollResults(pollId: string): Promise<PollResults> {
    if (!isSupabaseConfigured()) {
      return mockStore.getPollResults(pollId);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("get_poll_results", {
      p_poll_id: pollId,
    });

    if (error) {
      throw new Error(error.message || "Failed to calculate poll results");
    }

    return data as PollResults;
  },

  /**
   * Get public member directory (no mobile numbers exposed)
   */
  async getPublicMembers(): Promise<PublicProfile[]> {
    if (!isSupabaseConfigured()) {
      return mockStore.getPublicMembers();
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("public_profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) return [];
    return data as PublicProfile[];
  },

  /**
   * Get group chat messages
   */
  async getChatMessages(): Promise<ChatMessage[]> {
    if (!isSupabaseConfigured()) {
      return mockStore.getChatMessages();
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("chat_messages")
      .select(`
        id,
        user_id,
        message,
        is_deleted,
        deleted_by,
        created_at,
        updated_at,
        profiles:user_id (
          full_name,
          role
        )
      `)
      .order("created_at", { ascending: true });

    if (error) return [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((msg: any) => ({
      id: msg.id,
      user_id: msg.user_id,
      message: msg.message,
      is_deleted: msg.is_deleted,
      deleted_by: msg.deleted_by,
      created_at: msg.created_at,
      updated_at: msg.updated_at,
      sender_name: msg.profiles?.full_name || "Batchmate",
      sender_role: msg.profiles?.role || "member",
    }));
  },

  /**
   * Add new message to group discussion
   */
  async addChatMessage(userId: string, message: string): Promise<ChatMessage> {
    if (!isSupabaseConfigured()) {
      return mockStore.addChatMessage(userId, message);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        user_id: userId,
        message: message.trim(),
      })
      .select(`
        id,
        user_id,
        message,
        is_deleted,
        created_at,
        updated_at,
        profiles:user_id (
          full_name,
          role
        )
      `)
      .single();

    if (error) {
      throw new Error(error.message || "Failed to send message");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = data as any;
    return {
      id: row.id,
      user_id: row.user_id,
      message: row.message,
      is_deleted: row.is_deleted,
      created_at: row.created_at,
      updated_at: row.updated_at,
      sender_name: row.profiles?.full_name || "Batchmate",
      sender_role: row.profiles?.role || "member",
    };
  },

  /**
   * Delete or moderate message
   */
  async deleteChatMessage(messageId: string, actorId: string, isAdmin: boolean): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return mockStore.deleteChatMessage(messageId, actorId, isAdmin);
    }

    const supabase = createAdminClient();
    const { data: msg } = await supabase
      .from("chat_messages")
      .select("user_id")
      .eq("id", messageId)
      .single();

    if (!msg) return false;
    if (msg.user_id !== actorId && !isAdmin) {
      throw new Error("Unauthorized to delete this message");
    }

    const { error } = await supabase
      .from("chat_messages")
      .update({
        is_deleted: true,
        deleted_by: actorId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", messageId);

    return !error;
  },

  /**
   * Add a new date option (Admin only, must be >= 2026-11-25)
   */
  async addDateOption(pollId: string, optionDate: string, actorId?: string): Promise<PollOption> {
    if (optionDate < "2026-11-25") {
      throw new Error("Date must be after November 24, 2026");
    }

    if (!isSupabaseConfigured()) {
      return mockStore.addPollOption(pollId, optionDate);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("poll_options")
      .insert({
        poll_id: pollId,
        option_date: optionDate,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Failed to add date option");
    }

    if (actorId) {
      await supabase.from("poll_audit_logs").insert({
        poll_id: pollId,
        actor_id: actorId,
        action: "ADD_POLL_OPTION",
        new_value: { optionDate },
      });
    }

    return data as PollOption;
  },

  /**
   * Remove a date option (Admin only)
   */
  async removeDateOption(optionId: string, actorId: string): Promise<{ success: boolean; affectedVotes: number }> {
    if (!isSupabaseConfigured()) {
      return mockStore.removePollOption(optionId, actorId);
    }

    const supabase = createAdminClient();
    const { count: affectedVotes } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("option_id", optionId);

    const { error } = await supabase
      .from("poll_options")
      .delete()
      .eq("id", optionId);

    if (error) throw new Error(error.message || "Failed to remove date option");

    // Audit log
    await supabase.from("poll_audit_logs").insert({
      actor_id: actorId,
      action: "REMOVE_POLL_OPTION",
      old_value: { optionId, removedVotesCount: affectedVotes || 0 },
    });

    return { success: true, affectedVotes: affectedVotes || 0 };
  },

  /**
   * Update poll configuration (Status, Deadline, Title, Dates)
   */
  async updatePollConfig(
    pollId: string,
    updates: Partial<Pick<Poll, "title" | "status" | "voting_deadline" | "min_date" | "max_date">>,
    actorId: string
  ): Promise<Poll> {
    if (!isSupabaseConfigured()) {
      return mockStore.updatePollConfig(pollId, updates);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("polls")
      .update(updates)
      .eq("id", pollId)
      .select()
      .single();

    if (error) throw new Error(error.message || "Failed to update poll configuration");

    await supabase.from("poll_audit_logs").insert({
      poll_id: pollId,
      actor_id: actorId,
      action: "UPDATE_POLL_CONFIG",
      new_value: updates,
    });

    return data as Poll;
  },

  /**
   * Finalize the poll with a winning date
   */
  async finalizePoll(pollId: string, selectedDate?: string, actorId?: string): Promise<Poll> {
    if (!isSupabaseConfigured()) {
      return mockStore.finalizePoll(pollId, selectedDate);
    }

    let finalDate = selectedDate;
    if (!finalDate) {
      const results = await this.getPollResults(pollId);
      if (results.is_tie) {
        throw new Error("Cannot auto-finalize with an active tie. Please resolve the tie first.");
      }
      if (!results.leading_date) {
        throw new Error("No votes have been cast to determine a winner.");
      }
      finalDate = results.leading_date;
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("polls")
      .update({
        status: "finalized",
        finalized_date: finalDate,
        finalized_at: new Date().toISOString(),
      })
      .eq("id", pollId)
      .select()
      .single();

    if (error) throw new Error(error.message || "Failed to finalize poll");

    if (actorId) {
      await supabase.from("poll_audit_logs").insert({
        poll_id: pollId,
        actor_id: actorId,
        action: "FINALIZE_POLL",
        new_value: { finalDate },
      });
    }

    return data as Poll;
  },

  /**
   * Admin explicitly resolves a tie
   */
  async resolveTie(pollId: string, selectedDate: string, note: string, adminId: string): Promise<Poll> {
    if (!isSupabaseConfigured()) {
      return mockStore.resolveTie(pollId, selectedDate, note, adminId);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("polls")
      .update({
        status: "finalized",
        finalized_date: selectedDate,
        finalized_at: new Date().toISOString(),
        tie_resolved_by: adminId,
        tie_resolution_note: note,
      })
      .eq("id", pollId)
      .select()
      .single();

    if (error) throw new Error(error.message || "Failed to resolve tie");

    await supabase.from("poll_audit_logs").insert({
      poll_id: pollId,
      actor_id: adminId,
      action: "RESOLVE_TIE",
      new_value: { selectedDate, note },
    });

    return data as Poll;
  },

  /**
   * Get active announcements
   */
  async getAnnouncements(): Promise<Announcement[]> {
    if (!isSupabaseConfigured()) {
      return mockStore.getAnnouncements();
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) return [];
    return data as Announcement[];
  },
};

