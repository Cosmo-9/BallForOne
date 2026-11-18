-- Step 2: fixtures. Run this once in the Neon SQL Editor.
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
