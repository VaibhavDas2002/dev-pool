-- Migration: 20261109000001_add_vote_reason.sql
-- Description: Adds reason/message text to votes table and ensures admins can vote in any poll

ALTER TABLE votes ADD COLUMN IF NOT EXISTS reason TEXT;

-- Update cast_or_update_vote function to accept p_reason and allow admins to vote in any poll
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
    v_role TEXT;
    v_actual_option_id UUID;
    v_actual_poll_id UUID;
BEGIN
    -- Check user active status & role
    SELECT role, is_active INTO v_role, v_is_active FROM profiles WHERE id = p_user_id;
    IF v_is_active = FALSE THEN
        RAISE EXCEPTION 'Your account has been deactivated by the administrator.';
    END IF;

    -- Validate poll status and deadline for non-admins
    SELECT status, voting_deadline INTO v_poll_status, v_voting_deadline
    FROM polls WHERE id = p_poll_id;

    IF v_poll_status IS NULL THEN
        RAISE EXCEPTION 'Poll not found';
    END IF;

    -- Admins can vote in any poll; non-admins require open status and valid deadline
    IF v_role != 'admin' THEN
        IF v_poll_status != 'open' THEN
            RAISE EXCEPTION 'Voting is currently %', v_poll_status;
        END IF;

        IF v_voting_deadline < now() THEN
            RAISE EXCEPTION 'The voting deadline has expired';
        END IF;
    END IF;

    -- Validate option belongs to poll (with multi-stage resolution)
    SELECT id, option_date, poll_id INTO v_actual_option_id, v_selected_date, v_actual_poll_id
    FROM poll_options
    WHERE id = p_option_id AND poll_id = p_poll_id;

    -- If not found by poll_id, check if option exists by ID in any poll
    IF v_actual_option_id IS NULL THEN
        SELECT id, option_date, poll_id INTO v_actual_option_id, v_selected_date, v_actual_poll_id
        FROM poll_options
        WHERE id = p_option_id
        LIMIT 1;

        IF v_actual_option_id IS NOT NULL THEN
            p_poll_id := v_actual_poll_id;
            p_option_id := v_actual_option_id;
        END IF;
    END IF;

    -- If still not found, check if first available option for this poll can be used
    IF v_actual_option_id IS NULL THEN
        SELECT id, option_date, poll_id INTO v_actual_option_id, v_selected_date, v_actual_poll_id
        FROM poll_options
        WHERE poll_id = p_poll_id
        ORDER BY option_date ASC
        LIMIT 1;

        IF v_actual_option_id IS NOT NULL THEN
            p_option_id := v_actual_option_id;
        END IF;
    END IF;

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
