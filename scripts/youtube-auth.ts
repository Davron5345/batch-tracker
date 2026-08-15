#!/usr/bin/env tsx
/**
 * One-time helper: obtain YOUTUBE_REFRESH_TOKEN.
 *
 * 1. Create OAuth client in Google Cloud Console (YouTube Data API v3 enabled)
 * 2. Put YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in .env
 * 3. Run: npx tsx scripts/youtube-auth.ts
 * 4. Open the printed URL, allow access, paste the code back
 */
import { createInterface } from "readline/promises";
import { google } from "googleapis";
import { readFileSync, existsSync } from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const val = m[2].trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

async function main() {
  loadEnv();
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error("Сначала задайте YOUTUBE_CLIENT_ID и YOUTUBE_CLIENT_SECRET в .env");
    process.exit(1);
  }

  const redirectUri = "http://localhost:3000/oauth2callback";
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/youtube.upload"],
  });

  console.log("\nВ Google Cloud → OAuth Client добавьте redirect URI:");
  console.log(`  ${redirectUri}`);
  console.log("\nОткройте URL в браузере и разрешите доступ:\n");
  console.log(url);
  console.log(
    "\nПосле редиректа скопируйте параметр code=... из адресной строки (страница может показать 404 — это нормально).\n"
  );

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const code = (await rl.question("Вставьте code: ")).trim();
  rl.close();

  const { tokens } = await oauth2.getToken(code);
  if (!tokens.refresh_token) {
    console.error("refresh_token не получен. Удалите доступ приложению в Google-аккаунте и повторите.");
    process.exit(1);
  }

  console.log("\nДобавьте в .env:\n");
  console.log(`YOUTUBE_REFRESH_TOKEN="${tokens.refresh_token}"`);
  console.log(`YOUTUBE_PRIVACY_STATUS="unlisted"`);
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
