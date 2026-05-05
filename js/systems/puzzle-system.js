import { EXIT_RULES, ITEMS, ROOMS } from "../data/game-data.js";

const COMBO_CONFIG = {
  cabinet: { title: "Study Cabinet", solution: "189", length: 3 },
  chest: { title: "Library Chest", solution: "333", length: 3 },
  panel: { title: "Workshop Panel", solution: "101", length: 3 },
  safe: { title: "Archive Safe", solution: "472", length: 3 },
};

export class PuzzleSystem {
  constructor(state, inventory) {
    this.state = state;
    this.inventory = inventory;
  }

  clickObject(objectId) {
    if (objectId === "backDoor") return this._handleBackDoor();
    const selected = this.state.selectedItemId;
    if (selected) return this._useSelectedItem(selected, objectId);

    switch (this.state.roomIndex) {
      case 0:
        return this._roomStudy(objectId);
      case 1:
        return this._roomLibrary(objectId);
      case 2:
        return this._roomWorkshop(objectId);
      case 3:
        return this._roomArchive(objectId);
      case 4:
        return this._roomVault(objectId);
      default:
        return { message: "Nothing happens." };
    }
  }

  pickFloorItem(itemId) {
    if (this.state.selectedItemId) {
      return { message: "Deselect your held item before picking something up." };
    }

    if (!ITEMS[itemId]) return { message: "You cannot take that." };
    if (!this.inventory.add(itemId)) {
      return { message: "Your inventory is full. Drop an item first." };
    }

    if (itemId === "cipherNote") this.state.flags.studyNoteTaken = true;
    return { message: `You picked up the ${this.inventory.label(itemId).toLowerCase()}.`, changed: true };
  }

  dropSelected() {
    const selected = this.state.selectedItemId;
    if (!selected) return { message: "Select an item to drop it." };
    this.inventory.remove(selected);
    this.inventory.addToFloor(this.state.roomIndex, selected);
    return { message: `You dropped the ${this.inventory.label(selected).toLowerCase()}.`, changed: true };
  }

  describeObject(objectId) {
    const selected = this.state.selectedItemId;
    if (selected) {
      const compatibility = this._canUseItemOnObject(selected, objectId);
      if (compatibility.compatible) return compatibility.message;
      return `${this.inventory.label(selected)} is selected. Click a target to try using it.`;
    }

    return this._defaultHoverText(objectId);
  }

  describeTargetState(objectId) {
    if (!this.state.selectedItemId) return { compatible: false };
    return { compatible: this._canUseItemOnObject(this.state.selectedItemId, objectId).compatible };
  }

  appendComboDigit(digit) {
    if (!this.state.activeCombo) return;
    const { length } = this.state.activeCombo;
    if (this.state.comboInput.length >= length) return;
    this.state.comboInput += digit;
  }

  clearComboInput() {
    this.state.comboInput = "";
  }

  closeCombo() {
    this.state.activeCombo = null;
    this.state.comboInput = "";
  }

  submitCombo() {
    const combo = this.state.activeCombo;
    if (!combo) return { message: "No puzzle is open." };
    if (this.state.comboInput.length !== combo.length) return { message: `Enter all ${combo.length} digits first.` };

    const { objectId, solution } = combo;
    if (this.state.comboInput !== solution) {
      this.state.comboInput = "";
      return { message: combo.failureMessage || "Incorrect code." };
    }

    this.closeCombo();

    if (objectId === "cabinet") {
      this.state.flags.studyCabinetOpen = true;
      this.state.flags.studyCodeKnown = true;
      return { message: "The cabinet unlocks and opens. A brass key is inside.", changed: true };
    }
    if (objectId === "chest") {
      this.state.flags.libraryChestOpen = true;
      return { message: "The chest clicks open. A silver key is inside.", changed: true };
    }
    if (objectId === "panel") {
      this.state.flags.workshopPanelOpen = true;
      return { message: "The panel accepts the sequence and slides open. An iron key is inside.", changed: true };
    }
    if (objectId === "safe") {
      this.state.flags.archiveSafeOpen = true;
      return { message: "The safe unlocks. A gold key glints inside.", changed: true };
    }

    return { message: "The mechanism accepts the code.", changed: true };
  }

  _useSelectedItem(itemId, objectId) {
    const roomIndex = this.state.roomIndex;
    const compatibility = this._canUseItemOnObject(itemId, objectId);
    if (!compatibility.compatible) return { message: compatibility.message || "That doesn't work here." };

    if (objectId === "exitDoor" && roomIndex <= 3) {
      this._setExitOpen(roomIndex, true);
      this.inventory.select(null);
      return this._moveToConnectedRoom(ROOMS[roomIndex].nextRoomIndex, `${compatibility.message} You move to the next room.`);
    }

    if (roomIndex === 4 && objectId === "briefcase" && itemId === "goldKey") {
      this.state.flags.vaultCaseOpen = true;
      this.inventory.select(null);
      return { message: "The gold key opens the case. Something dark rests inside.", changed: true };
    }
    if (roomIndex === 4 && objectId === "innerHatch" && itemId === "obsidianKey") {
      this.state.flags.vaultInnerOpen = true;
      this.inventory.select(null);
      return { message: "The inner hatch unlocks and slides away.", changed: true };
    }
    if (roomIndex === 4 && objectId === "terminal" && itemId === "cipherNote" && this.state.flags.vaultInnerOpen) {
      this.state.flags.vaultCorePowered = true;
      this.inventory.select(null);
      return { message: "You match the cipher note to the terminal glyphs. The system powers on.", changed: true };
    }
    if (roomIndex === 4 && objectId === "finalDoor" && itemId === "obsidianKey" && this.state.flags.vaultCorePowered) {
      this.state.flags.gameWon = true;
      this.inventory.select(null);
      return { message: "The final lock yields. Congratulations on your escape!", changed: true, win: true };
    }

    return { message: "That doesn't work here." };
  }

  _roomStudy(objectId) {
    if (objectId === "doorLock") return { message: "This is locked. You must find the key or combination to open me." };
    if (objectId === "exitDoor") return this._handleExit(0);
    if (objectId === "note") {
      this.state.flags.studyNoteRead = true;
      if (!this.state.flags.studyNoteTaken) {
        this.inventory.add("cipherNote");
        this.state.flags.studyNoteTaken = true;
        return {
          message: "You examine the note. It lists cabinet code 1-8-9 and archive safe 4-7-2. You keep the cipher note.",
          inspect: {
            image: "assets/rooms/note-closeup.svg",
            text: "A worn notebook filled with hurried writing. One page lists cabinet code 1-8-9 and archive safe 4-7-2.",
          },
          changed: true,
        };
      }
      return {
        message: "Cipher note: cabinet 1-8-9, archive safe 4-7-2.",
        inspect: {
          image: "assets/rooms/note-closeup.svg",
          text: "Cipher note: cabinet 1-8-9, archive safe 4-7-2.",
        },
        changed: true,
      };
    }
    if (objectId === "cabinet") {
      if (this.state.flags.studyCabinetOpen) return { message: "The cabinet is open. A key rests inside." };
      this._openCombo("cabinet", "The cabinet is locked with a three-digit combination.");
      return { message: "The cabinet is locked with a three-digit combination." };
    }
    return { message: "Nothing interesting happens." };
  }

  _roomLibrary(objectId) {
    if (objectId === "backDoor") return this._handleBackDoor();
    if (objectId === "exitDoor") return this._handleExit(1);
    if (objectId === "painting") {
      this.state.flags.libraryHintKnown = true;
      return {
        message: "The painting hint reads: triangle, square, circle. A note below says chest code 3-3-3.",
        inspect: {
          image: "assets/rooms/painting-closeup.svg",
          text: "A crooked painting shows three highlighted corners: triangle, square, circle. A penciled note below reads 3-3-3.",
        },
        changed: true,
      };
    }
    if (objectId === "chest") {
      if (this.state.flags.libraryChestOpen) return { message: "The chest is open. A silver key lies inside." };
      this._openCombo("chest", "The chest waits for a three-digit code.");
      return { message: "The chest waits for a three-digit code." };
    }
    return { message: "Nothing interesting happens." };
  }

  _roomWorkshop(objectId) {
    if (objectId === "backDoor") return this._handleBackDoor();
    if (objectId === "exitDoor") return this._handleExit(2);
    if (objectId === "poster") {
      this.state.flags.workshopHintKnown = true;
      return {
        message: "The wiring diagram highlights breaker pattern 1-0-1.",
        inspect: {
          image: "assets/rooms/poster-closeup.svg",
          text: "A shop diagram marks three breakers in sequence: 1, 0, 1.",
        },
        changed: true,
      };
    }
    if (objectId === "panel") {
      if (this.state.flags.workshopPanelOpen) return { message: "The panel is open. An iron key hangs inside." };
      this._openCombo("panel", "The panel requires a three-digit sequence.");
      return { message: "The panel requires a three-digit sequence." };
    }
    return { message: "Nothing interesting happens." };
  }

  _roomArchive(objectId) {
    if (objectId === "backDoor") return this._handleBackDoor();
    if (objectId === "exitDoor") return this._handleExit(3);
    if (objectId === "safe") {
      if (this.state.flags.archiveSafeOpen) return { message: "The safe stands open. A gold key is inside." };
      this._openCombo("safe", "The safe requires a three-digit code.");
      return { message: "The safe requires a three-digit code." };
    }
    return { message: "Nothing interesting happens." };
  }

  _roomVault(objectId) {
    if (objectId === "backDoor") return this._handleBackDoor();
    if (!this.state.flags.vaultInnerOpen) {
      if (objectId === "innerHatch") return { message: "The inner hatch is sealed tight. Another key must fit it." };
      if (objectId === "briefcase") {
        if (!this.state.flags.vaultCaseOpen) return { message: "The briefcase is locked. Try a key from your inventory." };
        return { message: "The briefcase is open. An obsidian key is inside." };
      }
      return { message: "Nothing interesting happens." };
    }

    if (objectId === "terminal") {
      if (this.state.flags.vaultCorePowered) return { message: "Terminal status: READY. The exit lock is powered." };
      return { message: "The terminal shows scrambled glyphs. Maybe the cipher note belongs here." };
    }
    if (objectId === "finalDoor") {
      if (!this.state.flags.vaultCorePowered) return { message: "The final door is locked. Restore power at the terminal first." };
      return { message: "The final lock hums. A heavy key should finish the escape." };
    }
    return { message: "Nothing interesting happens." };
  }

  _handleExit(roomIndex) {
    if (this._isExitOpen(roomIndex)) {
      return this._moveToConnectedRoom(ROOMS[roomIndex].nextRoomIndex, "You move to the next room.");
    }
    return { message: "There is a lock on the door." };
  }

  _handleBackDoor() {
    const previousRoomIndex = ROOMS[this.state.roomIndex]?.previousRoomIndex;
    if (previousRoomIndex == null) return { message: "There is nowhere to return to from here." };
    if (this.state.maxRoomIndexReached < this.state.roomIndex) return { message: "You have not unlocked the path back yet." };
    this.state.roomIndex = previousRoomIndex;
    return { message: `You return to ${ROOMS[previousRoomIndex].title}.`, changed: true };
  }

  _moveToConnectedRoom(nextRoomIndex, message) {
    if (nextRoomIndex == null) return { message: "There is nowhere else to go.", changed: false };
    this.state.roomIndex = nextRoomIndex;
    this.state.maxRoomIndexReached = Math.max(this.state.maxRoomIndexReached, nextRoomIndex);
    return { message, changed: true };
  }

  _openCombo(objectId, failureMessage) {
    const config = COMBO_CONFIG[objectId];
    this.state.activeCombo = { objectId, ...config, failureMessage };
    this.state.comboInput = "";
  }

  _canUseItemOnObject(itemId, objectId) {
    const roomIndex = this.state.roomIndex;

    if (objectId === "exitDoor" && roomIndex <= 3) {
      const target =
        roomIndex === 0 ? "studyExit" : roomIndex === 1 ? "libraryExit" : roomIndex === 2 ? "workshopExit" : "archiveExit";
      const rule = EXIT_RULES[itemId];
      if (rule && rule.target === target) return { compatible: true, message: rule.message };
      return { compatible: false, message: "That key does not match this door." };
    }

    if (roomIndex === 4 && objectId === "briefcase") {
      return itemId === "goldKey"
        ? { compatible: true, message: "The gold key fits this case." }
        : { compatible: false, message: "This lock needs a heavier key." };
    }

    if (roomIndex === 4 && objectId === "innerHatch") {
      return itemId === "obsidianKey"
        ? { compatible: true, message: "The obsidian key fits the inner hatch." }
        : { compatible: false, message: "That item does not fit the hatch." };
    }

    if (roomIndex === 4 && objectId === "terminal" && this.state.flags.vaultInnerOpen) {
      return itemId === "cipherNote"
        ? { compatible: true, message: "The cipher note matches the terminal symbols. Click to use it." }
        : { compatible: false, message: "The terminal seems to want a clue, not that item." };
    }

    if (roomIndex === 4 && objectId === "finalDoor" && this.state.flags.vaultCorePowered) {
      return itemId === "obsidianKey"
        ? { compatible: true, message: "The obsidian key fits the final lock. Click to escape." }
        : { compatible: false, message: "That item will not open the final lock." };
    }

    return { compatible: false, message: "That doesn't work here." };
  }

  _defaultHoverText(objectId) {
    switch (objectId) {
      case "note":
        return "A worn notebook rests on the desk. Click to examine it.";
      case "cabinet":
        return "A locked cabinet stands against the wall.";
      case "doorLock":
        return "An iron lock bars the way out.";
      case "exitDoor":
        return "A heavy exit door waits at the edge of the room.";
      case "backDoor":
        return "A return path leads back to the previous room.";
      case "painting":
        return "A crooked painting might hide a clue.";
      case "chest":
        return "An old chest with a numeric lock.";
      case "poster":
        return "A workshop diagram is pinned to the wall.";
      case "panel":
        return "A breaker panel hums softly.";
      case "safe":
        return "A compact safe is tucked into the shelves.";
      case "briefcase":
        return "A reinforced case sits on the floor.";
      case "innerHatch":
        return "A second hatch blocks the vault core.";
      case "terminal":
        return "A dormant terminal waits for the right clue.";
      case "finalDoor":
        return "The last exit stands just beyond the core.";
      default:
        return ITEMS[objectId] ? `${ITEMS[objectId].name} is visible. Click to take it.` : "Click to interact.";
    }
  }

  _isExitOpen(roomIndex) {
    if (roomIndex === 0) return this.state.flags.studyExitOpen;
    if (roomIndex === 1) return this.state.flags.libraryExitOpen;
    if (roomIndex === 2) return this.state.flags.workshopExitOpen;
    return this.state.flags.archiveExitOpen;
  }

  _setExitOpen(roomIndex, open) {
    if (roomIndex === 0) this.state.flags.studyExitOpen = open;
    else if (roomIndex === 1) this.state.flags.libraryExitOpen = open;
    else if (roomIndex === 2) this.state.flags.workshopExitOpen = open;
    else this.state.flags.archiveExitOpen = open;
  }
}
