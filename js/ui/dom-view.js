import { BACKGROUNDS, ITEMS, ROOMS } from "../data/game-data.js";

export class DomView {
  constructor(doc) {
    this.doc = doc;
    this.roomBg = doc.getElementById("room-bg");
    this.roomLabel = doc.getElementById("room-label");
    this.hotspots = doc.getElementById("hotspots");
    this.messagePanel = doc.getElementById("message-panel");
    this.inventorySlots = doc.getElementById("inventory-slots");
    this.inventoryCount = doc.getElementById("inventory-count");
    this.winOverlay = doc.getElementById("overlay-win");
  }

  setMessage(text) {
    this.messagePanel.textContent = text;
  }

  setUseCursor(on) {
    this.doc.body.classList.toggle("cursor-use", on);
  }

  renderRoom(state, onObjectClick, onFloorItemClick) {
    const room = ROOMS[state.roomIndex];
    const isVaultCore = state.roomIndex === 4 && state.flags.vaultInnerOpen;
    const bgIndex = isVaultCore ? 5 : state.roomIndex;
    this.roomBg.style.backgroundImage = `url("${BACKGROUNDS[bgIndex]}")`;
    this.roomLabel.textContent = isVaultCore ? "V — Vault Core" : room.title;

    const activeHotspots = isVaultCore ? room.coreHotspots : room.hotspots;
    this.hotspots.innerHTML = "";

    activeHotspots.forEach((spot) => {
      this.hotspots.appendChild(this._createHotspot(spot, () => onObjectClick(spot.id)));
    });

    const floor = state.droppedByRoom[state.roomIndex] || [];
    floor.forEach((itemId, index) => {
      const item = ITEMS[itemId];
      if (!item) return;
      const floorSpot = {
        id: itemId,
        label: item.name,
        l: 28 + (index % 4) * 12,
        t: 78,
        w: 10,
        h: 12,
      };
      this.hotspots.appendChild(this._createHotspot(floorSpot, () => onFloorItemClick(itemId)));
    });
  }

  renderInventory(state, onSelect) {
    this.inventorySlots.innerHTML = "";
    this.inventoryCount.textContent = `${state.inventory.length} / 8`;

    state.inventory.forEach((itemId) => {
      const item = ITEMS[itemId];
      const btn = this.doc.createElement("button");
      btn.type = "button";
      btn.className = `inv-slot${state.selectedItemId === itemId ? " selected" : ""}`;
      btn.innerHTML = `<span class="icon">${item.icon}</span><span class="name">${item.name}</span>`;
      btn.addEventListener("click", () => {
        const next = state.selectedItemId === itemId ? null : itemId;
        onSelect(next);
      });
      this.inventorySlots.appendChild(btn);
    });
  }

  showWin() {
    this.winOverlay.classList.remove("hidden");
  }

  hideWin() {
    this.winOverlay.classList.add("hidden");
  }

  _createHotspot(spot, onClick) {
    const button = this.doc.createElement("button");
    button.type = "button";
    button.className = "hotspot";
    button.style.left = `${spot.l}%`;
    button.style.top = `${spot.t}%`;
    button.style.width = `${spot.w}%`;
    button.style.height = `${spot.h}%`;
    button.addEventListener("click", onClick);

    const label = this.doc.createElement("span");
    label.className = "hotspot-label";
    label.textContent = spot.label;
    button.appendChild(label);

    return button;
  }
}
