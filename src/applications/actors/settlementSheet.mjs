import { findLargestSmallerNumber, keepUpdateArray, renameKeys } from "../../util/utils.mjs";

const GRID_COLS = 6;
const GRID_ROWS = 6;

export class SettlementSheet extends pf1.applications.actor.ActorSheetPF {
  // data for building grid drag/drop
  _dragDropData = null;

  constructor(actor, options) {
    options.tabs = [
      {
        navSelector: "nav.tabs[data-group='primary']",
        contentSelector: "section.primary-body",
        initial: "summary",
        group: "primary",
      },
      {
        navSelector: "nav.tabs[data-group='districts']",
        contentSelector: "section.districts-body",
        initial: "0",
        group: "districts",
      },
    ];

    super(actor, options);
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "pf1ks", "settlement"],
      scrollY: [...options.scrollY, ".subdetails-body"],
      dragDrop: [
        ...options.dragDrop,
        { dragSelector: ".building[data-item-id]", dropSelector: ".district .grid .cell" },
      ],
      height: 940, // TODO this needed?
    };
  }

  get template() {
    return `modules/${pf1ks.config.moduleId}/templates/actors/settlement/${this.isEditable ? "edit" : "view"}.hbs`;
  }

  async getData() {
    const actor = this.actor;
    const actorData = actor.system;
    const isOwner = actor.isOwner;

    const data = {
      ...this.actor,
      owner: isOwner,
      enrichedNotes: await TextEditor.enrichHTML(actorData.notes.value ?? "", {
        rolldata: actor.getRollData(),
        async: true,
        secrets: this.object.isOwner,
        relativeTo: this.actor,
      }),
      editable: this.isEditable,
      cssClass: isOwner ? "editable" : "locked",
    };

    // selectors
    data.governmentOptions = pf1ks.config.settlementGovernments;
    data.districtBorderOptions = pf1ks.config.districtBorders;

    data.sections = this._prepareItems();

    const settlements = this.actor.system.settlements;
    const districts = this.actor.system.settlements.flatMap((settlement) => settlement.districts);
    data.unassignedBuildings = this.actor.itemTypes[pf1ks.config.buildingId]
      .filter((building) => !building.isAssigned)
      .map((building) => ({
        id: building.id,
        img: building.img,
        name: building.name,
        settlementName: settlements.find((s) => s.id === building.system.settlementId)?.name,
        districtName: districts.find((d) => d.id === building.system.districtId)?.name,
      }));
    data.unassignedFeatures = this.actor.itemTypes[pf1ks.config.featureId]
      .filter((feature) => !feature.isAssigned)
      .map((feature) => ({
        id: feature.id,
        img: feature.img,
        name: feature.name,
      }));

    // optional rules
    data.settings = this._prepareSettings();
    data.optionalRules = this._prepareOptionalRules();

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".item-toggle-data").on("click", (e) => this._itemToggleData(e));

    html.find(".district-create").on("click", (e) => this._onDistrictCreate(e));
    html.find(".district-delete").on("click", (e) => this._onDistrictDelete(e));

    html.find(".magic-item-delete").on("click", (e) => this._onMagicItemDelete(e));

    html.find(".building").on("dblclick", (e) => this._onBuildingEdit(e));
    html.find(".building").on("contextmenu", (e) => this._onBuildingContextMenu(e));
    html.find(".building").on("pointerenter", (e) => this._onShowBuildingTooltip(e));
    html.find(".building").on("pointerleave", (e) => game.tooltip.deactivate());
  }

  async _onBuildingContextMenu(event) {
    const el = event.currentTarget;

    const buildingId = el.dataset.itemId;
    if (!buildingId) {
      return;
    }

    const content = document.createElement("div");
    content.innerHTML = await renderTemplate(
      `modules/${pf1ks.config.moduleId}/templates/actors/kingdom/parts/building-tooltip.hbs`,
      {
        buildingId,
      }
    );

    content.querySelector(".delete").addEventListener("click", (ev) => this._onBuildingDelete(ev, true));
    content.querySelector(".edit").addEventListener("click", (ev) => this._onBuildingEdit(ev, true));

    if (!document.querySelector(`.locked-tooltip.pf1ks.building-${buildingId}`)) {
      await game.tooltip.activate(el, {
        content,
        locked: true,
        direction: TooltipManager.TOOLTIP_DIRECTIONS.CENTER,
        cssClass: "pf1 change-menu pf1ks building-" + buildingId,
      });
    }
  }

  async _onShowBuildingTooltip(event) {
    const el = event.currentTarget;
    const buildingId = el.dataset.itemId;

    if (!buildingId) {
      return;
    }
    const building = this.actor.items.get(buildingId);
    const content = document.createElement("span");
    content.textContent = `${building.name} (${pf1ks.config.buildingTypes[building.system.type].name})`;

    game.tooltip.activate(el, {
      content,
      cssClass: "pf1",
    });
  }

  async _onBuildingDelete(event, tooltip = false) {
    event.preventDefault();
    const el = event.currentTarget;
    const buildingId = el.dataset.itemId;
    const building = this.actor.items.get(buildingId);

    if (building) {
      if (tooltip) {
        game.tooltip.dismissLockedTooltip(el.closest(".locked-tooltip"));
      }

      await this._onDelete({
        button: el,
        title: game.i18n.format("PF1.DeleteItemTitle", { name: building.name }),
        content: `<p>${game.i18n.localize("PF1.DeleteItemConfirmation")}</p>`,
        onDelete: async () => await building.delete(),
      });
    }
  }

  _onBuildingEdit(event, tooltip = false) {
    event.preventDefault();
    const el = event.currentTarget;
    const buildingId = el.dataset.itemId;
    const building = this.actor.items.get(buildingId);

    if (building) {
      if (tooltip) {
        game.tooltip.dismissLockedTooltip(el.closest(".locked-tooltip"));
      }
      building.sheet.render(true, { focus: true });
    }
  }

  _prepareItems() {
    const featureSections = Object.values(pf1.config.sheetSections.settlementFeature).map((data) => ({ ...data }));
    this.actor.itemTypes[pf1ks.config.featureId]
      .map((i) => i)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .forEach((i) => {
        const section = featureSections.find((section) => this._applySectionFilter(i, section));
        if (section) {
          section.items ??= [];
          section.items.push({ ...i, id: i.id });
        }
      });

    const categories = [{ key: "features", sections: featureSections }];
    for (const { key, sections } of categories) {
      const set = this._filters.sections[key];
      for (const section of sections) {
        if (!section) {
          continue;
        }
        section._hidden = set?.size > 0 && !set.has(section.id);
      }
    }

    const settlementSections = this.actor.system.settlements.map((settlement) => {
      const settlementBuildings = this.actor.itemTypes[pf1ks.config.buildingId].filter(
        (building) => building.system.settlementId === settlement.id
      );

      return {
        ...settlement,
        modifiers: Object.entries(settlement.modifiers).map(([key, value]) => {
          return {
            id: key,
            label: pf1ks.config.settlementModifiers[key],
            value: value.total,
          };
        }),
        sizeLabel: pf1ks.config.settlementSizes[settlement.attributes.size],
        districts: settlement.districts.map((district) => {
          const grid = Array.from({ length: GRID_ROWS * GRID_COLS }, (_, i) => ({
            x: i % GRID_COLS,
            y: Math.floor(i / GRID_ROWS),
          }));

          const [buildings, lotlessBuildings] = settlementBuildings.reduce(
            (arr, building) => {
              if (building.system.districtId !== district.id) {
                return arr;
              }
              if (building.inGrid) {
                arr[0].push(building);
              } else {
                arr[1].push(building);
              }
              return arr;
            },
            [[], []]
          );

          return {
            id: district.id,
            name: district.name,
            borders: district.borders,
            grid,
            section: { ...pf1.config.sheetSections.kingdomSettlement.building },
            buildings: buildings.map((building) => ({
              id: building.id,
              img: building.img,
              width: building.system.width,
              height: building.system.height,
              x: building.system.x,
              y: building.system.y,
            })),
            lotlessBuildings: lotlessBuildings.map((building) => ({
              id: building.id,
              img: building.img,
              name: building.name,
              error: building.error,
            })),
          };
        }),
        features: featureSections.map((section) => ({
          ...section,
          items: section.items?.filter((item) => item.system.settlementId === settlement.id),
        })),
        magicItems: Object.entries(pf1ks.config.magicItemTypes).map(([key, label]) => {
          const items = settlement.magicItems[key];
          const max = this.actor._getChanges(key, undefined, settlement.id);

          return {
            key,
            label,
            count: items.length,
            error: items.length > max ? game.i18n.format("PF1KS.TooManyMagicItems", { max }) : undefined,
            items,
          };
        }),
      };
    });

    return { settlements: settlementSections };
  }

  _prepareSettings() {
    return Object.entries(this.actor.system.settings)
      .filter(([_, value]) => typeof value === "boolean")
      .map(([key, value]) => ({
        name: key,
        value,
        label: pf1ks.config.settings[key],
      }));
  }

  _prepareOptionalRules() {
    return Object.entries(this.actor.system.settings.optionalRules).map(([key, value]) => ({
      name: key,
      value,
      label: pf1ks.config.optionalRules[key],
      compendiumEntry: pf1ks.config.compendiumEntries[key],
    }));
  }

  async _itemToggleData(event) {
    event.preventDefault();
    const el = event.currentTarget;

    const itemId = el.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    const property = el.dataset.name;

    const updateData = { system: {} };
    foundry.utils.setProperty(updateData.system, property, !foundry.utils.getProperty(item.system, property));

    item.update(updateData);
  }

  async _onDistrictCreate(event) {
    event.preventDefault();

    const settlementId = event.currentTarget.closest(".settlement").dataset.id;
    const settlements = foundry.utils.duplicate(this.actor.system.settlements ?? []);
    const settlementIdx = settlements.findIndex((settlement) => settlement.id === settlementId);
    const newIdx = settlements[settlementIdx].districts.length;
    settlements[settlementIdx].districts.push({
      name: game.i18n.format("PF1KS.NewDistrictLabel", { number: newIdx + 1 }),
      id: foundry.utils.randomID(),
    });

    await this._onSubmit(event, {
      updateData: { "system.settlements": settlements },
    });

    this.activateTab(`${newIdx}`, { group: `settlement-${settlementIdx}-districts` });
  }

  async _onDistrictDelete(event) {
    event.preventDefault();
    this.form.disabled = true;

    const settlementId = event.currentTarget.closest(".settlement").dataset.id;
    const districtId = event.currentTarget.dataset.id;
    const settlements = foundry.utils.duplicate(this.actor.system.settlements ?? []);
    const settlement = settlements.find((settlement) => settlement.id === settlementId);
    const deletedDistrict = settlement.districts.findSplice((district) => district.id === districtId);

    const response = await this._onDelete({
      button: event.currentTarget,
      title: game.i18n.format("PF1KS.DeleteDistrictTitle", { name: deletedDistrict.name }),
      content: `<p>${game.i18n.localize("PF1KS.DeleteDistrictConfirmation")}</p>`,
      onDelete: () =>
        this._onSubmit(event, {
          updateData: { "system.settlements": settlements },
        }),
    });

    if (response) {
      const itemIdsToDelete = this.actor.itemTypes[pf1ks.config.buildingId]
        .filter((item) => item.system.districtId === districtId)
        .map((item) => item._id);

      await this.actor.deleteEmbeddedDocuments("Item", itemIdsToDelete);
    }
  }

  async _onMagicItemDelete(event) {
    event.preventDefault();

    const settlementId = event.currentTarget.closest(".settlement").dataset.id;
    const itemType = event.currentTarget.closest(".magic-item-container").dataset.type;
    const itemId = event.currentTarget.closest(".magic-item").dataset.itemId;

    const settlements = foundry.utils.duplicate(this.actor.system.settlements ?? []);
    const settlement = settlements.find((settlement) => settlement.id === settlementId);
    const deletedItem = settlement.magicItems[itemType].splice(itemId, 1)[0];

    await this._onDelete({
      button: event.currentTarget,
      title: game.i18n.format("PF1.DeleteItemTitle", { name: deletedItem }),
      content: `<p>${game.i18n.localize("PF1.DeleteItemConfirmation")}</p>`,
      onDelete: () =>
        this._onSubmit(event, {
          updateData: { "system.settlements": settlements },
        }),
    });
  }

  async _onDelete({ button, title, content, onDelete }) {
    if (button.disabled) {
      return;
    }
    button.disabled = true;

    const confirm = await foundry.applications.api.DialogV2.confirm({
      window: { title, icon: "fa-solid fa-trash" },
      classes: ["pf1-v2", "delete-item", "pf1ks"],
      content,
      rejectClose: false,
      modal: true, // Require dialog to be resolved
    });

    if (confirm) {
      onDelete();
    }

    button.disabled = false;
  }

  // overrides
  // this function is almost identical to the system function on actor-sheet.mjs, except it allows
  // the districtId of buildings to be pre-populated
  _onItemCreate(event) {
    event.preventDefault();
    const el = event.currentTarget;

    const [categoryId, sectionId] = el.dataset.create?.split(".") ?? [];
    const createData = foundry.utils.deepClone(pf1.config.sheetSections[categoryId]?.[sectionId]?.create);
    if (!createData) {
      throw new Error(`No creation data found for "${categoryId}.${sectionId}"`);
    }
    const type = createData.type || el.dataset.type;
    const subType = createData.system?.subType;

    // This is the part I had to add
    const districtId = el.dataset.districtId;
    if (districtId) {
      createData.system ??= {};
      createData.system.districtId = districtId;
    }
    // End of added stuff

    createData.name = Item.implementation.defaultName({ type, subType, parent: this.actor });
    const newItem = new Item.implementation(createData);

    this._sortNewItem(newItem);

    // Get old items of same general category
    const oldItems = this.actor.itemTypes[type]
      .filter((oldItem) => pf1.utils.isItemSameSubGroup(newItem, oldItem))
      .sort((a, b) => b.sort - a.sort);

    if (oldItems.length) {
      // Ensure no duplicate names occur
      const baseName = newItem.name;
      let newName = baseName;
      let i = 2;
      const names = new Set(oldItems.map((i) => i.name));
      while (names.has(newName)) {
        newName = `${baseName} (${i++})`;
      }

      if (newName !== newItem.name) {
        newItem.updateSource({ name: newName });
      }
    }

    return Item.implementation.create(newItem.toObject(), { parent: this.actor, renderSheet: true });
  }

  async _updateObject(event, formData) {
    const changed = foundry.utils.expandObject(formData);

    if (changed.system) {
      const keepPaths = ["system.districts"];

      const itemData = this.actor.toObject();
      for (const path of keepPaths) {
        keepUpdateArray(itemData, changed, path);
      }
    }

    return super._updateObject(event, changed);
  }

  _createDragDropData(event, building) {
    const district = event.target.closest(".district");
    const districtId = district.dataset.id;

    return {
      isBuilding: building.type === pf1ks.config.buildingId,
      id: building.id,
      width: building.system.width,
      height: building.system.height,
      lotSize: building.system.lotSize,
      districtId,
      occupiedCells: this._computeOccupiedCells(districtId, building.id),
    };
  }

  _computeOccupiedCells(districtId, excludeId) {
    const occupied = new Set();
    this.actor.itemTypes[pf1ks.config.buildingId]
      .filter((b) => b.system.districtId === districtId && b.id !== excludeId)
      .forEach((b) => {
        for (let x = b.system.x; x < b.system.x + b.system.width; x++) {
          for (let y = b.system.y; y < b.system.y + b.system.height; y++) {
            occupied.add(`${x},${y}`);
          }
        }
      });
    return occupied;
  }

  async _onDragOver(e) {
    await super._onDragOver(e);

    // not dragging over a district grid, so no highlighting needed
    const districtGridContainer = e.target.closest(".grid-container");
    if (!districtGridContainer) {
      const district = e.target.closest(".district");
      if (district) {
        const grid = district.querySelector(".grid");
        grid.querySelectorAll(".cell").forEach((cell) => {
          cell.style.backgroundColor = "unset";
          cell.style.zIndex = "unset";
        });
      }
      return;
    }

    // drag/drop data hasnt be initialized yet or
    // the existing dragDropData is for a different building, initialize it
    if (!this._dragDropData || pf1ks._temp.dragDrop?.id !== this._dragDropData?.id) {
      const building = await Item.implementation.fromDropData(pf1ks._temp.dragDrop);
      this._dragDropData = this._createDragDropData(e, building);
    }

    // not dragging a building, so no highlighting needed
    if (!this._dragDropData.isBuilding) {
      return;
    }

    // clear highlights
    const grid = districtGridContainer.querySelector(".grid");
    grid.querySelectorAll(".cell").forEach((cell) => {
      cell.style.backgroundColor = "unset";
      cell.style.zIndex = "unset";
    });

    // find hovered cell coords
    const rect = grid.getBoundingClientRect();
    const cellWidth = rect.width / GRID_COLS;
    const cellHeight = rect.width / GRID_ROWS;
    const x = Math.floor((event.clientX - rect.left) / cellWidth);
    const y = Math.floor((event.clientY - rect.top) / cellHeight);

    // validate
    const valid = this._checkPlacement(x, y, this._dragDropData);

    if (!valid) {
      // debugger;
    }

    // color by validity
    const color = valid ? "rgba(0,255,0,0.3)" : "rgba(255,0,0,0.3)";

    // highlight footprint
    const { width, height } = this._dragDropData;
    for (let dx = 0; dx < (width || 1); dx++) {
      for (let dy = 0; dy < (height || 1); dy++) {
        const cell = grid.querySelector(`.cell[data-x="${x + dx}"][data-y="${y + dy}"]`);
        if (cell) {
          cell.style.backgroundColor = color;
          cell.style.zIndex = 20;
        }
      }
    }
  }

  // this function is almost identical to the system function on actor-sheet.mjs, except it
  // handling of buildings when dropped, and removes some of the unnecessary stuff
  async _onDropItem(event, data) {
    // Prevents double building creation when dropping new items onto the grid
    event.stopPropagation();

    if (!this.actor.isOwner) {
      return void ui.notifications.warn("PF1.Error.NoActorPermission", { localize: true });
    }

    const sourceItem = await Item.implementation.fromDropData(data);

    const sameActor = sourceItem.actor === this.actor;

    const itemData = game.items.fromCompendium(sourceItem, {
      clearFolder: true,
      keepId: sameActor,
      clearSort: !sameActor,
    });

    // this is the new stuff
    // building handling
    if (itemData.type === pf1ks.config.buildingId) {
      return this._handleBuildings(event, itemData, sourceItem, sameActor);
    }
    // end of new stuff

    // Handle item sorting within the same actor
    if (sameActor) {
      return this._onSortItem(event, itemData);
    }

    // Create the owned item
    return this._onDropItemCreate(itemData);
  }

  _handleBuildings(event, itemData, sourceItem, sameActor) {
    const district = event.target.closest(".district");
    const districtId = district?.dataset.id;
    if (districtId) {
      itemData.system.districtId = districtId;
    }

    let x = null;
    let y = null;
    let valid = true;

    const grid = event.target.closest(".grid-container");
    if (district && grid) {
      // determine what cell the drop is in
      const rect = grid.getBoundingClientRect();
      const cellWidth = rect.width / GRID_COLS;
      const cellHeight = rect.width / GRID_ROWS;
      x = Math.floor((event.clientX - rect.left) / cellWidth);
      y = Math.floor((event.clientY - rect.top) / cellHeight);

      // validate
      valid = this._checkPlacement(x, y, this._dragDropData);

      // clear out dragData
      this._dragDropData = null;
      pf1ks._temp.dragDrop = null;

      // clear highlights
      grid.querySelectorAll(".cell").forEach((cell) => {
        cell.style.backgroundColor = "unset";
        cell.style.zIndex = "unset";
      });
    }

    if (!sameActor) {
      if (valid) {
        itemData.system.x = x;
        itemData.system.y = y;
      }
      return this._onDropItemCreate(itemData);
    }

    if (valid) {
      return sourceItem.update({
        "system.x": x,
        "system.y": y,
      });
    }
  }

  _checkPlacement(x, y, dragData) {
    const { width, height, lotSize, occupiedCells } = dragData;

    // must have width/height/lotSize
    if (!height || !width || !lotSize) {
      return false;
    }

    // bounding box
    const srcRight = x + width - 1;
    const srcBottom = y + height - 1;

    // must fit inside grid
    if (srcRight >= GRID_COLS || srcBottom >= GRID_ROWS) {
      return false;
    }

    // must not overlap any existing buildings
    for (let i = x; i < x + width; i++) {
      for (let j = y; j < y + height; j++) {
        if (occupiedCells.has(`${i},${j}`)) {
          return false;
        }
      }
    }

    return true;
  }

  _focusTabByItem(item) {
    let tabId;
    switch (item.type) {
      case pf1ks.config.buildingId:
        tabId = "districts";
        break;
      case pf1ks.config.featureId:
        tabId = "features";
        break;
      default:
        tabId = "summary";
    }

    if (tabId) {
      this.activateTab(tabId, "primary");
    }
  }

  async _getTooltipContext(fullId, context) {
    const actor = this.actor;
    const actorData = actor.system;

    // Lazy roll data
    const lazy = {
      get rollData() {
        this._cache ??= actor.getRollData();
        return this._cache;
      },
    };

    const getNotes = async (context, settlementId) =>
      (await actor.getContextNotesParsed(context, settlementId, { rollData: lazy.rollData, roll: false })).map(
        (n) => n.text
      );

    let header, subHeader;
    const details = [];
    const paths = [];
    const sources = [];
    let notes;

    const re = /^(?<id>[\w-]+)(?:\.(?<detail>.*))?$/.exec(fullId);
    const { id, detail } = re?.groups ?? {};

    switch (id) {
      case "economy":
      case "loyalty":
      case "stability":
        paths.push({
          path: `@${id}.total`,
          value: actorData[id].total,
        });
        sources.push({
          sources: actor.getSourceDetails(`system.${id}.total`),
          untyped: true,
        });
        notes = await getNotes(`${pf1ks.config.changePrefix}_${id}`);
        break;
      case "bpStorage":
        paths.push(
          {
            path: "@bpStorage.current",
            value: actorData.bpStorage.current,
          },
          {
            path: "@bpStorage.max",
            value: actorData.bpStorage.max,
          }
        );
        sources.push({
          sources: actor.getSourceDetails("system.bpStorage.max"),
          untyped: true,
        });
        break;
      case "settlement-danger":
      case "settlement-defense":
      case "settlement-baseValue":
      case "settlement-purchaseLimit":
      case "settlement-spellcasting":
      case "settlement-maxBaseValue": {
        const [, attr] = id.split("-");
        const settlement = actorData.settlements[detail];
        paths.push({
          path: `@settlements.${detail}.attributes.${attr}.total`,
          value: settlement.attributes[attr].total,
        });
        sources.push({
          sources: actor.getSourceDetails(`system.settlements.${detail}.attributes.${attr}.total`),
          untyped: true,
        });
        break;
      }

      case "settlement-Alignment":
      case "settlement-Government": {
        const [, modifier] = id.split("-");
        const settlement = actorData.settlements[detail];
        Object.entries(pf1ks.config.settlementModifiers).forEach(([mod, label]) => {
          if (settlement.modifiers[mod][`settlement${modifier}`]) {
            paths.push({
              path: label,
              value: settlement.modifiers[mod][`settlement${modifier}`].signedString(),
            });
          }
        });
        if (settlement.attributes.spellcasting[`${modifier.toLocaleLowerCase()}`]) {
          paths.push({
            path: pf1ks.config.settlementAttributes.spellcasting,
            value: settlement.attributes.spellcasting[`${modifier.toLocaleLowerCase()}`].signedString(),
          });
        }
        break;
      }
      case "settlement-corruption":
      case "settlement-crime":
      case "settlement-productivity":
      case "settlement-law":
      case "settlement-lore":
      case "settlement-society": {
        const [, modifier] = id.split("-");
        const settlement = actorData.settlements[detail];
        paths.push(
          {
            path: `@settlements.${detail}.modifiers.${modifier}.settlementTotal`,
            value: settlement.modifiers[modifier].settlementTotal,
          },
          {
            path: `@settlements.${detail}.modifiers.${modifier}.total`,
            value: settlement.modifiers[modifier].total,
          }
        );
        sources.push({
          sources: actor.getSourceDetails(`system.settlements.${detail}.modifiers.${modifier}.total`),
          untyped: true,
        });
        notes = await getNotes(`${pf1ks.config.changePrefix}_${modifier}`, settlement.id);
        break;
      }

      default:
        throw new Error(`Invalid extended tooltip identifier "${fullId}"`);
    }

    context.header = header;
    context.subHeader = subHeader;
    context.details = details;
    context.paths = paths;
    context.sources = sources;
    context.notes = notes ?? [];
  }
}
