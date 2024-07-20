import { kingdomSheetId, CFG, kingdomEventId, kingdomBuildingId, kingdomImprovementId } from "./config.mjs";
import { BuildingSheet } from "./documents/buildingSheet.mjs";
import { EventSheet } from "./documents/eventSheet.mjs";
import { ImprovementSheet } from "./documents/improvementSheet.mjs";
import { KingdomSheet } from "./documents/kingdomSheet.mjs";
import { BuildingModel } from "./models/buildingModel.mjs";
import { EventModel } from "./models/eventModel.mjs";
import { ImprovementModel } from "./models/improvementModel.mjs";
import { KingdomModel } from "./models/kingdomModel.mjs";

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
  CONFIG.Item.dataModels[kingdomEventId] = EventModel;
  CONFIG.Item.dataModels[kingdomBuildingId] = BuildingModel;
  CONFIG.Item.dataModels[kingdomImprovementId] = ImprovementModel;

  Actors.registerSheet(CFG.id, KingdomSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Kingdom"),
    types: [kingdomSheetId],
    makeDefault: true,
  });
  Items.registerSheet(CFG.id, EventSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Event"),
    types: [kingdomEventId],
    makeDefault: true,
  });
  Items.registerSheet(CFG.id, BuildingSheet, {
    label: game.i18n.localize("PF1KS.Sheet.Building"),
    types: [kingdomBuildingId],
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
    "tooltip-content": `modules/${CFG.id}/templates/actors/parts/tooltip-content.hbs`,
    "item-sheet-building": `modules/${CFG.id}/templates/items/parts/building-details.hbs`,
    "item-sheet-event": `modules/${CFG.id}/templates/items/parts/event-details.hbs`,
    "item-sheet-improvement": `modules/${CFG.id}/templates/items/parts/improvement-details.hbs`,
  });
});
