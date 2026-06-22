import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let tempDir = "";

async function loadMailer() {
  vi.resetModules();
  return import("./universeMailer");
}

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "cosmos-mailer-"));
  process.env["UNIVERSE_SUBSCRIBERS_PATH"] = path.join(tempDir, "subscribers.json");
  process.env["UNIVERSE_EMAIL_OUTBOX_PATH"] = path.join(tempDir, "outbox.jsonl");
  delete process.env["RESEND_API_KEY"];
});

afterEach(async () => {
  delete process.env["UNIVERSE_SUBSCRIBERS_PATH"];
  delete process.env["UNIVERSE_EMAIL_OUTBOX_PATH"];
  delete process.env["RESEND_API_KEY"];
  await rm(tempDir, { recursive: true, force: true });
});

describe("universe mailer", () => {
  it("writes the welcome email to the local outbox when Resend is not configured", async () => {
    const { subscribeUniverseEmail, getUniverseEmailStatus } = await loadMailer();

    const result = await subscribeUniverseEmail("pilot@example.com", {
      planetName: "trace",
      starName: "debug",
      population: 42,
    });

    expect(result).toMatchObject({
      email: "pilot@example.com",
      welcomeDelivery: { mode: "outbox" },
    });
    expect(getUniverseEmailStatus()).toMatchObject({
      provider: "local-outbox",
      realInboxDelivery: false,
    });

    const outbox = await readFile(process.env["UNIVERSE_EMAIL_OUTBOX_PATH"]!, "utf8");
    const messages = outbox.trim().split("\n").map((line) => JSON.parse(line));
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      to: "pilot@example.com",
      subject: "Welcome to Cosmos Forge",
    });
    expect(messages[0].text).toContain("your citizens are counting on you.");
  });

  it("does not resend the welcome email to an existing subscriber", async () => {
    const { subscribeUniverseEmail } = await loadMailer();

    await subscribeUniverseEmail("pilot@example.com");
    const second = await subscribeUniverseEmail("pilot@example.com");

    expect(second).toMatchObject({
      email: "pilot@example.com",
      welcomeDelivery: null,
    });

    const outbox = await readFile(process.env["UNIVERSE_EMAIL_OUTBOX_PATH"]!, "utf8");
    expect(outbox.trim().split("\n")).toHaveLength(1);
  });
});
