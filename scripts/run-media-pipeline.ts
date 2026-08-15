#!/usr/bin/env tsx
/** Run media pipeline + 90-day archive purge (same as /api/jobs/media-pipeline). */
import { processPendingMedia, cleanupExpiredArchives } from "../src/lib/media-pipeline";

async function main() {
  const processed = await processPendingMedia(10);
  const cleanup = await cleanupExpiredArchives();
  console.log(JSON.stringify({ processed, cleanup }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
