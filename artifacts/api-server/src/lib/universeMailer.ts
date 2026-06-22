import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { logger } from "./logger";

interface UniverseStats {
  planetName: string;
  starName: string;
  year: number;
  era: string;
  population: number;
  food: number;
  energy: number;
  tech: number;
  health: number;
  moons: number;
}

interface Subscriber {
  email: string;
  createdAt: string;
  lastSentAt?: string;
  welcomeSentAt?: string;
  stats: UniverseStats;
}

const defaultStats: UniverseStats = {
  planetName: "terra-9",
  starName: "sol-prime",
  year: 0,
  era: "primordial",
  population: 0,
  food: 10,
  energy: 10,
  tech: 0,
  health: 100,
  moons: 0,
};

const dataPath =
  process.env["UNIVERSE_SUBSCRIBERS_PATH"] ??
  path.resolve(process.cwd(), ".data", "universe-subscribers.json");

const outboxPath =
  process.env["UNIVERSE_EMAIL_OUTBOX_PATH"] ??
  path.resolve(process.cwd(), ".data", "universe-email-outbox.jsonl");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function ensureDir(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function readSubscribers(): Promise<Subscriber[]> {
  try {
    return JSON.parse(await readFile(dataPath, "utf8")) as Subscriber[];
  } catch {
    return [];
  }
}

async function writeSubscribers(subscribers: Subscriber[]) {
  await ensureDir(dataPath);
  await writeFile(dataPath, JSON.stringify(subscribers, null, 2));
}

function normalizeStats(stats: Partial<UniverseStats> | undefined): UniverseStats {
  return {
    ...defaultStats,
    ...stats,
    year: Math.max(0, Number(stats?.year ?? defaultStats.year)),
    population: Math.max(0, Math.floor(Number(stats?.population ?? defaultStats.population))),
    moons: Math.max(0, Math.floor(Number(stats?.moons ?? defaultStats.moons))),
  };
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.floor(value));
}

function formatYear(year: number): string {
  if (year >= 1_000_000_000) return `${(year / 1_000_000_000).toFixed(2)} billion years`;
  if (year >= 1_000_000) return `${(year / 1_000_000).toFixed(1)} million years`;
  if (year >= 1_000) return `${(year / 1_000).toFixed(1)}k years`;
  return `${Math.floor(year)} years`;
}

function renderEmail(stats: UniverseStats): { subject: string; text: string } {
  return {
    subject: "Your Universe Awaits!",
    text: [
      "Your Universe Awaits!",
      "",
      `${stats.planetName} is still spinning around ${stats.starName}.`,
      `Universe age: ${formatYear(stats.year)}`,
      `Era: ${stats.era}`,
      `Population: ${formatNumber(stats.population)}`,
      `Food: ${Math.round(stats.food)}`,
      `Energy: ${Math.round(stats.energy)}`,
      `Tech: ${Math.round(stats.tech)}`,
      `Health: ${Math.round(stats.health)}`,
      `Moons: ${stats.moons}`,
      "",
      "- sen",
    ].join("\n"),
  };
}

function renderWelcomeEmail(): { subject: string; text: string } {
  return {
    subject: "Welcome to Cosmos Forge",
    text: [
      "hey,",
      "",
      "thanks for checking out cosmos forge.",
      "",
      "somewhere out there, a tiny civilization just came into existence, and for some reason they've decided you're qualified to lead them.",
      "",
      "your job is to help them survive, grow, and maybe one day reach the stars.",
      "",
      "i'm still actively working on the game, so if you find bugs, have ideas, or your civilization somehow starts worshipping potatoes, feel free to let me know.",
      "",
      "have fun, and good luck.",
      "",
      "your citizens are counting on you.",
      "",
      "- sen, the girl who built the game",
    ].join("\n"),
  };
}

async function sendMessage(email: string, message: { subject: string; text: string }) {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["UNIVERSE_EMAIL_FROM"] ?? "Cosmos Forge <onboarding@resend.dev>";

  if (apiKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: message.subject,
        text: message.text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend email failed with ${response.status}: ${await response.text()}`);
    }
    return;
  }

  await ensureDir(outboxPath);
  await writeFile(
    outboxPath,
    `${JSON.stringify({ to: email, sentAt: new Date().toISOString(), ...message })}\n`,
    { flag: "a" },
  );
}

async function sendEmail(email: string, stats: UniverseStats) {
  await sendMessage(email, renderEmail(stats));
}

async function sendWelcomeEmail(email: string) {
  await sendMessage(email, renderWelcomeEmail());
}

export async function subscribeUniverseEmail(email: string, stats?: Partial<UniverseStats>) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!emailPattern.test(normalizedEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  const subscribers = await readSubscribers();
  const existing = subscribers.find((subscriber) => subscriber.email === normalizedEmail);
  const now = new Date().toISOString();
  let welcomeSentAt = existing?.welcomeSentAt;

  if (!welcomeSentAt) {
    await sendWelcomeEmail(normalizedEmail);
    welcomeSentAt = now;
  }

  const next: Subscriber = {
    email: normalizedEmail,
    createdAt: existing?.createdAt ?? now,
    lastSentAt: existing?.lastSentAt,
    welcomeSentAt,
    stats: normalizeStats(stats ?? existing?.stats),
  };

  await writeSubscribers([
    next,
    ...subscribers.filter((subscriber) => subscriber.email !== normalizedEmail),
  ]);

  return { email: normalizedEmail };
}

export async function updateUniverseStats(email: string, stats: Partial<UniverseStats>) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!emailPattern.test(normalizedEmail)) return;

  const subscribers = await readSubscribers();
  const existing = subscribers.find((subscriber) => subscriber.email === normalizedEmail);
  if (!existing) return;

  await writeSubscribers(
    subscribers.map((subscriber) =>
      subscriber.email === normalizedEmail
        ? { ...subscriber, stats: normalizeStats({ ...subscriber.stats, ...stats }) }
        : subscriber,
    ),
  );
}

export async function sendDailyUniverseEmails() {
  const subscribers = await readSubscribers();
  const today = new Date().toISOString().slice(0, 10);
  const nextSubscribers: Subscriber[] = [];

  for (const subscriber of subscribers) {
    if (subscriber.lastSentAt?.slice(0, 10) === today) {
      nextSubscribers.push(subscriber);
      continue;
    }

    try {
      await sendEmail(subscriber.email, subscriber.stats);
      nextSubscribers.push({ ...subscriber, lastSentAt: new Date().toISOString() });
    } catch (err) {
      logger.error({ err, email: subscriber.email }, "Unable to send universe email");
      nextSubscribers.push(subscriber);
    }
  }

  await writeSubscribers(nextSubscribers);
}

export function startDailyUniverseEmailSchedule() {
  const run = () => {
    void sendDailyUniverseEmails();
  };
  const dayMs = 24 * 60 * 60 * 1000;
  const intervalMs = Number(process.env["UNIVERSE_EMAIL_INTERVAL_MS"] ?? dayMs);

  setTimeout(run, 3000);
  setInterval(run, Number.isFinite(intervalMs) && intervalMs > 0 ? intervalMs : dayMs);
}
