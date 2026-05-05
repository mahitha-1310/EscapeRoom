export const MAX_INVENTORY = 8;

export const ITEMS = {
  cipherNote: { name: "Cipher note", icon: "📜", kind: "clue" },
  brassKey: { name: "Brass key", icon: "🗝️", kind: "key" },
  silverKey: { name: "Silver key", icon: "🔑", kind: "key" },
  ironKey: { name: "Iron key", icon: "🧷", kind: "key" },
  goldKey: { name: "Gold key", icon: "✨", kind: "key" },
  obsidianKey: { name: "Obsidian key", icon: "◆", kind: "key" },
};

export const EXIT_RULES = {
  brassKey: { target: "studyExit", message: "The key fits. The door unlocks." },
  silverKey: { target: "libraryExit", message: "The lock turns smoothly." },
  ironKey: { target: "workshopExit", message: "The heavy bolt slides back." },
  goldKey: { target: "archiveExit", message: "The archive door yields." },
};

export const BACKGROUNDS = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1521587760476-5c1a7cc9858f?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80",
];

export const ROOMS = [
  {
    title: "I — Study",
    message: "The study is quiet. A locked cabinet and exit stand out.",
    hotspots: [
      { id: "note", label: "Note", l: 18, t: 52, w: 14, h: 18 },
      { id: "cabinet", label: "Cabinet", l: 62, t: 38, w: 22, h: 40 },
      { id: "doorLock", label: "Lock", l: 8, t: 40, w: 10, h: 14 },
      { id: "exitDoor", label: "Door", l: 6, t: 22, w: 16, h: 52 },
    ],
  },
  {
    title: "II — Library",
    message: "Rows of books hide a chest puzzle.",
    hotspots: [
      { id: "painting", label: "Painting", l: 58, t: 18, w: 32, h: 34 },
      { id: "chest", label: "Chest", l: 22, t: 58, w: 28, h: 28 },
      { id: "exitDoor", label: "Door", l: 6, t: 22, w: 16, h: 52 },
    ],
  },
  {
    title: "III — Workshop",
    message: "A breaker panel hums against the wall.",
    hotspots: [
      { id: "poster", label: "Diagram", l: 70, t: 12, w: 24, h: 30 },
      { id: "panel", label: "Panel", l: 18, t: 28, w: 20, h: 38 },
      { id: "exitDoor", label: "Door", l: 6, t: 22, w: 16, h: 52 },
    ],
  },
  {
    title: "IV — Archive",
    message: "Dusty records surround a compact safe.",
    hotspots: [
      { id: "safe", label: "Safe", l: 72, t: 52, w: 20, h: 28 },
      { id: "exitDoor", label: "Door", l: 6, t: 22, w: 16, h: 52 },
    ],
  },
  {
    title: "V — Vault",
    message: "The final chamber has two layers of security.",
    hotspots: [
      { id: "briefcase", label: "Case", l: 40, t: 54, w: 26, h: 24 },
      { id: "innerHatch", label: "Inner Hatch", l: 6, t: 22, w: 16, h: 52 },
    ],
    coreHotspots: [
      { id: "terminal", label: "Console", l: 34, t: 42, w: 32, h: 28 },
      { id: "finalDoor", label: "Exit", l: 6, t: 22, w: 16, h: 52 },
    ],
  },
];
