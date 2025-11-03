import { findLargestSmallerNumber, keepUpdateArray, renameKeys } from "../../util/utils.mjs";

const GRID_COLS = 6;
const GRID_ROWS = 6;

export class KingdomSheet extends pf1.applications.actor.ActorSheetPF {
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
        navSelector: "nav.tabs[data-group='settlements']",
        contentSelector: "section.settlements-body",
        initial: "0",
        group: "settlements",
      },
    ];

    for (const idx in actor.system.settlements) {
      options.tabs.push({
        navSelector: `nav.tabs[data-group='settlement-${idx}-details']`,
        contentSelector: `section.settlement-${idx}-details`,
        initial: `summary`,
        group: `settlement-${idx}-details`,
      });

      options.tabs.push({
        navSelector: `nav.tabs[data-group='settlement-${idx}-districts']`,
        contentSelector: `section.settlement-${idx}-districts`,
        initial: 0,
        group: `settlement-${idx}-districts`,
      });
    }

    super(actor, options);
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "pf1ks", "kingdom"],
      scrollY: [...options.scrollY, ".subdetails-body"],
      dragDrop: [
        ...options.dragDrop,
        { dragSelector: ".building[data-item-id]", dropSelector: ".district .grid .cell" },
      ],
      height: 940,
    };
  }

  get template() {
    return `modules/${pf1ks.config.moduleId}/templates/actors/kingdom/${this.isEditable ? "edit" : "view"}.hbs`;
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
    data.alignmentOptions = pf1.config.alignments;
    data.kingdomGovernmentOptions = pf1ks.config.kingdomGovernments;
    data.settlementGovernmentOptions = pf1ks.config.settlementGovernments;
    data.districtBorderOptions = pf1ks.config.districtBorders;
    data.holidayOptions = pf1ks.config.edicts.holiday;
    data.promotionOptions = pf1ks.config.edicts.promotion;
    data.taxationOptions = pf1ks.config.edicts.taxation;

    // summary
    data.governmentLabel = pf1ks.config.kingdomGovernments[actorData.government];

    // kingdom stats
    data.stats = [];
    for (const [stat, label] of Object.entries(pf1ks.config.kingdomStats)) {
      data.stats.push({ id: stat, label, value: actorData[stat] });
    }

    // kingdom modifiers
    data.modifiers = Object.entries(pf1ks.config.settlementModifiers).map(([key, label]) => ({
      id: key,
      value: actorData.modifiers[key],
      label,
    }));

    // actions per turn
    const sizeBonus = findLargestSmallerNumber(
      Object.keys(pf1ks.config.actionsPerTurn).map((k) => Number(k)),
      actorData.size || 1
    );
    const { fame, ...perTurnRaw } = pf1ks.config.actionsPerTurn[sizeBonus];
    const perTurn = renameKeys(perTurnRaw, pf1ks.config.actionsPerTurnLabels);
    data.perTurn = perTurn;
    data.infinity = Infinity;

    // non-viceroy leadership
    data.leaders = Object.entries(actorData.leadership).reduce((acc, [key, leader]) => {
      if (key === "viceroys") {
        return acc;
      }

      const data = {
        roleLabel: pf1ks.config.leadershipRoles[leader.role],
        key,
        actorId: leader.actorId,
        skillBonus: leader.skillBonus,
        skillBonusLabel: pf1ks.config.leadershipSkillBonuses[leader.skillBonusType],
        bonus: leader.bonus,
        showSelector: false,
        bonusType: leader.bonusType,
        bonusTypeLabel: pf1ks.config.leadershipBonusOptions[leader.bonusType],
      };
      if (leader.role === "ruler") {
        data.showSelector = actorData.size < 101;
        data.bonusOptions = actorData.size < 26 ? pf1ks.config.kingdomStats : pf1ks.config.leadershipBonusTwoStats;
      } else if (leader.role === "spymaster") {
        data.showSelector = true;
        data.bonusOptions = pf1ks.config.kingdomStats;
      }

      acc.push(data);
      return acc;
    }, []);

    // viceroys
    data.viceroys = actorData.leadership.viceroys.map((viceroy) => {
      return {
        id: viceroy.id,
        roleLabel: pf1ks.config.leadershipRoles[viceroy.role],
        actorId: viceroy.actorId,
        skillBonus: viceroy.skillBonus,
        skillBonusLabel: pf1ks.config.leadershipSkillBonuses[viceroy.skillBonusType],
        bonus: viceroy.bonus,
        bonusTypeLabel: pf1ks.config.leadershipBonusOptions[viceroy.bonusType],
      };
    });

    const leadershipOptions = { "": "" };
    game.actors
      .filter((actor) => actor.permission > 0 && (actor.type === "character" || actor.type === "npc"))
      .forEach((actor) => (leadershipOptions[actor.id] = actor.name));
    data.validLeadershipOptions = leadershipOptions;

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

    // terrain
    data.terrain = Object.entries(actorData.terrain).map(([key, value]) => ({
      key,
      value,
      label: pf1ks.config.terrainTypes[key],
    }));

    // events
    data.eventChance = actorData.eventLastTurn ? 25 : 75;

    // armies
    data.armies = this._prepareArmies();

    // optional rules
    data.settings = this._prepareSettings();
    data.optionalRules = this._prepareOptionalRules();

    // notifications
    if (actorData.unrest > 10 && actorData.unrest < 20) {
      data.unrestError = game.i18n.localize("PF1KS.UnrestWarning");
    }
    if (actorData.unrest > 19) {
      data.unrestError = game.i18n.localize("PF1KS.UnrestError");
    }
    if (actorData.fame.base + actorData.infamy.base > fame) {
      data.fameInfamyError = game.i18n.localize("PF1KS.FamyInfamyError");
    }
    if (actorData.fame.base + actorData.infamy.base < fame) {
      data.fameInfamyError = game.i18n.localize("PF1KS.MissingFamyInfamyError");
    }

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".governmentForms").on("change", (e) => this._onGovernmentToggle(e));
    html.find(".secondRuler").on("change", (e) => this._onSecondRulerToggle(e));
    html.find(".item-toggle-data").on("click", (e) => this._itemToggleData(e));

    html.find(".kingdom-stat .rollable").on("click", (e) => this._onRollKingdomStat(e));
    html.find(".event-chance .rollable").on("click", (e) => this._onRollEventChance(e));

    html.find(".viceroy-create").on("click", (e) => this._onViceroyCreate(e));
    html.find(".viceroy-delete").on("click", (e) => this._onViceroyDelete(e));

    html.find(".settlement-create").on("click", (e) => this._onSettlementCreate(e));
    html.find(".settlement-delete").on("click", (e) => this._onSettlementDelete(e));

    html.find(".district-create").on("click", (e) => this._onDistrictCreate(e));
    html.find(".district-delete").on("click", (e) => this._onDistrictDelete(e));

    html.find(".magic-item-delete").on("click", (e) => this._onMagicItemDelete(e));

    html.find(".army-create").on("click", (e) => this._onArmyCreate(e));
    html.find(".army-edit").on("click", (e) => this._onArmyEdit(e));
    html.find(".army-delete").on("click", (e) => this._onArmyDelete(e));

    html.find(".building").on("dblclick", (e) => this._onBuildingEdit(e));
    html.find(".building").on("contextmenu", (e) => this._onBuildingContextMenu(e));
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

    const terrainSections = Object.values(pf1.config.sheetSections.kingdomTerrain).map((data) => ({ ...data }));
    this.actor.itemTypes[pf1ks.config.improvementId]
      .map((i) => i)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .forEach((i) => {
        const section = terrainSections.find((section) => this._applySectionFilter(i, section));
        if (section) {
          section.items ??= [];
          section.items.push({ ...i, id: i.id, isEmpty: i.system.quantity === 0 });
        }
      });

    const eventsSections = Object.values(pf1.config.sheetSections.kingdomEvent).map((data) => ({ ...data }));
    this.actor.itemTypes[pf1ks.config.eventId]
      .map((i) => i)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .forEach((e) => {
        const section = eventsSections.find((section) => this._applySectionFilter(e, section));
        if (section) {
          section.items ??= [];
          section.items.push({
            ...e,
            id: e.id,
            settlementName: this.actor.system.settlements.find((s) => s.id === e.system.settlementId)?.name,
          });
        }
      });

    const categories = [
      { key: "features", sections: featureSections },
      { key: "terrain", sections: terrainSections },
      { key: "events", sections: eventsSections },
    ];
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

    return { terrain: terrainSections, events: eventsSections, settlements: settlementSections };
  }

  _prepareArmies() {
    return this.actor.system.armies.map((army) => ({
      id: army.id,
      img: army.actor.img,
      name: army.actor.name,
      system: army.actor.system,
    }));
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

  _onGovernmentToggle(event) {
    if (!event.target.checked) {
      this.actor.update({ "system.government": "aut" });
    }
  }

  _onSecondRulerToggle(event) {
    if (event.target.checked) {
      this.actor.update({ "system.leadership.consort": { bonusType: "", role: "ruler" } });
    } else {
      this.actor.update({ "system.leadership.consort": { bonusType: "loyalty", role: "consort" } });
    }
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

  async _onRollKingdomStat(event) {
    event.preventDefault();
    const kingdomStat = event.currentTarget.closest(".kingdom-stat").dataset.kingdomStat;
    this.actor.rollKingdomStat(kingdomStat, { actor: this.actor });
  }

  async _onRollEventChance(event) {
    event.preventDefault();
    this.actor.rollEvent({ actor: this.actor });
  }

  async _onViceroyCreate(event) {
    event.preventDefault();

    const viceroys = foundry.utils.duplicate(this.actor.system.leadership.viceroys ?? []);
    viceroys.push({
      role: "viceroy",
    });

    await this._onSubmit(event, {
      updateData: { "system.leadership.viceroys": viceroys },
    });
  }

  async _onViceroyDelete(event) {
    event.preventDefault();

    const viceroyId = event.currentTarget.closest(".item").dataset.itemId;
    const viceroys = foundry.utils.duplicate(this.actor.system.leadership.viceroys ?? []);
    viceroys.findSplice((viceroy) => viceroy.id === viceroyId);

    await this._onDelete({
      button: event.currentTarget,
      title: game.i18n.localize("PF1KS.DeleteViceroy"),
      content: `<p>${game.i18n.localize("PF1KS.DeleteViceroyConfirmation")}</p>`,
      onDelete: () =>
        this._onSubmit(event, {
          updateData: { "system.leadership.viceroys": viceroys },
        }),
    });
  }

  async _onSettlementCreate(event) {
    event.preventDefault();

    const newIdx = this.actor.system.settlements.length;
    const settlements = foundry.utils.duplicate(this.actor.system.settlements ?? []);
    settlements.push({
      name: game.i18n.format("PF1KS.NewSettlementLabel", { number: newIdx + 1 }),
      id: foundry.utils.randomID(),
      districts: [{ name: game.i18n.format("PF1KS.NewDistrictLabel", { number: 1 }), id: foundry.utils.randomID() }],
    });

    // adding summary/districts/features/magic items nav and district nav for new settlement
    const tabs = [
      {
        navSelector: `nav.tabs[data-group='settlement-${newIdx}-details']`,
        contentSelector: `section.settlement-${newIdx}-details`,
        initial: `summary`,
        group: `settlement-${newIdx}-details`,
        callback: this._onChangeTab.bind(this),
      },
      {
        navSelector: `nav.tabs[data-group='settlement-${newIdx}-districts']`,
        contentSelector: `section.settlement-${newIdx}-districts`,
        initial: 0,
        group: `settlement-${newIdx}-districts`,
        callback: this._onChangeTab.bind(this),
      },
    ];
    this.options.tabs.push(...tabs);
    for (const tab of tabs) {
      this._tabs.push(new Tabs(tab));
    }

    await this._onSubmit(event, {
      updateData: { "system.settlements": settlements },
    });

    this.activateTab(`${newIdx}`, { group: "settlements" });
  }

  async _onSettlementDelete(event) {
    event.preventDefault();
    this.form.disabled = true;

    const settlementId = event.currentTarget.dataset.id;
    const settlements = foundry.utils.duplicate(this.actor.system.settlements ?? []);
    const deletedSettlement = settlements.findSplice((settlement) => settlement.id === settlementId);

    const response = await this._onDelete({
      button: event.currentTarget,
      title: game.i18n.format("PF1KS.DeleteSettlementTitle", { name: deletedSettlement.name }),
      content: `<p>${game.i18n.localize("PF1KS.DeleteSettlementConfirmation")}</p>`,
      onDelete: () =>
        this._onSubmit(event, {
          updateData: { "system.settlements": settlements },
        }),
    });

    if (response) {
      const itemIdsToDelete = this.actor.items
        .filter(
          (item) =>
            [pf1ks.config.buildingId, pf1ks.config.featureId].includes(item.type) &&
            item.system.settlementId === settlementId
        )
        .map((item) => item._id);

      await this.actor.deleteEmbeddedDocuments("Item", itemIdsToDelete);
    }
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

  async _onArmyCreate(event) {
    event.preventDefault();

    const newArmy = await Actor.create({
      name: game.i18n.localize("PF1KS.NewArmy"),
      type: pf1ks.config.armyId,
    });

    return this._createArmy(newArmy._id);
  }

  async _createArmy(actorId) {
    const armies = foundry.utils.duplicate(this.actor.system.armies ?? []);
    armies.push({
      id: foundry.utils.randomID(),
      actor: actorId,
    });

    await this._onSubmit(event, {
      updateData: { "system.armies": armies },
    });
  }

  async _onArmyEdit(event) {
    event.preventDefault();
    const armyId = event.currentTarget.closest(".item").dataset.id;
    const army = this.actor.system.armies.find((army) => army.id === armyId);

    army.actor.sheet.render(true, { focus: true });
  }

  async _onArmyDelete(event) {
    event.preventDefault();

    const armyId = event.currentTarget.closest(".item").dataset.id;
    const armies = foundry.utils.duplicate(this.actor.system.armies ?? []);
    const deletedArmy = armies.findSplice((army) => army.id === armyId);
    const deletedArmyActor = this.actor.system.armies.find((army) => army.id === deletedArmy.id).actor;

    await this._onDelete({
      button: event.currentTarget,
      title: game.i18n.format("PF1KS.DeleteArmyTitle", { name: deletedArmyActor?.name }),
      content: `<p>${game.i18n.localize("PF1KS.DeleteArmyConfirmation")}</p>`,
      onDelete: async () =>
        await this._onSubmit(event, {
          updateData: { "system.armies": armies },
        }),
    });
  }

  async _onDelete({ button, title, content, onDelete }) {
    if (button.disabled) {
      return;
    }
    button.disabled = true;

    try {
      return await Dialog.confirm({
        title,
        content,
        yes: () => {
          onDelete();
          button.disabled = false;
        },
        no: () => (button.disabled = false),
        rejectClose: true,
      });
    } catch (e) {
      button.disabled = false;
    }
  }

  // overrides
  // this function is almost identical to the system function on actor-sheet.mjs, except it allows
  // the settlementId of buildings to be pre-populated
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
    const settlementId = el.dataset.settlementId;
    if (settlementId) {
      createData.system ??= {};
      createData.system.settlementId = settlementId;
    }

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
      const keepPaths = ["system.settlements"];

      for (const idx in changed.system.settlements) {
        keepPaths.push(`system.settlements.${idx}.districts`);
      }

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
  // allows the settlement/district ids of buildings to be pre-populated when dropped on settlements,
  // and removes some of the unnecessary stuff
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

    // this is the new stuff, settlement id and building handling
    // settlement id handling
    const settlementId = event.target.closest(".settlement")?.dataset.id;
    if (settlementId && itemData.system.settlementId != null) {
      itemData.system.settlementId = settlementId;
    }
    // building handling
    if (itemData.type === pf1ks.config.buildingId) {
      return this._handleBuildings(event, itemData, sourceItem, sameActor);
    }

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

  // allows dropping armies onto kingdoms
  async _onDropActor(event, data) {
    event.preventDefault();

    const actorData = await Actor.fromDropData(data);

    if (actorData.type !== pf1ks.config.armyId) {
      return false;
    }

    const source = actorData._stats.compendiumSource.split(".")[0];

    let army;
    if (source === "Actor") {
      army = await fromUuid(data.uuid);
    } else {
      army = await Actor.create(actorData.toObject());
    }

    const created = await this._createArmy(army._id);
    this.activateTab("armies", "primary");
    return created;
  }

  _focusTabByItem(item) {
    let tabId;
    switch (item.type) {
      case pf1ks.config.buildingId:
      case pf1ks.config.featureId:
        tabId = "settlements";
        break;
      case pf1ks.config.improvementId:
        tabId = "terrain";
        break;
      case pf1ks.config.eventId:
        tabId = "events";
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
      case "controlDC":
        paths.push({
          path: "@controlDC",
          value: actorData.controlDC,
        });
        sources.push({
          sources: actor.getSourceDetails("system.controlDC"),
          untyped: true,
        });
        break;
      case "economy":
      case "loyalty":
      case "stability":
      case "bonusBP":
      case "consumption":
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
      case "holiday":
        if (actorData.edicts[id]) {
          paths.push(
            {
              path: game.i18n.localize("PF1KS.Loyalty"),
              value: pf1ks.config.edictEffects[id][actorData.edicts[id]].loyalty.signedString(),
            },
            {
              path: game.i18n.localize("PF1KS.Consumption"),
              value: pf1ks.config.edictEffects[id][actorData.edicts[id]].consumption.signedString(),
            }
          );
        }
        break;
      case "promotion":
        if (actorData.edicts[id]) {
          paths.push(
            {
              path: game.i18n.localize("PF1KS.Stability"),
              value: pf1ks.config.edictEffects[id][actorData.edicts[id]].stability.signedString(),
            },
            {
              path: game.i18n.localize("PF1KS.Consumption"),
              value: pf1ks.config.edictEffects[id][actorData.edicts[id]].consumption.signedString(),
            }
          );
        }
        break;
      case "taxation":
        if (actorData.edicts[id]) {
          paths.push(
            {
              path: game.i18n.localize("PF1KS.Economy"),
              value: pf1ks.config.edictEffects[id][actorData.edicts[id]].economy.signedString(),
            },
            {
              path: game.i18n.localize("PF1KS.Loyalty"),
              value: pf1ks.config.edictEffects[id][actorData.edicts[id]].loyalty.signedString(),
            }
          );
        }
        break;
      case "government":
        Object.entries(pf1ks.config.settlementModifiers).forEach(([mod, label]) => {
          if (actorData.modifiers[mod].government) {
            paths.push({
              path: label,
              value: actorData.modifiers[mod].government.signedString(),
            });
          }
        });
        break;
      case "alignment":
        Object.entries(pf1ks.config.kingdomStats).forEach(([stat, label]) => {
          const value = pf1ks.config.alignmentEffects[actorData.alignment]?.[stat];
          if (value) {
            paths.push({
              path: label,
              value: value.signedString(),
            });
          }
        });
        Object.entries(pf1ks.config.settlementModifiers).forEach(([mod, label]) => {
          if (actorData.modifiers[mod].alignment) {
            paths.push({
              path: label,
              value: actorData.modifiers[mod].alignment.signedString(),
            });
          }
        });
        break;
      case "fame":
      case "infamy":
        paths.push(
          {
            path: `@${id}.base`,
            value: actorData[id].base,
          },
          {
            path: `@${id}.total`,
            value: actorData[id].total,
          }
        );
        sources.push({
          sources: actor.getSourceDetails(`system.${id}.total`),
          untyped: true,
        });
        break;
      case "corruption":
      case "crime":
      case "productivity":
      case "law":
      case "lore":
      case "society":
        paths.push({
          path: `@modifiers.${id}.total`,
          value: actorData.modifiers[id].total,
        });
        sources.push({
          sources: actor.getSourceDetails(`system.modifiers.${id}.total`),
          untyped: true,
        });
        notes = await getNotes(`${pf1ks.config.changePrefix}_${id}`);
        break;
      case "settlement-danger":
      case "settlement-defense":
      case "settlement-baseValue":
      case "settlement-purchaseLimit":
      case "settlement-spellcasting": {
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
