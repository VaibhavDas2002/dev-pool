-- ==============================================================================
-- Campus Reunion Poll — Seed Data
-- ==============================================================================

-- 1. Insert Initial Profiles (Admin & Friends)
INSERT INTO profiles (id, full_name, mobile_number, role, created_at)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'Rahul Das (Class Rep)', '9876543210', 'admin', now() - INTERVAL '5 days'),
    ('a0000000-0000-0000-0000-000000000002', 'Priya Sharma', '9876543211', 'member', now() - INTERVAL '5 days'),
    ('a0000000-0000-0000-0000-000000000003', 'Rohan Gupta', '9876543212', 'member', now() - INTERVAL '4 days'),
    ('a0000000-0000-0000-0000-000000000004', 'Sneha Patel', '9876543213', 'member', now() - INTERVAL '4 days'),
    ('a0000000-0000-0000-0000-000000000005', 'Amit Verma', '9876543214', 'member', now() - INTERVAL '3 days'),
    ('a0000000-0000-0000-0000-000000000006', 'Pooja Nair', '9876543215', 'member', now() - INTERVAL '3 days'),
    ('a0000000-0000-0000-0000-000000000007', 'Vikram Singh', '9876543216', 'member', now() - INTERVAL '2 days'),
    ('a0000000-0000-0000-0000-000000000008', 'Ananya Sen', '9876543217', 'member', now() - INTERVAL '2 days'),
    ('a0000000-0000-0000-0000-000000000009', 'Karthik Raja', '9876543218', 'member', now() - INTERVAL '1 days'),
    ('a0000000-0000-0000-0000-000000000010', 'Neha Deshmukh', '9876543219', 'member', now() - INTERVAL '1 days'),
    ('a0000000-0000-0000-0000-000000000011', 'Aditya Joshi', '9811122233', 'member', now() - INTERVAL '12 hours'),
    ('a0000000-0000-0000-0000-000000000012', 'Meera Krishnan', '9822233344', 'member', now() - INTERVAL '8 hours'),
    ('a0000000-0000-0000-0000-000000000013', 'Siddharth Roy', '9833344455', 'member', now() - INTERVAL '6 hours'),
    ('a0000000-0000-0000-0000-000000000014', 'Tanvi Kulkarni', '9844455566', 'member', now() - INTERVAL '4 hours'),
    ('a0000000-0000-0000-0000-000000000015', 'Arjun Nambiar', '9855566677', 'member', now() - INTERVAL '2 hours')
ON CONFLICT (mobile_number) DO NOTHING;

-- 2. Insert Official B.Tech Certificate Poll
INSERT INTO polls (
    id, 
    title, 
    subtitle, 
    description, 
    min_date, 
    max_date, 
    voting_deadline, 
    status, 
    created_by,
    created_at
)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'When Should We Visit College?',
    'Let''s choose the perfect day to collect our B.Tech certificates together!',
    'The administration office requires all B.Tech degree holders to be present with signed clearance forms. Let''s go as one batch, take graduation photos on the library stairs, and celebrate together!',
    '2026-11-25',
    '2026-12-10',
    '2026-11-23 23:59:59+05:30',
    'open',
    'a0000000-0000-0000-0000-000000000001',
    now() - INTERVAL '5 days'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Poll Options (After Nov 24, 2026)
INSERT INTO poll_options (id, poll_id, option_date, created_at)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '2026-11-25', now() - INTERVAL '5 days'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '2026-11-27', now() - INTERVAL '5 days'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', '2026-11-30', now() - INTERVAL '5 days'),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', '2026-12-02', now() - INTERVAL '5 days')
ON CONFLICT (poll_id, option_date) DO NOTHING;

-- 4. Insert Seed Votes
-- 27 Nov (Option 2): 6 votes from seed members
-- 30 Nov (Option 3): 3 votes
-- 25 Nov (Option 1): 2 votes
-- 02 Dec (Option 4): 1 vote
INSERT INTO votes (poll_id, option_id, user_id, created_at)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', now() - INTERVAL '4 days'),
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', now() - INTERVAL '4 days'),
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', now() - INTERVAL '3 days'),
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', now() - INTERVAL '3 days'),
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', now() - INTERVAL '2 days'),
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', now() - INTERVAL '2 days'),
    -- 30 Nov
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000007', now() - INTERVAL '2 days'),
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000008', now() - INTERVAL '1 days'),
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000009', now() - INTERVAL '1 days'),
    -- 25 Nov
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000010', now() - INTERVAL '18 hours'),
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000011', now() - INTERVAL '12 hours'),
    -- 02 Dec
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000012', now() - INTERVAL '6 hours')
ON CONFLICT (poll_id, user_id) DO NOTHING;

-- 5. Insert Warm Group Chat Messages
INSERT INTO chat_messages (id, user_id, message, is_deleted, created_at)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Hey everyone! Welcome to our official certificate collection planner! Please vote your date by Nov 23 so we can notify the registrar! 🎓', false, now() - INTERVAL '3 days'),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Finally! Super excited to see everyone. I voted for 27 Nov because Friday is perfect before the weekend!', false, now() - INTERVAL '2 days' + INTERVAL '2 hours'),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Count me in for 27th! Are we doing lunch at Maggi point near gate 2? 🍜', false, now() - INTERVAL '2 days' + INTERVAL '3 hours'),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'Definitely Maggi point! Also make sure to bring your college ID card or provisional certificate copy for smooth counter processing.', false, now() - INTERVAL '1 days' + INTERVAL '4 hours'),
    ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'Awesome! Most people are voting for 27th Nov right now. Let''s close this soon!', false, now() - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Initial Announcement
INSERT INTO announcements (id, poll_id, title, content, is_pinned, created_by, created_at)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    '📢 College Visit Guidelines & Timelines',
    'Dear Batchmates: The Academic Section confirmed that B.Tech degrees will be handed over starting Nov 25. Please bring your library No-Dues receipt and student ID card. Vote for your preferred day before polling closes on Nov 23!',
    true,
    'a0000000-0000-0000-0000-000000000001',
    now() - INTERVAL '4 days'
)
ON CONFLICT (id) DO NOTHING;
