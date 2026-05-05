import { EXIT_RULES } from "../data/game-data.js";

export class PuzzleSystem {
  constructor(state, inventory) {
    this.state = state;
    this.inventory = inventory;
  }

  clickObject(objectId) {
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
      return { message: "Deselect your item before picking things from the floor." };
    }
    if (!this.inventory.add(itemId)) {
      return { message: "Your inventory is full. Drop an item first." };
    }
    return { message: `You picked up the ${this.inventory.label(itemId).toLowerCase()}.`, changed: true };
  }

  dropSelected() {
    const selected = this.state.selectedItemId;
    if (!selected) return { message: "Select an item to drop it." };
    this.inventory.remove(selected);
    this.inventory.addToFloor(this.state.roomIndex, selected);
    return { message: `You dropped the ${this.inventory.label(selected).toLowerCase()}.`, changed: true };
  }

  _useSelectedItem(itemId, objectId) {
    const roomIndex = this.state.roomIndex;

    if (objectId === "exitDoor" && roomIndex <= 3) {
      const target =
        roomIndex === 0 ? "studyExit" : roomIndex === 1 ? "libraryExit" : roomIndex === 2 ? "workshopExit" : "archiveExit";
      const rule = EXIT_RULES[itemId];
      if (rule && rule.target === target) {
        this._setExitOpen(roomIndex, true);
        this.inventory.select(null);
        this.state.roomIndex += 1;
        return { message: `${rule.message} You move to the next room.`, changed: true };
      }
      return { message: "That key does not match this lock." };
    }

    if (roomIndex === 4 && objectId === "briefcase" && itemId === "goldKey") {
      this.state.flags.vaultCaseOpen = true;
      this.inventory.select(null);
      return { message: "The gold key opens the case.", changed: true };
    }
    if (roomIndex === 4 && objectId === "innerHatch" && itemId === "obsidianKey") {
      this.state.flags.vaultInnerOpen = true;
      this.inventory.select(null);
      return { message: "The inner hatch unlocks and slides away.", changed: true };
    }
    if (roomIndex === 4 && objectId === "terminal" && itemId === "obsidianKey" && this.state.flags.vaultInnerOpen) {
      this.state.flags.vaultCorePowered = true;
      this.inventory.select(null);
      return { message: "The terminal powers on.", changed: true };
    }
    if (roomIndex === 4 && objectId === "finalDoor" && itemId === "cipherNote" && this.state.flags.vaultCorePowered) {
      this.state.flags.gameWon = true;
      this.inventory.select(null);
      return { message: "Congratulations on your escape!", changed: true, win: true };
    }

    return { message: "That doesn't work here." };
  }

  _roomStudy(objectId) {
    if (objectId === "doorLock") return { message: "This is locked. You must find the key or combination to open me." };
    if (objectId === "exitDoor") return this._handleExit(0);
    if (objectId === "note") {
      if (!this.state.flags.studyNoteRead) {
        this.state.flags.studyNoteRead = true;
        this.state.flags.studyNoteTaken = this.inventory.add("cipherNote");
        return {
          message: "You examine the note. It mentions numbers 1-8-9 and archive code 4-7-2. You keep the cipher note.",
          changed: true,
        };
      }
      return { message: "Your cipher note reads: cabinet 1-8-9, archive safe 4-7-2." };
    }
    if (objectId === "cabinet") {
      if (!this.state.flags.studyCabinetOpen) {
        const code = window.prompt("Cabinet code (3 digits):", "");
        if (code === "189") {
          this.state.flags.studyCabinetOpen = true;
          this.state.flags.studyCodeKnown = true;
          return { message: "Cabinet unlocked. You find a brass key.", changed: true };
        }
        return { message: "Wrong cabinet code." };
      }
      if (!this.inventory.has("brassKey") && !this.inventory.onFloor(0, "brassKey")) {
        this.inventory.add("brassKey");
        return { message: "You picked up a brass key.", changed: true };
      }
      return { message: "The cabinet is empty." };
    }
    return { message: "Nothing interesting happens." };
  }

  _roomLibrary(objectId) {
    if (objectId === "exitDoor") return this._handleExit(1);
    if (objectId === "painting") {
      this.state.flags.libraryHintKnown = true;
      return { message: "The painting hint says: use code 3-3-3 for the chest.", changed: true };
    }
    if (objectId === "chest") {
      if (!this.state.flags.libraryChestOpen) {
        const code = window.prompt("Chest code (3 digits):", "");
        if (code === "333") {
          this.state.flags.libraryChestOpen = true;
          return { message: "Chest unlocked. A silver key is inside.", changed: true };
        }
        return { message: "Wrong chest code." };
      }
      if (!this.inventory.has("silverKey") && !this.inventory.onFloor(1, "silverKey")) {
        this.inventory.add("silverKey");
        return { message: "You picked up a silver key.", changed: true };
      }
      return { message: "The chest is empty." };
    }
    return { message: "Nothing interesting happens." };
  }

  _roomWorkshop(objectId) {
    if (objectId === "exitDoor") return this._handleExit(2);
    if (objectId === "poster") {
      this.state.flags.workshopHintKnown = true;
      return { message: "The diagram shows breaker code 1-0-1.", changed: true };
    }
    if (objectId === "panel") {
      if (!this.state.flags.workshopPanelOpen) {
        const code = window.prompt("Panel code (3 digits):", "");
        if (code === "101") {
          this.state.flags.workshopPanelOpen = true;
          return { message: "Panel opens. You see an iron key.", changed: true };
        }
        return { message: "Wrong panel code." };
      }
      if (!this.inventory.has("ironKey") && !this.inventory.onFloor(2, "ironKey")) {
        this.inventory.add("ironKey");
        return { message: "You picked up an iron key.", changed: true };
      }
      return { message: "The panel is empty." };
    }
    return { message: "Nothing interesting happens." };
  }

  _roomArchive(objectId) {
    if (objectId === "exitDoor") return this._handleExit(3);
    if (objectId === "safe") {
      if (!this.state.flags.archiveSafeOpen) {
        const code = window.prompt("Safe code (3 digits):", "");
        if (code === "472") {
          this.state.flags.archiveSafeOpen = true;
          return { message: "Safe unlocked. A gold key is inside.", changed: true };
        }
        return { message: "Wrong safe code." };
      }
      if (!this.inventory.has("goldKey") && !this.inventory.onFloor(3, "goldKey")) {
        this.inventory.add("goldKey");
        return { message: "You picked up a gold key.", changed: true };
      }
      return { message: "The safe is empty." };
    }
    return { message: "Nothing interesting happens." };
  }

  _roomVault(objectId) {
    if (!this.state.flags.vaultInnerOpen) {
      if (objectId === "innerHatch") return { message: "The inner hatch is locked. Maybe another key fits." };
      if (objectId === "briefcase") {
        if (!this.state.flags.vaultCaseOpen) return { message: "The case is locked. Try a key from inventory." };
        if (!this.inventory.has("obsidianKey") && !this.inventory.onFloor(4, "obsidianKey")) {
          this.inventory.add("obsidianKey");
          return { message: "You picked up an obsidian key.", changed: true };
        }
        return { message: "The case is empty." };
      }
      return { message: "Nothing interesting happens." };
    }

    if (objectId === "terminal") {
      if (this.state.flags.vaultCorePowered) return { message: "Terminal status: READY." };
      return { message: "The terminal needs the obsidian key." };
    }
    if (objectId === "finalDoor") {
      if (!this.state.flags.vaultCorePowered) return { message: "Door is locked. Power the terminal first." };
      return { message: "Use your cipher note on this door." };
    }
    return { message: "Nothing interesting happens." };
  }

  _handleExit(roomIndex) {
    if (this._isExitOpen(roomIndex)) {
      this.state.roomIndex += 1;
      return { message: "You move to the next room.", changed: true };
    }
    return { message: "There is a lock on the door." };
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
