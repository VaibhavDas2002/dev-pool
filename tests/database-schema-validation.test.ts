import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Campus Reunion Poll — Database Schema & SQL Migration Integrity", () => {
  const migrationPath = path.resolve(__dirname, "../supabase/migrations/20261109000000_init_campus_reunion_poll.sql");
  const seedPath = path.resolve(__dirname, "../supabase/seed.sql");

  it("Verifies migration SQL file exists and contains all required tables", () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
    const sql = fs.readFileSync(migrationPath, "utf-8");

    // Check required tables
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS profiles");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS polls");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS poll_options");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS votes");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS chat_messages");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS announcements");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS poll_audit_logs");
  });

  it("Verifies date constraints in SQL: min_date strictly >= 2026-11-25", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    expect(sql).toContain("CONSTRAINT min_date_after_nov_24_2026 CHECK (min_date >= '2026-11-25')");
  });

  it("Verifies atomic stored procedures and views exist in SQL", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    // View
    expect(sql).toContain("CREATE OR REPLACE VIEW public_profiles");
    // Stored procedure: cast_or_update_vote
    expect(sql).toContain("CREATE OR REPLACE FUNCTION cast_or_update_vote");
    expect(sql).toContain("p_poll_id UUID");
    expect(sql).toContain("p_option_id UUID");
    expect(sql).toContain("p_user_id UUID");
    // Stored procedure: get_poll_results
    expect(sql).toContain("CREATE OR REPLACE FUNCTION get_poll_results");
  });

  it("Verifies single active vote unique constraint", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    expect(sql).toContain("CONSTRAINT unique_user_vote_per_poll UNIQUE (poll_id, user_id)");
  });

  it("Verifies Row Level Security (RLS) policies are defined in migration", () => {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("CREATE POLICY");
    // Check RLS on votes, chat_messages, profiles
    expect(sql).toContain("ALTER TABLE profiles ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("ALTER TABLE votes ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY");
  });

  it("Verifies seed.sql populates default poll and options starting strictly on or after Nov 25, 2026", () => {
    expect(fs.existsSync(seedPath)).toBe(true);
    const seedSql = fs.readFileSync(seedPath, "utf-8");

    expect(seedSql).toContain("INSERT INTO polls");
    expect(seedSql).toContain("INSERT INTO poll_options");
    expect(seedSql).toContain("2026-11-25");
    expect(seedSql).toContain("2026-11-27");
    expect(seedSql).toContain("2026-11-30");
    expect(seedSql).toContain("2026-12-02");

    // Make sure no seed date is before 2026-11-25
    const dateMatches = seedSql.match(/'2026-\d{2}-\d{2}'/g) || [];
    for (const match of dateMatches) {
      const cleanDate = match.replace(/'/g, "");
      expect(cleanDate >= "2026-11-25").toBe(true);
    }
  });
});

