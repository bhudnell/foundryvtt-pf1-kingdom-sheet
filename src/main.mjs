import { ArmySheet } from "./applications/actors/armySheet.mjs";
import { KingdomSheet } from "./applications/actors/kingdomSheet.mjs";
import { SettlementSheet } from "./applications/actors/settlementSheet.mjs";
import { BoonSheet } from "./applications/items/boonSheet.mjs";
import { BuildingSheet } from "./applications/items/buildingSheet.mjs";
import { EventSheet } from "./applications/items/eventSheet.mjs";
import { FeatureSheet } from "./applications/items/featureSheet.mjs";
import { ImprovementSheet } from "./applications/items/improvementSheet.mjs";
import { SpecialSheet } from "./applications/items/specialSheet.mjs";
import { TacticSheet } from "./applications/items/tacticSheet.mjs";
import * as Config from "./config/_module.mjs";
import { BoonBrowser } from "./config/compendiumBrowser/boonBrowser.mjs";
import { BuildingBrowser } from "./config/compendiumBrowser/buildingBrowser.mjs";
import { FeatureBrowser } from "./config/compendiumBrowser/featureBrowser.mjs";
import { ImprovementBrowser } from "./config/compendiumBrowser/improvementBrowser.mjs";
import { KingdomEventBrowser } from "./config/compendiumBrowser/kingdomEventBrowser.mjs";
import { SettlementEventBrowser } from "./config/compendiumBrowser/settlementEventBrowser.mjs";
import { SpecialBrowser } from "./config/compendiumBrowser/specialBrowser.mjs";
import { TacticBrowser } from "./config/compendiumBrowser/tacticBrowser.mjs";
import * as PF1KS from "./config/config.mjs";
import { ArmyModel } from "./dataModels/actors/armyModel.mjs";
import { KingdomModel } from "./dataModels/actors/kingdomModel.mjs";
import { SettlementModel } from "./dataModels/actors/settlementModel.mjs";
import { BoonModel } from "./dataModels/items/boonModel.mjs";
import { BuildingModel } from "./dataModels/items/buildingModel.mjs";
import { EventModel } from "./dataModels/items/eventModel.mjs";
import { FeatureModel } from "./dataModels/items/featureModel.mjs";
import { ImprovementModel } from "./dataModels/items/improvementModel.mjs";
import { SpecialModel } from "./dataModels/items/specialModel.mjs";
import { TacticModel } from "./dataModels/items/tacticModel.mjs";
import { ArmyActor } from "./documents/actors/armyActor.mjs";
import { KingdomActor } from "./documents/actors/kingdomActor.mjs";
import { SettlementActor } from "./documents/actors/settlementActor.mjs";
import { BoonItem } from "./documents/items/boonItem.mjs";
import { BuildingItem } from "./documents/items/buildingItem.mjs";
import { EventItem } from "./documents/items/eventItem.mjs";
import { FeatureItem } from "./documents/items/featureItem.mjs";
import { ImprovementItem } from "./documents/items/improvementItem.mjs";
import { SpecialItem } from "./documents/items/specialItem.mjs";
import { TacticItem } from "./documents/items/tacticItem.mjs";
import { getChangeFlat } from "./hooks/getChangeFlat.mjs";
import { migrate } from "./migrations/index.mjs";
import { applyChange, moduleToObject, rollEventTable } from "./util/utils.mjs";

export { PF1KS as config };
globalThis.pf1ks = moduleToObject({
  config: PF1KS,
});

Hooks.once("pf1PostReady", () => migrate());

Hooks.on("preCreateItem", (item, data, context, user) => {
  if (!item.actor) {
    return;
  }

  // non module actors
  if (
    ![PF1KS.kingdomId, PF1KS.armyId].includes(item.actor.type) &&
    [...PF1KS.kingdomItemTypes, ...PF1KS.armyItemTypes].includes(item.type)
  ) {
    ui.notifications.error("PF1KS.NoKingdomOrArmyItemsOnActor", { localize: true });
    return false;
  }

  // kingdom actors
  if (item.actor.type === PF1KS.kingdomId && !PF1KS.kingdomItemTypes.includes(item.type)) {
    ui.notifications.error("PF1KS.OnlyKingdomItemsOnActor", { localize: true });
    return false;
  }

  // settlement actors
  if (item.actor.type === PF1KS.settlementId && !PF1KS.settlementItemTypes.includes(item.type)) {
    ui.notifications.error("PF1KS.OnlySettlementItemsOnActor", { localize: true });
    return false;
  }

  // army actors
  if (item.actor.type === PF1KS.armyId && !PF1KS.armyItemTypes.includes(item.type)) {
    ui.notifications.error("PF1KS.OnlyArmyItemsOnActor", { localize: true });
    return false;
  }
});

Hooks.once("libWrapper.Ready", () => {
  console.log(`${PF1KS.moduleId} | Registering LibWrapper Hooks`);

  // changes token HUD conditions for module actors
  libWrapper.register(
    PF1KS.moduleId,
    "TokenHUD.prototype._getStatusEffectChoices",
    function (wrapper) {
      const army = {};
      const core = {};

      Object.entries(wrapper()).forEach(([key, value]) => {
        if (value.id.startsWith(PF1KS.changePrefix)) {
          army[key] = value;
        } else {
          core[key] = value;
        }
      });

      if (this.object.actor.type === PF1KS.kingdomId) {
        return {};
      }
      if (this.object.actor.type === PF1KS.settlementId) {
        return {};
      }
      if (this.object.actor.type === PF1KS.armyId) {
        return army;
      }
      return core;
    },
    libWrapper.MIXED
  );

  // adds subtypes for improvement, event, and feature item creation
  libWrapper.register(
    PF1KS.moduleId,
    "pf1.applications.item.CreateDialog.prototype.getSubtypes",
    function (wrapper, type) {
      switch (type) {
        case PF1KS.boonId:
        case PF1KS.buildingId:
        case PF1KS.specialId:
        case PF1KS.tacticId:
          return null;

        case PF1KS.kingdomEventId:
        case PF1KS.settlementEventId:
          return PF1KS.eventSubTypes;

        case PF1KS.improvementId:
          return PF1KS.improvementSubTypes;

        case PF1KS.featureId:
          return PF1KS.featureSubTypes;

        default:
          return wrapper(type);
      }
    },
    libWrapper.MIXED
  );

  // lets changes be multiplied by quantity for module
  libWrapper.register(
    PF1KS.moduleId,
    "pf1.components.ItemChange.prototype.applyChange",
    function (wrapper, actor, targets, options) {
      if (actor.type.startsWith(PF1KS.moduleId)) {
        applyChange(this, actor, targets, options);
      } else {
        return wrapper(actor, targets, options);
      }
    },
    libWrapper.MIXED
  );

  libWrapper.register(
    PF1KS.moduleId,
    "DragDrop.prototype._handleDragStart",
    async function (wrapper, event) {
      const wrapped = await wrapper(event);
      const itemData = JSON.parse(event.dataTransfer.getData("text/plain"));
      const { documentId, itemId } = event.currentTarget.dataset;
      itemData.id = itemId ?? documentId;
      pf1ks._temp.dragDrop = itemData;
      return wrapped;
    },
    libWrapper.MIXED
  );

  libWrapper.ignore_conflicts(PF1KS.moduleId, "ckl-roll-bonuses", "pf1.components.ItemChange.prototype.applyChange");
});

Hooks.on("pf1GetChangeFlat", getChangeFlat);

Hooks.on("renderChatMessage", (message, html) => {
  if (message.getFlag(PF1KS.moduleId, "eventChanceCard")) {
    html.find("button.roll-event").on("click", (e) => rollEventTable(e, message));
  }
});

Hooks.once("pf1PostInit", () => {
  Object.defineProperty(pf1ks, "_temp", {
    value: {},
    enumerable: false,
    writable: false,
  });

  CONFIG.Actor.documentClasses[PF1KS.kingdomId] = KingdomActor;
  CONFIG.Actor.documentClasses[PF1KS.settlementId] = SettlementActor;
  CONFIG.Actor.documentClasses[PF1KS.armyId] = ArmyActor;
  CONFIG.Item.documentClasses[PF1KS.buildingId] = BuildingItem;
  CONFIG.Item.documentClasses[PF1KS.kingdomEventId] = EventItem;
  CONFIG.Item.documentClasses[PF1KS.settlementEventId] = EventItem;
  CONFIG.Item.documentClasses[PF1KS.improvementId] = ImprovementItem;
  CONFIG.Item.documentClasses[PF1KS.featureId] = FeatureItem;
  CONFIG.Item.documentClasses[PF1KS.boonId] = BoonItem;
  CONFIG.Item.documentClasses[PF1KS.specialId] = SpecialItem;
  CONFIG.Item.documentClasses[PF1KS.tacticId] = TacticItem;

  pf1.documents.actor.KingdomActor = KingdomActor;
  pf1.documents.actor.SettlementActor = SettlementActor;
  pf1.documents.actor.ArmyActor = ArmyActor;
  pf1.documents.item.BuildingItem = BuildingItem;
  pf1.documents.item.EventItem = EventItem;
  pf1.documents.item.ImprovementItem = ImprovementItem;
  pf1.documents.item.FeatureItem = FeatureItem;
  pf1.documents.item.BoonItem = BoonItem;
  pf1.documents.item.SpecialItem = SpecialItem;
  pf1.documents.item.TacticItem = TacticItem;

  CONFIG.Actor.dataModels[PF1KS.kingdomId] = KingdomModel;
  CONFIG.Actor.dataModels[PF1KS.settlementId] = SettlementModel;
  CONFIG.Actor.dataModels[PF1KS.armyId] = ArmyModel;
  CONFIG.Item.dataModels[PF1KS.buildingId] = BuildingModel;
  CONFIG.Item.dataModels[PF1KS.kingdomEventId] = EventModel;
  CONFIG.Item.dataModels[PF1KS.settlementEventId] = EventModel;
  CONFIG.Item.dataModels[PF1KS.improvementId] = ImprovementModel;
  CONFIG.Item.dataModels[PF1KS.featureId] = FeatureModel;
  CONFIG.Item.dataModels[PF1KS.boonId] = BoonModel;
  CONFIG.Item.dataModels[PF1KS.specialId] = SpecialModel;
  CONFIG.Item.dataModels[PF1KS.tacticId] = TacticModel;

  pf1.applications.actor.KingdomSheet = KingdomSheet;
  pf1.applications.actor.SettlementSheet = SettlementSheet;
  pf1.applications.actor.ArmySheet = ArmySheet;
  pf1.applications.item.BuildingSheet = BuildingSheet;
  pf1.applications.item.EventSheet = EventSheet;
  pf1.applications.item.ImprovementSheet = ImprovementSheet;
  pf1.applications.item.FeatureSheet = FeatureSheet;
  pf1.applications.item.BoonSheet = BoonSheet;
  pf1.applications.item.SpecialSheet = SpecialSheet;
  pf1.applications.item.TacticSheet = TacticSheet;

  Actors.registerSheet(PF1KS.moduleId, KingdomSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Kingdom"),
    types: [PF1KS.kingdomId],
    makeDefault: true,
  });
  Actors.registerSheet(PF1KS.moduleId, SettlementSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Settlement"),
    types: [PF1KS.settlementId],
    makeDefault: true,
  });
  Actors.registerSheet(PF1KS.moduleId, ArmySheet, {
    label: game.i18n.localize("PF1KS.Sheet.Army"),
    types: [PF1KS.armyId],
    makeDefault: true,
  });
  Items.registerSheet(PF1KS.moduleId, BuildingSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Building"),
    types: [PF1KS.buildingId],
    makeDefault: true,
  });
  Items.registerSheet(PF1KS.moduleId, EventSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Event"),
    types: [PF1KS.kingdomEventId, PF1KS.settlementEventId],
    makeDefault: true,
  });
  Items.registerSheet(PF1KS.moduleId, ImprovementSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Improvement"),
    types: [PF1KS.improvementId],
    makeDefault: true,
  });
  Items.registerSheet(PF1KS.moduleId, FeatureSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Feature"),
    types: [PF1KS.featureId],
    makeDefault: true,
  });
  Items.registerSheet(PF1KS.moduleId, BoonSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Boon"),
    types: [PF1KS.boonId],
    makeDefault: true,
  });
  Items.registerSheet(PF1KS.moduleId, SpecialSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Special"),
    types: [PF1KS.specialId],
    makeDefault: true,
  });
  Items.registerSheet(PF1KS.moduleId, TacticSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Tactic"),
    types: [PF1KS.tacticId],
    makeDefault: true,
  });

  // remove module buff targets from non module items
  for (const prop of ["buffTargetCategories", "contextNoteCategories"]) {
    for (const categoryKey in pf1.config[prop]) {
      const category = pf1.config[prop][categoryKey];
      category.filters ??= {};
      category.filters.item ??= {};
      category.filters.item.exclude ??= [];
      category.filters.item.exclude.push(
        ...PF1KS.kingdomItemTypes,
        ...PF1KS.settlementItemTypes,
        ...PF1KS.armyItemTypes
      );
      pf1.config[prop][categoryKey] = category;
    }
  }

  foundry.utils.mergeObject(pf1.config, Object.assign({}, Config));
  CONFIG.statusEffects.push(
    ...Object.values(PF1KS.armyConditions).map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.texture,
      get label() {
        return this.name;
      },
      set label(name) {
        this.name = name;
      },
    }))
  );
});

Hooks.once("pf1PostSetup", () => {
  // re-prepare kingdoms and armies once all their dependencies are prepared
  game.actors
    .filter((a) => [pf1ks.config.kingdomId, pf1ks.config.settlementId, pf1ks.config.armyId].includes(a.type))
    .forEach((a) => a.prepareData());
});

Hooks.once("pf1PostReady", () => {
  if (!game.modules.get("lib-wrapper")?.active && game.user.isGM) {
    ui.notifications.error("PF1KS.LibWrapperError");
  }

  loadTemplates({
    "kingdom-sheet-armies": `modules/${PF1KS.moduleId}/templates/actors/kingdom/parts/armies.hbs`,
    "kingdom-sheet-settings": `modules/${PF1KS.moduleId}/templates/actors/kingdom/parts/settings.hbs`,
    "kingdom-sheet-events": `modules/${PF1KS.moduleId}/templates/actors/kingdom/parts/events.hbs`,
    "kingdom-sheet-leadership": `modules/${PF1KS.moduleId}/templates/actors/kingdom/parts/leadership.hbs`,
    "kingdom-sheet-settlements": `modules/${PF1KS.moduleId}/templates/actors/kingdom/parts/settlements.hbs`,
    "kingdom-sheet-summary": `modules/${PF1KS.moduleId}/templates/actors/kingdom/parts/summary.hbs`,
    "kingdom-sheet-terrain": `modules/${PF1KS.moduleId}/templates/actors/kingdom/parts/terrain.hbs`,

    "settlement-sheet-summary": `modules/${PF1KS.moduleId}/templates/actors/settlement/parts/summary.hbs`,
    "settlement-sheet-districts": `modules/${PF1KS.moduleId}/templates/actors/settlement/parts/districts.hbs`,
    "settlement-sheet-features": `modules/${PF1KS.moduleId}/templates/actors/settlement/parts/features.hbs`,
    "settlement-sheet-magic-items": `modules/${PF1KS.moduleId}/templates/actors/settlement/parts/magic-items.hbs`,
    "settlement-sheet-unassigned-buildings": `modules/${PF1KS.moduleId}/templates/actors/settlement/parts/unassigned-buildings.hbs`,
    "settlement-sheet-settings": `modules/${PF1KS.moduleId}/templates/actors/settlement/parts/settings.hbs`,

    "army-sheet-summary": `modules/${PF1KS.moduleId}/templates/actors/army/parts/summary.hbs`,
    "army-sheet-features": `modules/${PF1KS.moduleId}/templates/actors/army/parts/features.hbs`,
    "army-sheet-commander": `modules/${PF1KS.moduleId}/templates/actors/army/parts/commander.hbs`,
    "army-sheet-conditions": `modules/${PF1KS.moduleId}/templates/actors/army/parts/conditions.hbs`,

    "item-sheet-building": `modules/${PF1KS.moduleId}/templates/items/parts/building-details.hbs`,
    "item-sheet-event": `modules/${PF1KS.moduleId}/templates/items/parts/event-details.hbs`,
    "item-sheet-improvement": `modules/${PF1KS.moduleId}/templates/items/parts/improvement-details.hbs`,
    "item-sheet-feature": `modules/${PF1KS.moduleId}/templates/items/parts/feature-details.hbs`,
    "item-sheet-boon": `modules/${PF1KS.moduleId}/templates/items/parts/boon-details.hbs`,
    "item-sheet-special": `modules/${PF1KS.moduleId}/templates/items/parts/special-details.hbs`,
    "item-sheet-tactic": `modules/${PF1KS.moduleId}/templates/items/parts/tactic-details.hbs`,

    "item-sheet-changes": `modules/${PF1KS.moduleId}/templates/items/parts/changes.hbs`,
  });

  pf1.applications.compendiums.boons = new BoonBrowser();
  pf1.applications.compendiums.buildings = new BuildingBrowser();
  pf1.applications.compendiums.kingdomEvents = new KingdomEventBrowser();
  pf1.applications.compendiums.settlementEvents = new SettlementEventBrowser();
  pf1.applications.compendiums.improvements = new ImprovementBrowser();
  pf1.applications.compendiums.features = new FeatureBrowser();
  pf1.applications.compendiums.tactics = new TacticBrowser();
  pf1.applications.compendiums.special = new SpecialBrowser();

  pf1.applications.compendiumBrowser.boons = BoonBrowser;
  pf1.applications.compendiumBrowser.buildings = BuildingBrowser;
  pf1.applications.compendiumBrowser.kingdomEvents = KingdomEventBrowser;
  pf1.applications.compendiumBrowser.settlementEvents = SettlementEventBrowser;
  pf1.applications.compendiumBrowser.improvements = ImprovementBrowser;
  pf1.applications.compendiumBrowser.features = FeatureBrowser;
  pf1.applications.compendiumBrowser.tactics = TacticBrowser;
  pf1.applications.compendiumBrowser.special = SpecialBrowser;

  game.model.Item[PF1KS.boonId] = {};
  game.model.Item[PF1KS.buildingId] = {};
  game.model.Item[PF1KS.kingdomEventId] = {};
  game.model.Item[PF1KS.settlementEventId] = {};
  game.model.Item[PF1KS.improvementId] = {};
  game.model.Item[PF1KS.featureId] = {};
  game.model.Item[PF1KS.tacticId] = {};
  game.model.Item[PF1KS.specialId] = {};
});

Hooks.once("i18nInit", () => {
  const doLocalize = (obj, cat) => {
    // Create tuples of (key, localized object/string)
    const localized = Object.entries(obj).reduce((arr, [key, value]) => {
      if (typeof value === "string") {
        arr.push([key, game.i18n.localize(value)]);
      } else if (typeof value === "object") {
        arr.push([key, doLocalize(value, `${cat}.${key}`)]);
      }
      return arr;
    }, []);

    // Get the localized and sorted object out of tuple
    return localized.reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
  };

  const doLocalizeKeys = (obj, keys = []) => {
    for (const path of Object.keys(foundry.utils.flattenObject(obj))) {
      const key = path.split(".").at(-1);
      if (keys.includes(key)) {
        const value = foundry.utils.getProperty(obj, path);
        if (value) {
          foundry.utils.setProperty(obj, path, game.i18n.localize(value));
        }
      }
    }
  };

  const toLocalize = [
    "kingdomStats",
    "actionsPerTurnLabels",
    "kingdomGovernments",
    "settlementGovernments",
    "edicts",
    "leadershipRoles",
    "leadershipBonusTwoStats",
    "leadershipBonusOptions",
    "leadershipSkillBonuses",
    "settlementModifiers",
    "settlementAttributes",
    "settlementSizes",
    "districtBorders",
    "buildingErrors",
    "magicItemTypes",
    "terrainTypes",
    "settings",
    "optionalRules",
    "armyAttributes",
    "armySizes",
    "armyStrategy",
    "eventSubTypes",
    "improvementSubTypes",
    "featureSubTypes",
    "itemSubTypes",
  ];

  for (let o of toLocalize) {
    pf1ks.config[o] = doLocalize(pf1ks.config[o], o);
  }

  doLocalizeKeys(pf1ks.config.armyConditions, ["name"]);
  doLocalizeKeys(pf1ks.config.buildingTypes, ["name"]);
});

Hooks.on("deleteActor", async (actor, options, userId) => {
  if (userId !== game.users.activeGM?.id) {
    return;
  }

  // if deleting a settlement or army, delete the linked kingdom's proxy if it exists
  if ([pf1ks.config.armyId, pf1ks.config.settlementId].includes(actor.type) && actor.system.kingdom) {
    const kingdomActor = game.actors.get(actor.system.kingdom.actor.id);
    const proxyPath = actor.type === pf1ks.config.armyId ? "armies" : "settlementProxies";

    const proxies = foundry.utils.duplicate(kingdomActor.system[proxyPath] ?? []);
    proxies.findSplice((proxy) => proxy.actor === actor.id);

    await kingdomActor.update({ [`system.${proxyPath}`]: proxies });
  }

  // if deleting a kingdom, unset the kingdom fields in all linked settlements and armies
  if (actor.type === pf1ks.config.kingdomId && (actor.system.armies.length || actor.system.settlementProxies.length)) {
    const updates = [];
    for (const army of actor.system.armies) {
      updates.push({ _id: army.actor._id, "system.-=kingdom": null });
    }
    for (const settlement of actor.system.settlementProxies) {
      updates.push({ _id: settlement.actor._id, "system.-=kingdom": null });
    }

    const updated = await Actor.implementation.updateDocuments(updates);
  }
});

// TODO how to prevent a settlement being linked to multiple kingdoms?
// Think things like duplicating kingdoms
