import { config } from 'dotenv'

// dotenv v17 logs an "injecting env vars" line by default; keep build output quiet.
// Imported first (before env-validating modules) so variables load in time.
config({ quiet: true })
