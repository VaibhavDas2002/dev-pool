export type UserRole = "member" | "admin";
export type PollStatus = "draft" | "open" | "closed" | "finalized";

export interface Profile {
  id: string;
  auth_user_id?: string | null;
  full_name: string;
  mobile_number: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  has_voted: boolean;
  voted_option_id?: string | null;
}

export interface Poll {
  id: string;
  title: string;
  subtitle: string;
  description?: string | null;
  min_date: string;
  max_date: string;
  voting_deadline: string;
  status: PollStatus;
  finalized_date?: string | null;
  finalized_at?: string | null;
  tie_resolved_by?: string | null;
  tie_resolution_note?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_date: string; // YYYY-MM-DD
  created_at: string;
}

export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface OptionResult {
  option_id: string;
  option_date: string;
  vote_count: number;
  percentage: number;
}

export interface TiedOption {
  option_id: string;
  option_date: string;
  vote_count: number;
}

export interface PollResults {
  poll_id: string;
  status: PollStatus;
  finalized_date?: string | null;
  total_members: number;
  total_votes: number;
  pending_members: number;
  turnout_percentage: number;
  is_tie: boolean;
  leading_date?: string | null;
  leading_option_id?: string | null;
  leading_votes: number;
  tied_options: TiedOption[];
  options: OptionResult[];
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  is_deleted: boolean;
  deleted_by?: string | null;
  created_at: string;
  updated_at: string;
  sender_name?: string;
  sender_role?: UserRole;
}

export interface Announcement {
  id: string;
  poll_id?: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_by?: string;
  created_at: string;
}

export interface PollAuditLog {
  id: string;
  poll_id: string;
  actor_id: string;
  action: string;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  created_at: string;
}

export interface SessionUser {
  id: string;
  full_name: string;
  mobile_number: string;
  role: UserRole;
}
