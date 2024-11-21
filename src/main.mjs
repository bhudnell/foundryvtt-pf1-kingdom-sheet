import { ArmySheet } from "./applications/actors/armySheet.mjs";
import { KingdomSheet } from "./applications/actors/kingdomSheet.mjs";
import { BoonSheet } from "./applications/items/boonSheet.mjs";
import { BuildingSheet } from "./applications/items/buildingSheet.mjs";
import { EventSheet } from "./applications/items/eventSheet.mjs";
import { ImprovementSheet } from "./applications/items/improvementSheet.mjs";
import { SpecialSheet } from "./applications/items/specialSheet.mjs";
import { TacticSheet } from "./applications/items/tacticSheet.mjs";
import * as Config from "./config/_module.mjs";
import {
  kingdomSheetId,
  CFG,
  kingdomEventId,
  kingdomBuildingId,
  kingdomImprovementId,
  kingdomArmyId,
  kingdomBoonId,
  kingdomSpecialId,
  kingdomTacticId,
  eventSubTypes,
  improvementSubTypes,
  armyItemTypes,
  kingdomItemTypes,
} from "./config/config.mjs";
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
import { rollEventTable } from "./util/utils.mjs";

Hooks.on("preCreateItem", (item, data, context, user) => {
  if (!item.actor) {
    return;
  }

  // non module actors
  if (
    ![kingdomSheetId, kingdomArmyId].includes(item.actor.type) &&
    [...kingdomItemTypes, ...armyItemTypes].includes(item.type)
  ) {
    ui.notifications.error("PF1KS.NoKingdomOrArmyItemsOnActor", { localize: true }); // TODO add to en.json
    return false;
  }

  // kingdom actors
  if (item.actor.type === kingdomSheetId && !kingdomItemTypes.includes(item.type)) {
    ui.notifications.error("PF1KS.OnlyKingdomItemsOnActor", { localize: true });
    return false;
  }

  // army actors
  if (item.actor.type === kingdomArmyId && !armyItemTypes.includes(item.type)) {
    ui.notifications.error("PF1KS.OnlyArmyItemsOnActor", { localize: true });
    return false;
  }
});

Hooks.once("libWrapper.Ready", () => {
  console.log(`${CFG.id} | Registering LibWrapper Hooks`);

  libWrapper.register(
    CFG.id,
    "TokenHUD.prototype._getStatusEffectChoices",
    function (wrapper) {
      if (this.object.actor.type === kingdomSheetId) {
        return {}; // TODO any conditions?
      }
      if (this.object.actor.type === kingdomArmyId) {
        return {}; // TODO add battlefield conditions https://www.aonprd.com/Rules.aspx?ID=1575
      }
      return wrapper();
    },
    libWrapper.MIXED
  );

  libWrapper.register(
    CFG.id,
    "pf1.applications.item.CreateDialog.prototype.getSubtypes",
    function (wrapper, type) {
      switch (type) {
        case kingdomBoonId:
        case kingdomBuildingId:
        case kingdomSpecialId:
        case kingdomTacticId:
          return null;

        case kingdomEventId:
          return eventSubTypes;

        case kingdomImprovementId:
          return improvementSubTypes;

        default:
          return wrapper(type);
      }
    },
    libWrapper.MIXED
  );
});

Hooks.on("pf1GetChangeFlat", getChangeFlat);

Hooks.on("renderChatMessage", (message, html) => {
  if (message.flags?.[CFG.id]?.eventChanceCard) {
    html.find("button.roll-event").on("click", (e) => rollEventTable(e, message));
  }
});

Hooks.once("init", () => {
  CONFIG.Actor.documentClasses[kingdomSheetId] = KingdomActor;
  CONFIG.Actor.documentClasses[kingdomArmyId] = ArmyActor;
  CONFIG.Item.documentClasses[kingdomBuildingId] = BaseItem;
  CONFIG.Item.documentClasses[kingdomEventId] = BaseItem;
  CONFIG.Item.documentClasses[kingdomImprovementId] = BaseItem;
  CONFIG.Item.documentClasses[kingdomBoonId] = BaseItem;
  CONFIG.Item.documentClasses[kingdomSpecialId] = BaseItem;
  CONFIG.Item.documentClasses[kingdomTacticId] = BaseItem;

  pf1.documents.actor.KingdomActor = KingdomActor;
  pf1.documents.actor.ArmyActor = ArmyActor;
  pf1.documents.item.BuildingItem = BaseItem;
  pf1.documents.item.EventItem = BaseItem;
  pf1.documents.item.ImprovementItem = BaseItem;
  pf1.documents.item.BoonItem = BaseItem;
  pf1.documents.item.SpecialItem = BaseItem;
  pf1.documents.item.TacticItem = BaseItem;

  CONFIG.Actor.dataModels[kingdomSheetId] = KingdomModel;
  CONFIG.Actor.dataModels[kingdomArmyId] = ArmyModel;
  CONFIG.Item.dataModels[kingdomBuildingId] = BuildingModel;
  CONFIG.Item.dataModels[kingdomEventId] = EventModel;
  CONFIG.Item.dataModels[kingdomImprovementId] = ImprovementModel;
  CONFIG.Item.dataModels[kingdomBoonId] = BoonModel;
  CONFIG.Item.dataModels[kingdomSpecialId] = SpecialModel;
  CONFIG.Item.dataModels[kingdomTacticId] = TacticModel;

  pf1.applications.actor.KingdomSheet = KingdomSheet;
  pf1.applications.actor.ArmySheet = ArmySheet;
  pf1.applications.item.BuildingSheet = BuildingSheet;
  pf1.applications.item.EventSheet = EventSheet;
  pf1.applications.item.ImprovementSheet = ImprovementSheet;
  pf1.applications.item.BoonSheet = BoonSheet;
  pf1.applications.item.SpecialSheet = SpecialSheet;
  pf1.applications.item.TacticSheet = TacticSheet;

  Actors.registerSheet(CFG.id, KingdomSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Kingdom"),
    types: [kingdomSheetId],
    makeDefault: true,
  });
  Actors.registerSheet(CFG.id, ArmySheet, {
    label: game.i18n.localize("PF1KS.Sheet.Army"),
    types: [kingdomArmyId],
    makeDefault: true,
  });
  Items.registerSheet(CFG.id, BuildingSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Building"),
    types: [kingdomBuildingId],
    makeDefault: true,
  });
  Items.registerSheet(CFG.id, EventSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Event"),
    types: [kingdomEventId],
    makeDefault: true,
  });
  Items.registerSheet(CFG.id, ImprovementSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Improvement"),
    types: [kingdomImprovementId],
    makeDefault: true,
  });
  Items.registerSheet(CFG.id, BoonSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Boon"),
    types: [kingdomBoonId],
    makeDefault: true,
  });
  Items.registerSheet(CFG.id, SpecialSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Special"),
    types: [kingdomSpecialId],
    makeDefault: true,
  });
  Items.registerSheet(CFG.id, TacticSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Tactic"),
    types: [kingdomTacticId],
    makeDefault: true,
  });

  // remove module buff targets from non module items
  for (const prop of ["buffTargetCategories", "contextNoteCategories"]) {
    for (const categoryKey in pf1.config[prop]) {
      const category = pf1.config[prop][categoryKey];
      category.filters ??= {};
      category.filters.item ??= {};
      category.filters.item.exclude ??= [];
      category.filters.item.exclude.push(...kingdomItemTypes, ...armyItemTypes);
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
    "kingdom-sheet-armies": `modules/${CFG.id}/templates/actors/kingdom/parts/armies.hbs`,
    "kingdom-sheet-settings": `modules/${CFG.id}/templates/actors/kingdom/parts/settings.hbs`,
    "kingdom-sheet-events": `modules/${CFG.id}/templates/actors/kingdom/parts/events.hbs`,
    "kingdom-sheet-leadership": `modules/${CFG.id}/templates/actors/kingdom/parts/leadership.hbs`,
    "kingdom-sheet-settlements": `modules/${CFG.id}/templates/actors/kingdom/parts/settlements.hbs`,
    "kingdom-sheet-summary": `modules/${CFG.id}/templates/actors/kingdom/parts/summary.hbs`,
    "kingdom-sheet-terrain": `modules/${CFG.id}/templates/actors/kingdom/parts/terrain.hbs`,

    "army-sheet-summary": `modules/${CFG.id}/templates/actors/army/parts/summary.hbs`,
    "army-sheet-features": `modules/${CFG.id}/templates/actors/army/parts/features.hbs`,
    "army-sheet-commander": `modules/${CFG.id}/templates/actors/army/parts/commander.hbs`,

    // "tooltip-content": `modules/${CFG.id}/templates/actors/tooltip-content.hbs`, TODO needed?

    "item-sheet-building": `modules/${CFG.id}/templates/items/parts/building-details.hbs`,
    "item-sheet-event": `modules/${CFG.id}/templates/items/parts/event-details.hbs`,
    "item-sheet-improvement": `modules/${CFG.id}/templates/items/parts/improvement-details.hbs`,
    "item-sheet-boon": `modules/${CFG.id}/templates/items/parts/boon-details.hbs`,
    "item-sheet-special": `modules/${CFG.id}/templates/items/parts/special-details.hbs`,
    "item-sheet-tactic": `modules/${CFG.id}/templates/items/parts/tactic-details.hbs`,

    "item-sheet-changes": `modules/${CFG.id}/templates/items/parts/changes.hbs`,
  });
});
