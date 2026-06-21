#!/usr/bin/env node
import { execFileSync } from "node:child_process";

const message = process.argv.slice(2).join(" ").trim();

if (!message) {
  console.error('Usage: pnpm run progress:push -- "short commit message"');
  process.exit(1);
}

const run = (command, args, options = {}) => {
  execFileSync(command, args, { stdio: "inherit", ...options });
};

const read = (command, args) =>
  execFileSync(command, args, { encoding: "utf8" }).trim();

const branch = read("git", ["branch", "--show-current"]);

if (!branch) {
  console.error("No current git branch found.");
  process.exit(1);
}

if (branch === "main" || branch === "master") {
  console.error(
    "Refusing to auto-commit directly on the default branch. Create a feature branch first.",
  );
  process.exit(1);
}

run("pnpm", ["run", "typecheck"]);
run("pnpm", ["run", "build:app"]);

const status = read("git", ["status", "--porcelain"]);
if (!status) {
  console.log("No local changes to commit.");
  process.exit(0);
}

run("git", ["add", "-A"]);
run("git", ["commit", "-m", message]);
run("git", ["push", "-u", "origin", branch]);
