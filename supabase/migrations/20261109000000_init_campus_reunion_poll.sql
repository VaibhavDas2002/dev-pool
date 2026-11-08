-- ==============================================================================
-- Campus Reunion Poll — Database Migration
-- Project: B.Tech Certificate Collection Planner
-- ==============================================================================

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for phone lookups and role queries
CREATE INDEX IF NOT EXISTS idx_profiles_mobile_number ON profiles(mobile_number);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);

-- 2. Create Polls Table
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT 'Let''s choose the perfect day to collect our B.Tech certificates together!',
    description TEXT,
    min_date DATE NOT NULL DEFAULT '2026-11-25',
    max_date DATE NOT NULL DEFAULT '2026-12-31',
    voting_deadline TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'finalized')),
    finalized_date DATE NULL,
    finalized_at TIMESTAMPTZ NULL,
    tie_resolved_by UUID REFERENCES profiles(id),
    tie_resolution_note TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT min_date_after_nov_24_2026 CHECK (min_date >= '2026-11-25')
);

-- 3. Create Poll Options Table
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_poll_option_date UNIQUE (poll_id, option_date)
);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_date ON poll_options(option_date);

-- 4. Create Votes Table
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_vote_per_poll UNIQUE (poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON votes(option_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

-- 5. Create Group Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- 6. Create Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create Poll Audit Logs Table
CREATE TABLE IF NOT EXISTS poll_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_poll_audit_logs_poll_id ON poll_audit_logs(poll_id);

-- 8. Secure View for Public Profiles (excludes private mobile_number)
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
    p.id,
    p.full_name,
    p.role,
    p.created_at,
    CASE WHEN v.id IS NOT NULL THEN TRUE ELSE FALSE END AS has_voted,
    v.option_id AS voted_option_id
FROM profiles p
LEFT JOIN votes v ON v.user_id = p.id;

-- 9. Atomic Voting Stored Procedure
CREATE OR REPLACE FUNCTION cast_or_update_vote(
    p_poll_id UUID,
    p_option_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_poll_status VARCHAR(20);
    v_poll_deadline TIMESTAMPTZ;
    v_option_poll_id UUID;
    v_option_date DATE;
    v_vote_id UUID;
    v_is_update BOOLEAN := FALSE;
    v_old_option_id UUID;
BEGIN
    -- 1. Check poll status and deadline
    SELECT status, voting_deadline 
    INTO v_poll_status, v_poll_deadline
    FROM polls
    WHERE id = p_poll_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Poll not found with id: %', p_poll_id;
    END IF;

    IF v_poll_status != 'open' THEN
        RAISE EXCEPTION 'Voting is closed for this poll (Current status: %)', v_poll_status;
    END IF;

    IF v_poll_deadline < now() THEN
        RAISE EXCEPTION 'The voting deadline has passed';
    END IF;

    -- 2. Verify the option belongs to this poll
    SELECT poll_id, option_date
    INTO v_option_poll_id, v_option_date
    FROM poll_options
    WHERE id = p_option_id;

    IF NOT FOUND OR v_option_poll_id != p_poll_id THEN
        RAISE EXCEPTION 'Invalid date option selected for this poll';
    END IF;

    -- 3. Check if user has already voted
    SELECT id, option_id
    INTO v_vote_id, v_old_option_id
    FROM votes
    WHERE poll_id = p_poll_id AND user_id = p_user_id;

    IF FOUND THEN
        v_is_update := TRUE;
        -- Update existing vote
        UPDATE votes
        SET option_id = p_option_id,
            updated_at = now()
        WHERE id = v_vote_id;
    ELSE
        -- Insert new vote
        INSERT INTO votes (poll_id, option_id, user_id, created_at, updated_at)
        VALUES (p_poll_id, p_option_id, p_user_id, now(), now())
        RETURNING id INTO v_vote_id;
    END IF;

    -- Return structured result
    RETURN jsonb_build_object(
        'success', true,
        'vote_id', v_vote_id,
        'is_update', v_is_update,
        'old_option_id', v_old_option_id,
        'new_option_id', p_option_id,
        'selected_date', v_option_date
    );
END;
$$;

-- 10. Real-time Aggregation Function
CREATE OR REPLACE FUNCTION get_poll_results(p_poll_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_members INT;
    v_total_votes INT;
    v_leading_option_id UUID;
    v_leading_date DATE;
    v_leading_votes INT := 0;
    v_is_tie BOOLEAN := FALSE;
    v_tied_dates JSONB := '[]'::JSONB;
    v_options_json JSONB;
    v_poll_status VARCHAR(20);
    v_finalized_date DATE;
BEGIN
    SELECT status, finalized_date INTO v_poll_status, v_finalized_date
    FROM polls WHERE id = p_poll_id;

    -- Total registered members
    SELECT COUNT(*) INTO v_total_members FROM profiles;

    -- Total votes cast for this poll
    SELECT COUNT(*) INTO v_total_votes FROM votes WHERE poll_id = p_poll_id;

    -- Aggregate per option
    WITH option_counts AS (
        SELECT 
            po.id AS option_id,
            po.option_date,
            COUNT(v.id) AS vote_count
        FROM poll_options po
        LEFT JOIN votes v ON v.option_id = po.id AND v.poll_id = p_poll_id
        WHERE po.poll_id = p_poll_id
        GROUP BY po.id, po.option_date
        ORDER BY po.option_date ASC
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'option_id', oc.option_id,
            'option_date', oc.option_date,
            'vote_count', oc.vote_count,
            'percentage', CASE WHEN v_total_votes > 0 THEN ROUND((oc.vote_count::NUMERIC / v_total_votes::NUMERIC) * 100, 1) ELSE 0 END
        )
    ) INTO v_options_json
    FROM option_counts oc;

    -- Determine leader or tie
    WITH ranked AS (
        SELECT 
            po.id AS option_id,
            po.option_date,
            COUNT(v.id) AS vote_count,
            DENSE_RANK() OVER (ORDER BY COUNT(v.id) DESC) as rank
        FROM poll_options po
        LEFT JOIN votes v ON v.option_id = po.id AND v.poll_id = p_poll_id
        WHERE po.poll_id = p_poll_id
        GROUP BY po.id, po.option_date
    ),
    top_rank AS (
        SELECT * FROM ranked WHERE rank = 1 AND vote_count > 0
    )
    SELECT 
        (COUNT(*) > 1),
        COALESCE(MAX(vote_count), 0),
        jsonb_agg(jsonb_build_object('option_id', option_id, 'option_date', option_date, 'vote_count', vote_count))
    INTO v_is_tie, v_leading_votes, v_tied_dates
    FROM top_rank;

    IF v_is_tie = FALSE AND v_leading_votes > 0 THEN
        SELECT (v_tied_dates->0->>'option_id')::UUID, (v_tied_dates->0->>'option_date')::DATE
        INTO v_leading_option_id, v_leading_date;
    END IF;

    RETURN jsonb_build_object(
        'poll_id', p_poll_id,
        'status', v_poll_status,
        'finalized_date', v_finalized_date,
        'total_members', v_total_members,
        'total_votes', v_total_votes,
        'pending_members', GREATEST(0, v_total_members - v_total_votes),
        'turnout_percentage', CASE WHEN v_total_members > 0 THEN ROUND((v_total_votes::NUMERIC / v_total_members::NUMERIC) * 100, 1) ELSE 0 END,
        'is_tie', COALESCE(v_is_tie, false),
        'leading_date', v_leading_date,
        'leading_option_id', v_leading_option_id,
        'leading_votes', v_leading_votes,
        'tied_options', COALESCE(v_tied_dates, '[]'::JSONB),
        'options', COALESCE(v_options_json, '[]'::JSONB)
    );
END;
$$;

-- 11. Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Members can view safe public profiles
CREATE POLICY "Public profile view" ON profiles
    FOR SELECT USING (true);

-- Profiles: Users can only update their own profile name
CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

-- Polls: Everyone authenticated can view
CREATE POLICY "Allow read polls" ON polls
    FOR SELECT USING (true);

-- Poll Options: Read access for all
CREATE POLICY "Allow read poll options" ON poll_options
    FOR SELECT USING (true);

-- Votes: Members can read their own votes
CREATE POLICY "Users read own vote" ON votes
    FOR SELECT USING (
        user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    );

-- Chat: Members can read non-deleted messages
CREATE POLICY "Allow read active chat messages" ON chat_messages
    FOR SELECT USING (is_deleted = FALSE OR deleted_by IS NOT NULL);

-- Announcements: Read access for all
CREATE POLICY "Allow read announcements" ON announcements
    FOR SELECT USING (true);

-- Enable Realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'votes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE votes;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'polls'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE polls;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'poll_options'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE poll_options;
    END IF;
END $$;
