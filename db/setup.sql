-- Run this once in the Neon SQL Editor to create the tables.
-- It matches src/db/schema.ts.

CREATE TABLE IF NOT EXISTS tournaments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  format TEXT NOT NULL,
  host TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT,
  shirt_number INTEGER,
  photo_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  home_team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP,
  venue TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  home_score INTEGER,
  away_score INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
