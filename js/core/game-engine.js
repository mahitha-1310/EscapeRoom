import { ROOMS } from "../data/game-data.js";
import { GameState } from "./game-state.js";
import { InventorySystem } from "../systems/inventory-system.js";
import { PuzzleSystem } from "../systems/puzzle-system.js";
import { DomView } from "../ui/dom-view.js";

export class GameEngine {
  constructor(doc = document) {
    this.state = new GameState();
    this.inventory = new InventorySystem(this.state);
    this.puzzles = new PuzzleSystem(this.state, this.inventory);
    this.view = new DomView(doc);
    this.doc = doc;
  }

  start() {
    this._bindEvents();
    this.view.setMessage(ROOMS[0].message);
    this._render();
  }

  _bindEvents() {
    this.doc.getElementById("drop-floor").addEventListener("click", () => {
      const result = this.puzzles.dropSelected();
      this.view.setMessage(result.message);
      this._render();
    });

    this.doc.getElementById("btn-restart").addEventListener("click", () => {
      this.state.reset();
      this.view.hideWin();
      this.view.setMessage("Game reset. You are back in the study.");
      this._render();
    });
  }

  _render() {
    this.view.renderRoom(
      this.state,
      (objectId) => this._onObjectClick(objectId),
      (itemId) => this._onFloorItemClick(itemId)
    );
    this.view.renderInventory(this.state, (selectedId) => this._onInventorySelect(selectedId));
    this.view.setUseCursor(Boolean(this.state.selectedItemId));
  }

  _onInventorySelect(selectedId) {
    const previous = this.state.selectedItemId;
    this.inventory.select(selectedId);
    if (selectedId) {
      this.view.setMessage(`${this.inventory.label(selectedId)} selected.`);
    } else if (previous === "cipherNote") {
      this.view.setMessage("Cipher note: cabinet 1-8-9, archive safe 4-7-2.");
    }
    this._render();
  }

  _onObjectClick(objectId) {
    const result = this.puzzles.clickObject(objectId);
    this.view.setMessage(result.message);
    this._render();
    if (result.win) this.view.showWin();
  }

  _onFloorItemClick(itemId) {
    const result = this.puzzles.pickFloorItem(itemId);
    this.view.setMessage(result.message);
    this._render();
  }
}
