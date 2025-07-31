import { ArmySheet } from "./applications/actors/armySheet.mjs";
import { KingdomSheet } from "./applications/actors/kingdomSheet.mjs";
import { BoonSheet } from "./applications/items/boonSheet.mjs";
import { BuildingSheet } from "./applications/items/buildingSheet.mjs";
import { EventSheet } from "./applications/items/eventSheet.mjs";
import { ImprovementSheet } from "./applications/items/improvementSheet.mjs";
import { SpecialSheet } from "./applications/items/specialSheet.mjs";
import { TacticSheet } from "./applications/items/tacticSheet.mjs";
import * as Config from "./config/_module.mjs";
import { BoonBrowser } from "./config/compendiumBrowser/boonBrowser.mjs";
import { BuildingBrowser } from "./config/compendiumBrowser/buildingBrowser.mjs";
import { EventBrowser } from "./config/compendiumBrowser/eventBrowser.mjs";
import { ImprovementBrowser } from "./config/compendiumBrowser/improvementBrowser.mjs";
import { SpecialBrowser } from "./config/compendiumBrowser/specialBrowser.mjs";
import { TacticBrowser } from "./config/compendiumBrowser/tacticBrowser.mjs";
import * as PF1KS from "./config/config.mjs";
import { ArmyModel } from "./dataModels/actors/armyModel.mjs";
import { KingdomModel } from "./dataModels/actors/kingdomModel.mjs";
import { BoonModel } from "./dataModels/items/boonModel.mjs";
import { BuildingModel } from "./dataModels/items/buildingModel.mjs";
import { EventModel } from "./dataModels/items/eventModel.mjs";
import { ImprovementModel } from "./dataModels/items/improvementModel.mjs";
import { SpecialModel } from "./dataModels/items/specialModel.mjs";
import { TacticModel } from "./dataModels/items/tacticModel.mjs";
import { ArmyActor } from "./documents/actors/armyActor.mjs";
import { KingdomActor } from "./documents/actors/kingdomActor.mjs";
import { BaseItem } from "./documents/items/baseItem.mjs";
import { getChangeFlat } from "./hooks/getChangeFlat.mjs";
import { applyChange, moduleToObject, rollEventTable } from "./util/utils.mjs";

export { PF1KS as config };
globalThis.pf1ks = moduleToObject({
  config: PF1KS,
});

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
      if (this.object.actor.type === PF1KS.armyId) {
        return army;
      }
      return core;
    },
    libWrapper.MIXED
  );

  // adds subtypes for improvement and event item creation
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

        case PF1KS.eventId:
          return PF1KS.eventSubTypes;

        case PF1KS.improvementId:
          return PF1KS.improvementSubTypes;

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

  libWrapper.ignore_conflicts(PF1KS.moduleId, "ckl-roll-bonuses", "pf1.components.ItemChange.prototype.applyChange");
});

Hooks.on("pf1GetChangeFlat", getChangeFlat);

Hooks.on("renderChatMessage", (message, html) => {
  if (message.flags?.[PF1KS.moduleId]?.eventChanceCard) {
    html.find("button.roll-event").on("click", (e) => rollEventTable(e, message));
  }
});

Hooks.once("init", () => {
  CONFIG.Actor.documentClasses[PF1KS.kingdomId] = KingdomActor;
  CONFIG.Actor.documentClasses[PF1KS.armyId] = ArmyActor;
  CONFIG.Item.documentClasses[PF1KS.buildingId] = BaseItem;
  CONFIG.Item.documentClasses[PF1KS.eventId] = BaseItem;
  CONFIG.Item.documentClasses[PF1KS.improvementId] = BaseItem;
  CONFIG.Item.documentClasses[PF1KS.boonId] = BaseItem;
  CONFIG.Item.documentClasses[PF1KS.specialId] = BaseItem;
  CONFIG.Item.documentClasses[PF1KS.tacticId] = BaseItem;

  pf1.documents.actor.KingdomActor = KingdomActor;
  pf1.documents.actor.ArmyActor = ArmyActor;
  pf1.documents.item.BuildingItem = BaseItem;
  pf1.documents.item.EventItem = BaseItem;
  pf1.documents.item.ImprovementItem = BaseItem;
  pf1.documents.item.BoonItem = BaseItem;
  pf1.documents.item.SpecialItem = BaseItem;
  pf1.documents.item.TacticItem = BaseItem;

  CONFIG.Actor.dataModels[PF1KS.kingdomId] = KingdomModel;
  CONFIG.Actor.dataModels[PF1KS.armyId] = ArmyModel;
  CONFIG.Item.dataModels[PF1KS.buildingId] = BuildingModel;
  CONFIG.Item.dataModels[PF1KS.eventId] = EventModel;
  CONFIG.Item.dataModels[PF1KS.improvementId] = ImprovementModel;
  CONFIG.Item.dataModels[PF1KS.boonId] = BoonModel;
  CONFIG.Item.dataModels[PF1KS.specialId] = SpecialModel;
  CONFIG.Item.dataModels[PF1KS.tacticId] = TacticModel;

  pf1.applications.actor.KingdomSheet = KingdomSheet;
  pf1.applications.actor.ArmySheet = ArmySheet;
  pf1.applications.item.BuildingSheet = BuildingSheet;
  pf1.applications.item.EventSheet = EventSheet;
  pf1.applications.item.ImprovementSheet = ImprovementSheet;
  pf1.applications.item.BoonSheet = BoonSheet;
  pf1.applications.item.SpecialSheet = SpecialSheet;
  pf1.applications.item.TacticSheet = TacticSheet;

  Actors.registerSheet(PF1KS.moduleId, KingdomSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Kingdom"),
    types: [PF1KS.kingdomId],
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
    types: [PF1KS.eventId],
    makeDefault: true,
  });
  Items.registerSheet(PF1KS.moduleId, ImprovementSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Improvement"),
    types: [PF1KS.improvementId],
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
      category.filters.item.exclude.push(...PF1KS.kingdomItemTypes, ...PF1KS.armyItemTypes);
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

Hooks.once("setup", () => {
  // re-prepare kingdoms and armies once all their dependencies are prepared
  game.actors
    .filter((a) => [pf1ks.config.kingdomId, pf1ks.config.armyId].includes(a.type))
    .forEach((a) => a.prepareData());
});

Hooks.once("ready", () => {
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

    "army-sheet-summary": `modules/${PF1KS.moduleId}/templates/actors/army/parts/summary.hbs`,
    "army-sheet-features": `modules/${PF1KS.moduleId}/templates/actors/army/parts/features.hbs`,
    "army-sheet-commander": `modules/${PF1KS.moduleId}/templates/actors/army/parts/commander.hbs`,
    "army-sheet-conditions": `modules/${PF1KS.moduleId}/templates/actors/army/parts/conditions.hbs`,

    "item-sheet-building": `modules/${PF1KS.moduleId}/templates/items/parts/building-details.hbs`,
    "item-sheet-event": `modules/${PF1KS.moduleId}/templates/items/parts/event-details.hbs`,
    "item-sheet-improvement": `modules/${PF1KS.moduleId}/templates/items/parts/improvement-details.hbs`,
    "item-sheet-boon": `modules/${PF1KS.moduleId}/templates/items/parts/boon-details.hbs`,
    "item-sheet-special": `modules/${PF1KS.moduleId}/templates/items/parts/special-details.hbs`,
    "item-sheet-tactic": `modules/${PF1KS.moduleId}/templates/items/parts/tactic-details.hbs`,

    "item-sheet-changes": `modules/${PF1KS.moduleId}/templates/items/parts/changes.hbs`,
  });

  pf1.applications.compendiums.boon = new BoonBrowser();
  pf1.applications.compendiums.building = new BuildingBrowser();
  pf1.applications.compendiums.event = new EventBrowser();
  pf1.applications.compendiums.improvement = new ImprovementBrowser();
  pf1.applications.compendiums.tactic = new TacticBrowser();
  pf1.applications.compendiums.special = new SpecialBrowser();

  pf1.applications.compendiumBrowser.boon = BoonBrowser;
  pf1.applications.compendiumBrowser.building = BuildingBrowser;
  pf1.applications.compendiumBrowser.event = EventBrowser;
  pf1.applications.compendiumBrowser.improvement = ImprovementBrowser;
  pf1.applications.compendiumBrowser.tactic = TacticBrowser;
  pf1.applications.compendiumBrowser.special = SpecialBrowser;

  game.model.Item[PF1KS.boonId] = {};
  game.model.Item[PF1KS.buildingId] = {};
  game.model.Item[PF1KS.eventId] = {};
  game.model.Item[PF1KS.improvementId] = {};
  game.model.Item[PF1KS.tacticId] = {};
  game.model.Item[PF1KS.specialId] = {};
});

Hooks.once("i18nInit", () => {
  const toLocalize = [
    "kingdomStats",
    "actionsPerTurnLabels",
    "kingdomGovernments",
    "edicts",
    "leadershipRoles",
    "leadershipBonusTwoStats",
    "leadershipBonusOptions",
    "leadershipSkillBonuses",
    "settlementModifiers",
    "allSettlementModifiers",
    "settlementSizes",
    "buildingTypes",
    "magicItemTypes",
    "terrainTypes",
    "settings",
    "optionalRules",
    "armyAttributes",
    "armySizes",
    "armyStrategy",
    "eventSubTypes",
    "improvementSubTypes",
    "itemSubTypes",
  ];

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

  for (let o of toLocalize) {
    pf1ks.config[o] = doLocalize(pf1ks.config[o], o);
  }

  doLocalizeKeys(pf1ks.config.armyConditions, ["name"]);
});
