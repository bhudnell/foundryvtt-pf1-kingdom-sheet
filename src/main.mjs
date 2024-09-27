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
} from "./config.mjs";
import { ArmyModel } from "./models/actors/armyModel.mjs";
import { KingdomModel } from "./models/actors/kingdomModel.mjs";
import { BoonModel } from "./models/items/boonModel.mjs";
import { BuildingModel } from "./models/items/buildingModel.mjs";
import { EventModel } from "./models/items/eventModel.mjs";
import { ImprovementModel } from "./models/items/improvementModel.mjs";
import { SpecialModel } from "./models/items/specialModel.mjs";
import { TacticModel } from "./models/items/tacticModel.mjs";
import { ArmySheet } from "./sheets/actors/armySheet.mjs";
import { KingdomSheet } from "./sheets/actors/kingdomSheet.mjs";
import { BoonSheet } from "./sheets/items/boonSheet.mjs";
import { BuildingSheet } from "./sheets/items/buildingSheet.mjs";
import { EventSheet } from "./sheets/items/eventSheet.mjs";
import { ImprovementSheet } from "./sheets/items/improvementSheet.mjs";
import { SpecialSheet } from "./sheets/items/specialSheet.mjs";
import { TacticSheet } from "./sheets/items/tacticSheet.mjs";

Hooks.on("preCreateItem", (item, data, context, user) => {
  if (!item.actor) {
    return;
  }

  if ([kingdomBuildingId, kingdomEventId, kingdomImprovementId].includes(item.type)) {
    if (![kingdomSheetId, kingdomArmyId].includes(item.actor.type)) {
      ui.notifications.error(`"${item.actor.type}" actor can't have Kingdom items`);
      return false;
    }
  }

  // kingdom
  if (![kingdomBuildingId, kingdomEventId, kingdomImprovementId].includes(item.type)) {
    if (item.actor.type === kingdomSheetId) {
      ui.notifications.error(`"${item.actor.type}" actor can only have Kingdom items`);
      return false;
    }
  }

  //army
  if (![kingdomBoonId, kingdomSpecialId, kingdomTacticId].includes(item.type)) {
    if (item.actor.type === kingdomArmyId) {
      ui.notifications.error(`"${item.actor.type}" actor can only have Army items`);
      return false;
    }
  }
});

Hooks.once("init", () => {
  CONFIG.Actor.dataModels[kingdomSheetId] = KingdomModel;
  CONFIG.Actor.dataModels[kingdomArmyId] = ArmyModel;
  CONFIG.Item.dataModels[kingdomBuildingId] = BuildingModel;
  CONFIG.Item.dataModels[kingdomEventId] = EventModel;
  CONFIG.Item.dataModels[kingdomImprovementId] = ImprovementModel;
  CONFIG.Item.dataModels[kingdomBoonId] = BoonModel;
  CONFIG.Item.dataModels[kingdomSpecialId] = SpecialModel;
  CONFIG.Item.dataModels[kingdomTacticId] = TacticModel;

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
});

// TODO
// Hooks.on("renderChatMessage", (message, html) => {
//   if (message.flags?.[CFG.id]?.eventChanceCard) {
//     html.find("button.roll-event").on("click", (e) => rollEventTable(e, message));
//   }
// });

// TODO after next pf1 version bump
// Hooks.on("renderTooltipPF", async (app, html, data) => {
//   if (data.type === kingdomArmyId) {
//     console.log("render army");
//   } else if (data.type === kingdomSheetId) {
//     console.log("render kingdom");
//   }
// });

Hooks.once("ready", () => {
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
