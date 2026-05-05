import { ITEMS, ROOM_THEMES, ROOMS } from "../data/game-data.js";

export class DomView {
  constructor(doc) {
    this.doc = doc;
    this.roomBg = doc.getElementById("room-bg");
    this.roomArt = doc.getElementById("room-art");
    this.roomLabel = doc.getElementById("room-label");
    this.hotspots = doc.getElementById("hotspots");
    this.messagePanel = doc.getElementById("message-panel");
    this.inventorySlots = doc.getElementById("inventory-slots");
    this.inventoryCount = doc.getElementById("inventory-count");
    this.winOverlay = doc.getElementById("overlay-win");
    this.zoomOverlay = doc.getElementById("overlay-zoom");
    this.zoomMedia = doc.getElementById("zoom-media");
    this.zoomText = doc.getElementById("zoom-text");
    this.comboOverlay = doc.getElementById("overlay-combo");
    this.comboTitle = doc.getElementById("combo-title");
    this.comboDisplay = doc.getElementById("combo-display");
    this.comboPad = doc.getElementById("combo-pad");
    this.lastMessage = "";
  }

  setMessage(text) {
    this.lastMessage = text;
    this.messagePanel.textContent = text;
  }

  previewMessage(text) {
    this.messagePanel.textContent = text;
  }

  restoreMessage() {
    this.messagePanel.textContent = this.lastMessage;
  }

  setUseCursor(on) {
    this.doc.body.classList.toggle("cursor-use", on);
  }

  renderRoom(state, onObjectClick, onFloorItemClick, onHover, getSpotState) {
    const room = ROOMS[state.roomIndex];
    const isVaultCore = state.roomIndex === 4 && state.flags.vaultInnerOpen;
    const bgIndex = isVaultCore ? 5 : state.roomIndex;
    const theme = ROOM_THEMES[bgIndex];
    this.roomBg.style.background = theme.background;
    this.roomArt.src = this._getRoomImage(state, theme);
    this.roomArt.alt = theme.aria;
    this.roomBg.setAttribute("aria-label", theme.aria);
    this.roomLabel.textContent = isVaultCore ? "V — Vault Core" : room.title;

    const activeHotspots = isVaultCore ? room.coreHotspots : room.hotspots;
    this.hotspots.innerHTML = "";

    activeHotspots.forEach((spot) => {
      const spotState = getSpotState?.(spot.id) || {};
      this.hotspots.appendChild(this._createHotspot({ ...spot, ...spotState }, () => onObjectClick(spot.id), onHover));
    });

    this._getVisibleRoomItems(state).forEach((spot) => {
      this.hotspots.appendChild(this._createHotspot(spot, () => onFloorItemClick(spot.id), onHover, true));
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
      this.hotspots.appendChild(this._createHotspot(floorSpot, () => onFloorItemClick(itemId), onHover, true));
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

  showZoom({ image, text }) {
    this.zoomMedia.innerHTML = image ? `<img src="${image}" alt="">` : "";
    this.zoomText.textContent = text;
    this.zoomOverlay.classList.remove("hidden");
  }

  hideZoom() {
    this.zoomOverlay.classList.add("hidden");
  }

  renderCombo(state, handlers) {
    const combo = state.activeCombo;
    if (!combo) {
      this.comboOverlay.classList.add("hidden");
      return;
    }

    this.comboOverlay.classList.remove("hidden");
    this.comboTitle.textContent = combo.title;
    this.comboDisplay.textContent = state.comboInput
      .padEnd(combo.length, "—")
      .split("")
      .join(" ");

    if (!this.comboPad.childElementCount) {
      for (let digit = 1; digit <= 9; digit += 1) {
        const button = this.doc.createElement("button");
        button.type = "button";
        button.textContent = String(digit);
        button.addEventListener("click", () => handlers.appendDigit(String(digit)));
        this.comboPad.appendChild(button);
      }

      const zeroButton = this.doc.createElement("button");
      zeroButton.type = "button";
      zeroButton.textContent = "0";
      zeroButton.addEventListener("click", () => handlers.appendDigit("0"));
      this.comboPad.appendChild(this.doc.createElement("span"));
      this.comboPad.appendChild(zeroButton);
      this.comboPad.appendChild(this.doc.createElement("span"));
    }
  }

  _createHotspot(spot, onClick, onHover, isItem = false) {
    const button = this.doc.createElement("button");
    button.type = "button";
    button.className = `hotspot${isItem ? " hotspot-item" : ""}${spot.compatible ? " compatible" : ""}`;
    button.style.left = `${spot.l}%`;
    button.style.top = `${spot.t}%`;
    button.style.width = `${spot.w}%`;
    button.style.height = `${spot.h}%`;
    button.addEventListener("click", onClick);
    button.addEventListener("mouseenter", () => onHover?.(spot.id));
    button.addEventListener("mouseleave", () => this.restoreMessage());

    const label = this.doc.createElement("span");
    label.className = "hotspot-label";
    label.textContent = spot.label;
    button.appendChild(label);

    return button;
  }

  _getVisibleRoomItems(state) {
    const visible = [];
    const hasItem = (itemId) => state.inventory.includes(itemId) || (state.droppedByRoom[state.roomIndex] || []).includes(itemId);

    if (state.roomIndex === 0 && state.flags.studyCabinetOpen && !hasItem("brassKey")) {
      visible.push({ id: "brassKey", label: "Brass Key", l: 66, t: 55, w: 10, h: 12 });
    }
    if (state.roomIndex === 1 && state.flags.libraryChestOpen && !hasItem("silverKey")) {
      visible.push({ id: "silverKey", label: "Silver Key", l: 30, t: 67, w: 10, h: 12 });
    }
    if (state.roomIndex === 2 && state.flags.workshopPanelOpen && !hasItem("ironKey")) {
      visible.push({ id: "ironKey", label: "Iron Key", l: 22, t: 47, w: 10, h: 12 });
    }
    if (state.roomIndex === 3 && state.flags.archiveSafeOpen && !hasItem("goldKey")) {
      visible.push({ id: "goldKey", label: "Gold Key", l: 77, t: 60, w: 10, h: 12 });
    }
    if (state.roomIndex === 4 && state.flags.vaultCaseOpen && !hasItem("obsidianKey") && !state.flags.vaultInnerOpen) {
      visible.push({ id: "obsidianKey", label: "Obsidian Key", l: 47, t: 60, w: 10, h: 12 });
    }

    return visible;
  }

  _getRoomImage(state, theme) {
    if (state.roomIndex === 0 && state.flags.studyCabinetOpen && theme.imageOpen) return theme.imageOpen;
    if (state.roomIndex === 1 && state.flags.libraryChestOpen && theme.imageOpen) return theme.imageOpen;
    if (state.roomIndex === 2 && state.flags.workshopPanelOpen && theme.imageOpen) return theme.imageOpen;
    if (state.roomIndex === 3 && state.flags.archiveSafeOpen && theme.imageOpen) return theme.imageOpen;
    if (state.roomIndex === 4 && state.flags.vaultCaseOpen && !state.flags.vaultInnerOpen && theme.imageOpen) return theme.imageOpen;
    return theme.image;
  }
}
