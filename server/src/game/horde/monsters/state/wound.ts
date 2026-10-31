/**
 * Damage over time on a monster (bleeding, burning, poison, a curse):
 * damage a second, until when, and who's credited with a kill. A new
 * wound refreshes the old one rather than stacking: the higher rate and
 * the later end win.
 */
export class Wound<P> {
  /**
   * Damage a second.
   */
  rate = 0;

  /**
   * Game-clock time it stops.
   */
  until = 0;

  /**
   * Who made it, credited with a kill from it.
   */
  by: P | null = null;

  /**
   * Whether it's still doing damage.
   * @param now The game clock.
   * @returns True until it runs out.
   */
  active(now: number): boolean {
    return now < this.until;
  }

  /**
   * Opens or refreshes the wound: the higher rate and the later end win,
   * and a new hitter takes the credit (a hit with nobody behind it, like a
   * turret's, leaves the old credit).
   * @param rate Damage a second.
   * @param seconds How long it lasts from now.
   * @param by Who made it.
   * @param now The game clock.
   */
  refresh(rate: number, seconds: number, by: P | null, now: number): void {
    const active = this.active(now);
    this.rate = Math.max(active ? this.rate : 0, rate);
    this.until = Math.max(active ? this.until : 0, now + seconds);
    this.by = by ?? (active ? this.by : null);
  }
}
