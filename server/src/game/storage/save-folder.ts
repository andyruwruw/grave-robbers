// Packages
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * The folder a save is staged in before it's moved into place.
 */
const PENDING = 'pending';

/**
 * The file that marks a staged save as complete.
 */
const COMMIT = 'commit.json';

/**
 * Writes several files into a folder as one: everything goes to `pending/`
 * first, then `pending/commit.json` lists them, and only then are they
 * moved into place. A crash before the list is written leaves the old save
 * whole (the staging is thrown away); a crash after it is finished on the
 * next load (`recoverFolder`). So a world and its players never come back
 * from different moments.
 * @param dir The save's folder.
 * @param files What to write, by path inside the folder.
 * @param removed Paths inside the folder to delete with it.
 */
export function commitFolder(dir: string, files: Map<string, string | Uint8Array>, removed: string[] = []): void {
  const pending = join(dir, PENDING);
  rmSync(pending, { recursive: true, force: true });
  for (const [path, data] of files) {
    mkdirSync(dirname(join(pending, path)), { recursive: true });
    writeFileSync(join(pending, path), data);
  }
  mkdirSync(pending, { recursive: true });
  writeFileSync(join(pending, `${COMMIT}.tmp`), JSON.stringify({ files: [...files.keys()], removed }));
  renameSync(join(pending, `${COMMIT}.tmp`), join(pending, COMMIT));
  finish(dir);
}

/**
 * Finishes a save a crash interrupted, or throws away one that never
 * completed. Call before reading a folder.
 * @param dir The save's folder.
 */
export function recoverFolder(dir: string): void {
  const pending = join(dir, PENDING);
  if (!existsSync(pending)) {
    return;
  }
  if (existsSync(join(pending, COMMIT))) {
    console.log(`[save] finishing an interrupted save in ${dir}`);
    finish(dir);
  } else {
    rmSync(pending, { recursive: true, force: true });
  }
}

/**
 * Moves a committed save's files into place (skipping any already moved)
 * and deletes what it removed.
 * @param dir The save's folder.
 */
function finish(dir: string): void {
  const pending = join(dir, PENDING);
  const { files, removed } = JSON.parse(readFileSync(join(pending, COMMIT), 'utf8')) as { files: string[]; removed: string[] };
  for (const path of files) {
    if (existsSync(join(pending, path))) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      renameSync(join(pending, path), join(dir, path));
    }
  }
  for (const path of removed) {
    rmSync(join(dir, path), { force: true });
  }
  rmSync(pending, { recursive: true, force: true });
}
