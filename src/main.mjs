import {
  kingdomSheetId,
  CFG,
  kingdomEventId,
  kingdomBuildingId,
  kingdomImprovementId,
  kingdomArmyId,
} from "./config.mjs";
import { KingdomSheet } from "./documents/actors/kingdomSheet.mjs";
import { ArmySheet } from "./documents/items/armySheet.mjs";
import { BuildingSheet } from "./documents/items/buildingSheet.mjs";
import { EventSheet } from "./documents/items/eventSheet.mjs";
import { ImprovementSheet } from "./documents/items/improvementSheet.mjs";
import { KingdomModel } from "./models/actors/kingdomModel.mjs";
import { ArmyModel } from "./models/items/armyModel.mjs";
import { BuildingModel } from "./models/items/buildingModel.mjs";
import { EventModel } from "./models/items/eventModel.mjs";
import { ImprovementModel } from "./models/items/improvementModel.mjs";

Hooks.on("preCreateItem", (item, data, context, user) => {
  if (!item.actor) {
    return;
  }

  if ([kingdomEventId, kingdomBuildingId, kingdomImprovementId].includes(item.type)) {
    if (item.actor.type !== kingdomSheetId) {
      ui.notifications.error(`"${item.actor.type}" actor can't have Kingdom items`);
      return false;
    }
  }

  if (![kingdomEventId, kingdomBuildingId, kingdomImprovementId].includes(item.type)) {
    if (item.actor.type === kingdomSheetId) {
      ui.notifications.error(`"${item.actor.type}" actor can only have Kingdom items`);
      return false;
    }
  }
});

Hooks.once("init", () => {
  CONFIG.Actor.dataModels[kingdomSheetId] = KingdomModel;
  CONFIG.Item.dataModels[kingdomArmyId] = ArmyModel;
  CONFIG.Item.dataModels[kingdomBuildingId] = BuildingModel;
  CONFIG.Item.dataModels[kingdomEventId] = EventModel;
  CONFIG.Item.dataModels[kingdomImprovementId] = ImprovementModel;

  Actors.registerSheet(CFG.id, KingdomSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Kingdom"),
    types: [kingdomSheetId],
    makeDefault: true,
  });
  Items.registerSheet(CFG.id, ArmySheet, {
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
});

// TODO
// Hooks.on("renderChatMessage", (message, html) => {
//   if (message.flags?.[CFG.id]?.eventChanceCard) {
//     html.find("button.roll-event").on("click", (e) => rollEventTable(e, message));
//   }
// });

Hooks.once("ready", () => {
  loadTemplates({
    "kingdom-sheet-summary": `modules/${CFG.id}/templates/actors/parts/summary.hbs`,
    "kingdom-sheet-leadership": `modules/${CFG.id}/templates/actors/parts/leadership.hbs`,
    "kingdom-sheet-settlements": `modules/${CFG.id}/templates/actors/parts/settlements.hbs`,
    "kingdom-sheet-terrain": `modules/${CFG.id}/templates/actors/parts/terrain.hbs`,
    "kingdom-sheet-events": `modules/${CFG.id}/templates/actors/parts/events.hbs`,
    "kingdom-sheet-config": `modules/${CFG.id}/templates/actors/parts/config.hbs`,
    "tooltip-content": `modules/${CFG.id}/templates/actors/parts/tooltip-content.hbs`,
    "item-sheet-army": `modules/${CFG.id}/templates/items/parts/army-details.hbs`,
    "item-sheet-building": `modules/${CFG.id}/templates/items/parts/building-details.hbs`,
    "item-sheet-event": `modules/${CFG.id}/templates/items/parts/event-details.hbs`,
    "item-sheet-improvement": `modules/${CFG.id}/templates/items/parts/improvement-details.hbs`,
    "item-sheet-changes": `modules/${CFG.id}/templates/items/parts/changes.hbs`,
  });
});
