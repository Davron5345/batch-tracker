import { google } from "googleapis";
import { readFileSync, writeFileSync, existsSync } from "fs";

function loadEnv() {
  const envPath = ".env";
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
  const code = process.argv[2];
  if (!code) {
    console.error("Usage: tsx scripts/exchange-youtube-code.ts <code>");
    process.exit(1);
  }

  const oauth2 = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    "http://localhost:3000/oauth2callback"
  );

  const { tokens } = await oauth2.getToken(code);
  if (!tokens.refresh_token) {
    console.error("NO_REFRESH_TOKEN");
    console.error(JSON.stringify(tokens, null, 2));
    process.exit(2);
  }

  let env = readFileSync(".env", "utf8");
  if (env.includes("YOUTUBE_REFRESH_TOKEN=")) {
    env = env.replace(
      /YOUTUBE_REFRESH_TOKEN=.*/g,
      `YOUTUBE_REFRESH_TOKEN="${tokens.refresh_token}"`
    );
  } else {
    env += `\nYOUTUBE_REFRESH_TOKEN="${tokens.refresh_token}"\n`;
  }
  writeFileSync(".env", env);
  console.log("OK");
  console.log(tokens.refresh_token);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
