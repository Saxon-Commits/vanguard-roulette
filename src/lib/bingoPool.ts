export const BINGO_POOL: string[] = [
  // Deaths & Physics
  "Died to a physics object",
  "Fell off the map 'by accident'",
  "Pushed off a ledge by a teammate",
  "Killed by own grenade",
  "Died loading into the encounter",
  "Killed by an Unstoppable Champion",
  "Died in the 'safe' zone",
  "Ran off ledge while explaining callouts",
  "Fell through the floor",
  "Killed by a Shrieker",
  "Died to environmental hazard",
  "Killed by a spike trap",

  // Mechanics Fails
  "Called the wrong callout",
  "Forgot to pick up their buff",
  "Dunked in the wrong spot",
  "Shot the wrong target",
  "Stood in the death zone",
  "Broke a tether prematurely",
  "Missed a dunk with 1 second left",
  "Used Super at the wrong time",
  "Forgot which symbol was theirs",
  "Left someone stranded with a buff",
  "Failed to shoot the crit spot",
  "Triggered the add wave early",
  "Killed a priority target before dunking",
  "Dropped the buff off the edge",
  "Ran past their position",

  // DPS Phase
  "Forgot to reload before DPS",
  "Super not charged for DPS phase",
  "Ran out of heavy ammo",
  "Missed the rally banner",
  "Wrong weapon equipped for DPS",
  "Buff expired 1 second before DPS",
  "Parked in someone else's DPS spot",
  "Died during damage phase",

  // Communication
  "Someone said 'What do I do?' during DPS",
  "Callout arrived after the wipe happened",
  "Entire team shouted different callouts",
  "Someone muted by accident during callouts",
  "'Wait where am I going?'",
  "Someone gave the right call 5 seconds too late",
  "'Sorry wrong callout'",

  // Saboteur Accusations
  "Accused someone of sabotage (wrong)",
  "Accused someone of sabotage (correct!)",
  "Got accused of being saboteur while innocent",
  "Saboteur voted out first try",
  "Entire team voted for the wrong person",
  "Host accused of rigging the selection",
  "Saboteur almost got away with it",

  // Classic Destiny Tropes
  "'One more try' said after 11 PM",
  "Someone's internet dies mid-run",
  "Server kick on the final stand",
  "DPS number humble-brag",
  "Blamed the lag for everything",
  "'I thought we were all doing X'",
  "Everyone has a different strategy",
  "Ad clear person ignored the ads",
  "Game crashes on checkpoint",
  "Exotic dropped for who already has it",
  "New player asked what the encounter is",
  "Veteran gave conflicting advice",
  "Someone 'helped' with ad clear during DPS",
  "Group voted to take a break",

  // Fun Outcomes
  "Somehow completed it despite total chaos",
  "Flawless encounter completely by accident",
  "Worst DPS somehow worked anyway",
  "Everyone dies but one person clutches",
  "The 'just run it back' strat pays off",
  "Fastest clear ever after a long wipe streak",
  "Second attempt goes perfectly",
  "Someone celebrates prematurely",
];

const CUSTOM_POOL_KEY = 'vr:custom_bingo_pool';

export function getCustomBingoPool(): string[] {
  try {
    const saved = localStorage.getItem(CUSTOM_POOL_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 16) {
        return parsed;
      }
    }
  } catch (_) { /* fallback to default */ }
  return [...BINGO_POOL];
}

export function saveCustomBingoPool(pool: string[]): void {
  localStorage.setItem(CUSTOM_POOL_KEY, JSON.stringify(pool));
}

export function resetCustomBingoPool(): string[] {
  localStorage.removeItem(CUSTOM_POOL_KEY);
  return [...BINGO_POOL];
}

export function getShuffledBingoCells(pool?: string[]): string[] {
  const source = pool && pool.length >= 16 ? pool : getCustomBingoPool();
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 16);
}
