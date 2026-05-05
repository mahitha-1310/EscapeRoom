import { ITEMS, MAX_INVENTORY } from "../data/game-data.js";

export class InventorySystem {
  constructor(state) {
    this.state = state;
  }

  has(itemId) {
    return this.state.inventory.includes(itemId);
  }

  add(itemId) {
    if (this.has(itemId)) return true;
    if (this.state.inventory.length >= MAX_INVENTORY) return false;
    this.state.inventory.push(itemId);
    this.removeFromFloor(this.state.roomIndex, itemId);
    return true;
  }

  remove(itemId) {
    this.state.inventory = this.state.inventory.filter((id) => id !== itemId);
    if (this.state.selectedItemId === itemId) this.state.selectedItemId = null;
  }

  select(itemIdOrNull) {
    this.state.selectedItemId = itemIdOrNull;
  }

  addToFloor(roomIndex, itemId) {
    const floor = this.state.droppedByRoom[roomIndex] || [];
    if (!floor.includes(itemId)) floor.push(itemId);
    this.state.droppedByRoom[roomIndex] = floor;
  }

  removeFromFloor(roomIndex, itemId) {
    const floor = this.state.droppedByRoom[roomIndex] || [];
    this.state.droppedByRoom[roomIndex] = floor.filter((id) => id !== itemId);
  }

  onFloor(roomIndex, itemId) {
    return (this.state.droppedByRoom[roomIndex] || []).includes(itemId);
  }

  label(itemId) {
    return ITEMS[itemId]?.name || itemId;
  }
}
