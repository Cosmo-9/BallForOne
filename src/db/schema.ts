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

export type Tournament = typeof tournaments.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Player = typeof players.$inferSelect;
