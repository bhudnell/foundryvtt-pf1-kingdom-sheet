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
import { moduleToObject, rollEventTable } from "./util/utils.mjs";

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
    ![PF1KS.kingdomSheetId, PF1KS.kingdomArmyId].includes(item.actor.type) &&
    [...PF1KS.kingdomItemTypes, ...PF1KS.armyItemTypes].includes(item.type)
  ) {
    ui.notifications.error("PF1KS.NoKingdomOrArmyItemsOnActor", { localize: true }); // TODO add to en.json
    return false;
  }

  // kingdom actors
  if (item.actor.type === PF1KS.kingdomSheetId && !PF1KS.kingdomItemTypes.includes(item.type)) {
    ui.notifications.error("PF1KS.OnlyKingdomItemsOnActor", { localize: true });
    return false;
  }

  // army actors
  if (item.actor.type === PF1KS.kingdomArmyId && !PF1KS.armyItemTypes.includes(item.type)) {
    ui.notifications.error("PF1KS.OnlyArmyItemsOnActor", { localize: true });
    return false;
  }
});

Hooks.once("libWrapper.Ready", () => {
  console.log(`${PF1KS.CFG.id} | Registering LibWrapper Hooks`);

  libWrapper.register(
    PF1KS.CFG.id,
    "TokenHUD.prototype._getStatusEffectChoices",
    function (wrapper) {
      if (this.object.actor.type === PF1KS.kingdomSheetId) {
        return {}; // TODO any conditions?
      }
      if (this.object.actor.type === PF1KS.kingdomArmyId) {
        return {}; // TODO add battlefield conditions https://www.aonprd.com/Rules.aspx?ID=1575
      }
      return wrapper();
    },
    libWrapper.MIXED
  );

  libWrapper.register(
    PF1KS.CFG.id,
    "pf1.applications.item.CreateDialog.prototype.getSubtypes",
    function (wrapper, type) {
      switch (type) {
        case PF1KS.kingdomBoonId:
        case PF1KS.kingdomBuildingId:
        case PF1KS.kingdomSpecialId:
        case PF1KS.kingdomTacticId:
          return null;

        case PF1KS.kingdomEventId:
          return PF1KS.eventSubTypes;

        case PF1KS.kingdomImprovementId:
          return PF1KS.improvementSubTypes;

        default:
          return wrapper(type);
      }
    },
    libWrapper.MIXED
  );
});

Hooks.on("pf1GetChangeFlat", getChangeFlat);

Hooks.on("renderChatMessage", (message, html) => {
  if (message.flags?.[PF1KS.CFG.id]?.eventChanceCard) {
    html.find("button.roll-event").on("click", (e) => rollEventTable(e, message));
  }
});

Hooks.once("init", () => {
  CONFIG.Actor.documentClasses[PF1KS.kingdomSheetId] = KingdomActor;
  CONFIG.Actor.documentClasses[PF1KS.kingdomArmyId] = ArmyActor;
  CONFIG.Item.documentClasses[PF1KS.kingdomBuildingId] = BaseItem;
  CONFIG.Item.documentClasses[PF1KS.kingdomEventId] = BaseItem;
  CONFIG.Item.documentClasses[PF1KS.kingdomImprovementId] = BaseItem;
  CONFIG.Item.documentClasses[PF1KS.kingdomBoonId] = BaseItem;
  CONFIG.Item.documentClasses[PF1KS.kingdomSpecialId] = BaseItem;
  CONFIG.Item.documentClasses[PF1KS.kingdomTacticId] = BaseItem;

  pf1.documents.actor.KingdomActor = KingdomActor;
  pf1.documents.actor.ArmyActor = ArmyActor;
  pf1.documents.item.BuildingItem = BaseItem;
  pf1.documents.item.EventItem = BaseItem;
  pf1.documents.item.ImprovementItem = BaseItem;
  pf1.documents.item.BoonItem = BaseItem;
  pf1.documents.item.SpecialItem = BaseItem;
  pf1.documents.item.TacticItem = BaseItem;

  CONFIG.Actor.dataModels[PF1KS.kingdomSheetId] = KingdomModel;
  CONFIG.Actor.dataModels[PF1KS.kingdomArmyId] = ArmyModel;
  CONFIG.Item.dataModels[PF1KS.kingdomBuildingId] = BuildingModel;
  CONFIG.Item.dataModels[PF1KS.kingdomEventId] = EventModel;
  CONFIG.Item.dataModels[PF1KS.kingdomImprovementId] = ImprovementModel;
  CONFIG.Item.dataModels[PF1KS.kingdomBoonId] = BoonModel;
  CONFIG.Item.dataModels[PF1KS.kingdomSpecialId] = SpecialModel;
  CONFIG.Item.dataModels[PF1KS.kingdomTacticId] = TacticModel;

  pf1.applications.actor.KingdomSheet = KingdomSheet;
  pf1.applications.actor.ArmySheet = ArmySheet;
  pf1.applications.item.BuildingSheet = BuildingSheet;
  pf1.applications.item.EventSheet = EventSheet;
  pf1.applications.item.ImprovementSheet = ImprovementSheet;
  pf1.applications.item.BoonSheet = BoonSheet;
  pf1.applications.item.SpecialSheet = SpecialSheet;
  pf1.applications.item.TacticSheet = TacticSheet;

  Actors.registerSheet(PF1KS.CFG.id, KingdomSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Kingdom"),
    types: [PF1KS.kingdomSheetId],
    makeDefault: true,
  });
  Actors.registerSheet(PF1KS.CFG.id, ArmySheet, {
    label: game.i18n.localize("PF1KS.Sheet.Army"),
    types: [PF1KS.kingdomArmyId],
    makeDefault: true,
  });
  Items.registerSheet(PF1KS.CFG.id, BuildingSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Building"),
    types: [PF1KS.kingdomBuildingId],
    makeDefault: true,
  });
  Items.registerSheet(PF1KS.CFG.id, EventSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Event"),
    types: [PF1KS.kingdomEventId],
    makeDefault: true,
  });
  Items.registerSheet(PF1KS.CFG.id, ImprovementSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Improvement"),
    types: [PF1KS.kingdomImprovementId],
    makeDefault: true,
  });
  Items.registerSheet(PF1KS.CFG.id, BoonSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Boon"),
    types: [PF1KS.kingdomBoonId],
    makeDefault: true,
  });
  Items.registerSheet(PF1KS.CFG.id, SpecialSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Special"),
    types: [PF1KS.kingdomSpecialId],
    makeDefault: true,
  });
  Items.registerSheet(PF1KS.CFG.id, TacticSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Tactic"),
    types: [PF1KS.kingdomTacticId],
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
});

Hooks.once("ready", () => {
  if (!game.modules.get("lib-wrapper")?.active && game.user.isGM) {
    ui.notifications.error("Module XYZ requires the 'libWrapper' module. Please install and activate it."); // TODO
  }

  loadTemplates({
    "kingdom-sheet-armies": `modules/${PF1KS.CFG.id}/templates/actors/kingdom/parts/armies.hbs`,
    "kingdom-sheet-settings": `modules/${PF1KS.CFG.id}/templates/actors/kingdom/parts/settings.hbs`,
    "kingdom-sheet-events": `modules/${PF1KS.CFG.id}/templates/actors/kingdom/parts/events.hbs`,
    "kingdom-sheet-leadership": `modules/${PF1KS.CFG.id}/templates/actors/kingdom/parts/leadership.hbs`,
    "kingdom-sheet-settlements": `modules/${PF1KS.CFG.id}/templates/actors/kingdom/parts/settlements.hbs`,
    "kingdom-sheet-summary": `modules/${PF1KS.CFG.id}/templates/actors/kingdom/parts/summary.hbs`,
    "kingdom-sheet-terrain": `modules/${PF1KS.CFG.id}/templates/actors/kingdom/parts/terrain.hbs`,

    "army-sheet-summary": `modules/${PF1KS.CFG.id}/templates/actors/army/parts/summary.hbs`,
    "army-sheet-features": `modules/${PF1KS.CFG.id}/templates/actors/army/parts/features.hbs`,
    "army-sheet-commander": `modules/${PF1KS.CFG.id}/templates/actors/army/parts/commander.hbs`,

    "item-sheet-building": `modules/${PF1KS.CFG.id}/templates/items/parts/building-details.hbs`,
    "item-sheet-event": `modules/${PF1KS.CFG.id}/templates/items/parts/event-details.hbs`,
    "item-sheet-improvement": `modules/${PF1KS.CFG.id}/templates/items/parts/improvement-details.hbs`,
    "item-sheet-boon": `modules/${PF1KS.CFG.id}/templates/items/parts/boon-details.hbs`,
    "item-sheet-special": `modules/${PF1KS.CFG.id}/templates/items/parts/special-details.hbs`,
    "item-sheet-tactic": `modules/${PF1KS.CFG.id}/templates/items/parts/tactic-details.hbs`,

    "item-sheet-changes": `modules/${PF1KS.CFG.id}/templates/items/parts/changes.hbs`,
  });

  pf1.applications.compendiums.boon = new BoonBrowser();
  pf1.applications.compendiums.tactic = new TacticBrowser();
  pf1.applications.compendiums.special = new SpecialBrowser();

  pf1.applications.compendiumBrowser.boon = BoonBrowser;
  pf1.applications.compendiumBrowser.tactic = TacticBrowser;
  pf1.applications.compendiumBrowser.special = SpecialBrowser;

  game.model.Item[PF1KS.kingdomBoonId] = {};
  game.model.Item[PF1KS.kingdomTacticId] = {};
  game.model.Item[PF1KS.kingdomSpecialId] = {};
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
    "terrainTypes",
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

  for (let o of toLocalize) {
    pf1ks.config[o] = doLocalize(pf1ks.config[o], o);
  }
});
