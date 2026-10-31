/**
 * What loading a save had to fix, counted by kind, so one line per file
 * says what was filled in or dropped instead of the file being thrown away.
 */
export class RepairLog {
  /**
   * How many times each fix was made.
   */
  private readonly _fixes = new Map<string, number>();

  /**
   * Notes a fix.
   * @param what What was done ("filled in missing hp", "dropped a bag item").
   */
  note(what: string): void {
    this._fixes.set(what, (this._fixes.get(what) ?? 0) + 1);
  }

  /**
   * Whether anything was fixed.
   * @returns True if so.
   */
  get any(): boolean {
    return this._fixes.size > 0;
  }

  /**
   * Logs what was fixed in a file, if anything.
   * @param file The file's path.
   */
  report(file: string): void {
    if (this.any) {
      const fixes = [...this._fixes].map(([what, n]: [string, number]): string => (n > 1 ? `${what} (x${n})` : what));
      console.log(`[save] repaired ${file}: ${fixes.join('; ')}`);
    }
  }
}
