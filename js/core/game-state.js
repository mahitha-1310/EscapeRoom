export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.roomIndex = 0;
    this.maxRoomIndexReached = 0;
    this.selectedItemId = null;
    this.activeCombo = null;
    this.comboInput = "";
    this.inventory = [];
    this.droppedByRoom = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    this.flags = {
      studyNoteRead: false,
      studyCodeKnown: false,
      studyNoteTaken: false,
      studyCabinetOpen: false,
      studyExitOpen: false,

      libraryHintKnown: false,
      libraryChestOpen: false,
      libraryExitOpen: false,

      workshopHintKnown: false,
      workshopPanelOpen: false,
      workshopExitOpen: false,

      archiveSafeOpen: false,
      archiveExitOpen: false,

      vaultCaseOpen: false,
      vaultInnerOpen: false,
      vaultCorePowered: false,
      gameWon: false,
    };
  }
}
