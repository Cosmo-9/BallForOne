import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// A competition, e.g. "Engineering Faculty Cup 2026"
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sport: text("sport").notNull(), // football, basketball, volleyball, handball
  format: text("format").notNull(), // league or knockout
  host: text("host"), // the faculty or department running it
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// A team entered in one tournament
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// A player on one team
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: text("position"),
  shirtNumber: integer("shirt_number"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// A fixture between two teams. awayTeamId is empty when it's a bye.
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
  round: integer("round").notNull(),
  homeTeamId: integer("home_team_id").references(() => teams.id, { onDelete: "cascade" }),
  awayTeamId: integer("away_team_id").references(() => teams.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at"),
  venue: text("venue"),
  status: text("status").notNull().default("upcoming"), // upcoming, live, finished, bye
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Tournament = typeof tournaments.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Match = typeof matches.$inferSelect;
