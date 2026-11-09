-- Migration: 20261109000001_add_vote_reason.sql
-- Description: Adds reason/message text to votes table so batchmates can share why they chose a date

ALTER TABLE votes ADD COLUMN IF NOT EXISTS reason TEXT;

-- Update cast_or_update_vote function to accept p_reason
CREATE OR REPLACE FUNCTION cast_or_update_vote(
    p_poll_id UUID,
    p_option_id UUID,
    p_user_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_poll_status TEXT;
    v_voting_deadline TIMESTAMPTZ;
    v_vote_id UUID;
    v_is_update BOOLEAN := FALSE;
    v_selected_date DATE;
    v_is_active BOOLEAN;
BEGIN
    -- Check user active status
    SELECT is_active INTO v_is_active FROM profiles WHERE id = p_user_id;
    IF v_is_active = FALSE THEN
        RAISE EXCEPTION 'Your account has been deactivated by the administrator.';
    END IF;

    -- Validate poll status and deadline
    SELECT status, voting_deadline INTO v_poll_status, v_voting_deadline
    FROM polls WHERE id = p_poll_id;

    IF v_poll_status IS NULL THEN
        RAISE EXCEPTION 'Poll not found';
    END IF;

    IF v_poll_status != 'open' THEN
        RAISE EXCEPTION 'Voting is currently %', v_poll_status;
    END IF;

    IF v_voting_deadline < now() THEN
        RAISE EXCEPTION 'The voting deadline has expired';
    END IF;

    -- Validate option belongs to poll
    SELECT option_date INTO v_selected_date
    FROM poll_options
    WHERE id = p_option_id AND poll_id = p_poll_id;

    IF v_selected_date IS NULL THEN
        RAISE EXCEPTION 'Invalid date option selected for this poll';
    END IF;

    -- Atomic Upsert vote
    INSERT INTO votes (poll_id, option_id, user_id, reason, updated_at)
    VALUES (p_poll_id, p_option_id, p_user_id, p_reason, now())
    ON CONFLICT (poll_id, user_id)
    DO UPDATE SET
        option_id = EXCLUDED.option_id,
        reason = COALESCE(EXCLUDED.reason, votes.reason),
        updated_at = now()
    RETURNING id, (xmax != 0) INTO v_vote_id, v_is_update;

    RETURN jsonb_build_object(
        'success', true,
        'vote_id', v_vote_id,
        'is_update', v_is_update,
        'selected_date', v_selected_date,
        'reason', p_reason
    );
END;
$$;
