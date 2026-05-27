import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export const runtime = "nodejs";

const FOLDERS = new Set(["Chats", "Goals", "Journal"]);
const BASE = "Agentic OS";

// Expand a leading ~ and normalize so the vault path works cross-platform.
function resolveVaultRoot(raw: string): string {
  let p = raw.trim();
  if (p === "~" || p.startsWith("~/") || p.startsWith("~\\")) {
    p = path.join(os.homedir(), p.slice(1));
  }
  return path.resolve(p);
}

// Strip anything that could escape the target folder.
function safeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

interface Body {
  vaultPath?: string;
  action?: "write" | "ping";
  folder?: string;
  filename?: string;
  mode?: "append" | "overwrite";
  header?: string;
  content?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { vaultPath, action = "write" } = body;
  if (!vaultPath?.trim()) {
    return NextResponse.json({ error: "No vault path configured" }, { status: 400 });
  }

  const root = resolveVaultRoot(vaultPath);
  const baseDir = path.join(root, BASE);

  try {
    // Confirm the vault root exists so we fail loudly on a wrong path
    // instead of silently creating a stray folder somewhere.
    const stat = await fs.stat(root).catch(() => null);
    if (!stat || !stat.isDirectory()) {
      return NextResponse.json(
        { error: `Vault folder not found: ${root}` },
        { status: 400 }
      );
    }

    if (action === "ping") {
      await fs.mkdir(baseDir, { recursive: true });
      const readme = path.join(baseDir, "README.md");
      if (!(await fs.stat(readme).catch(() => null))) {
        await fs.writeFile(
          readme,
          "# Agentic OS\n\nThis folder is synced automatically from CLAUDE OS Mission Control.\n\n- `Chats/` — one file per agent per day\n- `Goals/` — your living goal list\n- `Journal/` — daily journal entries\n",
          "utf8"
        );
      }
      return NextResponse.json({ ok: true, path: baseDir });
    }

    const folder = body.folder ?? "";
    const filename = safeName(body.filename ?? "");
    const mode = body.mode ?? "append";
    const content = body.content ?? "";

    if (!FOLDERS.has(folder)) {
      return NextResponse.json({ error: `Invalid folder: ${folder}` }, { status: 400 });
    }
    if (!filename) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const dir = path.join(baseDir, folder);
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, `${filename}.md`);

    const exists = !!(await fs.stat(file).catch(() => null));

    if (mode === "overwrite") {
      await fs.writeFile(file, (body.header ?? "") + content, "utf8");
    } else {
      // append — write the header only when creating the file
      if (!exists && body.header) {
        await fs.writeFile(file, body.header + content, "utf8");
      } else {
        await fs.appendFile(file, content, "utf8");
      }
    }

    return NextResponse.json({ ok: true, path: file });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to write to vault", detail: String(err) },
      { status: 500 }
    );
  }
}
