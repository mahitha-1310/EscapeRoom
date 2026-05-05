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

export const ROOM_THEMES = [
  {
    aria: "Study room with warm lamplight and a dark wood desk",
    image: "assets/rooms/study.svg",
    imageOpen: "assets/rooms/study-open.svg",
    background:
      "radial-gradient(circle at 22% 28%, rgba(244, 196, 118, 0.22), transparent 24%), linear-gradient(180deg, #433325 0%, #241c18 42%, #151314 100%)",
  },
  {
    aria: "Library room with deep shelves and cool window light",
    image: "assets/rooms/library.svg",
    imageOpen: "assets/rooms/library-open.svg",
    background:
      "radial-gradient(circle at 72% 20%, rgba(163, 196, 214, 0.16), transparent 24%), linear-gradient(180deg, #223244 0%, #1c2431 45%, #14171e 100%)",
  },
  {
    aria: "Workshop room with industrial walls and amber machinery light",
    image: "assets/rooms/workshop.svg",
    imageOpen: "assets/rooms/workshop-open.svg",
    background:
      "radial-gradient(circle at 68% 18%, rgba(231, 154, 64, 0.22), transparent 24%), linear-gradient(180deg, #4a4438 0%, #2d2f31 45%, #16171b 100%)",
  },
  {
    aria: "Archive room with shadowed shelves and brass accents",
    image: "assets/rooms/archive.svg",
    imageOpen: "assets/rooms/archive-open.svg",
    background:
      "radial-gradient(circle at 76% 22%, rgba(201, 162, 39, 0.18), transparent 24%), linear-gradient(180deg, #32322d 0%, #252420 45%, #161515 100%)",
  },
  {
    aria: "Vault room with stone walls and hidden mechanisms",
    image: "assets/rooms/vault.svg",
    imageOpen: "assets/rooms/vault-open.svg",
    background:
      "radial-gradient(circle at 46% 18%, rgba(113, 143, 180, 0.16), transparent 24%), linear-gradient(180deg, #303842 0%, #1e232a 45%, #121418 100%)",
  },
  {
    aria: "Vault core with active console lighting",
    image: "assets/rooms/vault-core.svg",
    background:
      "radial-gradient(circle at 50% 28%, rgba(107, 191, 138, 0.22), transparent 24%), linear-gradient(180deg, #13302b 0%, #13241f 45%, #0b1212 100%)",
  },
];

export const ROOMS = [
  {
    title: "I — Study",
    nextRoomIndex: 1,
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
    previousRoomIndex: 0,
    nextRoomIndex: 2,
    message: "Rows of books hide a chest puzzle.",
    hotspots: [
      { id: "backDoor", label: "Return", l: 4, t: 74, w: 18, h: 14 },
      { id: "painting", label: "Painting", l: 61, t: 16, w: 24, h: 22 },
      { id: "chest", label: "Chest", l: 22, t: 58, w: 28, h: 28 },
      { id: "exitDoor", label: "Door", l: 6, t: 22, w: 16, h: 52 },
    ],
  },
  {
    title: "III — Workshop",
    previousRoomIndex: 1,
    nextRoomIndex: 3,
    message: "A breaker panel hums against the wall.",
    hotspots: [
      { id: "backDoor", label: "Return", l: 4, t: 74, w: 18, h: 14 },
      { id: "poster", label: "Diagram", l: 70, t: 12, w: 24, h: 30 },
      { id: "panel", label: "Panel", l: 18, t: 28, w: 20, h: 38 },
      { id: "exitDoor", label: "Door", l: 6, t: 22, w: 16, h: 52 },
    ],
  },
  {
    title: "IV — Archive",
    previousRoomIndex: 2,
    nextRoomIndex: 4,
    message: "Dusty records surround a compact safe.",
    hotspots: [
      { id: "backDoor", label: "Return", l: 4, t: 74, w: 18, h: 14 },
      { id: "safe", label: "Safe", l: 72, t: 52, w: 20, h: 28 },
      { id: "exitDoor", label: "Door", l: 6, t: 22, w: 16, h: 52 },
    ],
  },
  {
    title: "V — Vault",
    previousRoomIndex: 3,
    message: "The final chamber has two layers of security.",
    hotspots: [
      { id: "backDoor", label: "Return", l: 4, t: 74, w: 18, h: 14 },
      { id: "briefcase", label: "Case", l: 40, t: 54, w: 26, h: 24 },
      { id: "innerHatch", label: "Inner Hatch", l: 6, t: 22, w: 16, h: 52 },
    ],
    coreHotspots: [
      { id: "backDoor", label: "Return", l: 4, t: 74, w: 18, h: 14 },
      { id: "terminal", label: "Console", l: 34, t: 42, w: 32, h: 28 },
      { id: "finalDoor", label: "Exit", l: 6, t: 22, w: 16, h: 52 },
    ],
  },
];
