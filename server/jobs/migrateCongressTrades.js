// One-time migration: normalize legacy congressTrades to structured arrays
// Usage: node server/jobs/migrateCongressTrades.js [--dry]

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { migrateCongressTrades } from './migrations/congressTradesMigration.js';

dotenv.config();

const DRY_RUN = process.argv.includes('--dry');

async function run() {
  console.log(`\n🚀 Migration: Normalize congressTrades → arrays ${DRY_RUN ? '(DRY RUN)' : ''}`);
  await connectDB();

  const result = await migrateCongressTrades({ dryRun: DRY_RUN });
  console.log(`\n✅ Migration complete: scanned=${result.scanned}, updated=${result.updated}, skipped=${result.skipped}, errors=${result.errors}`);
  await mongoose.connection.close();
  process.exit(errors ? 1 : 0);
}

run().catch(async (err) => {
  console.error('❌ Fatal migration error:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
