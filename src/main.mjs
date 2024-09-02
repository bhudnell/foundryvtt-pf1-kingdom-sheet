import {
  kingdomSheetId,
  CFG,
  kingdomEventId,
  kingdomBuildingId,
  kingdomImprovementId,
  kingdomArmyId,
  kingdomBoonId,
  kingdomResourceId,
  kingdomSpecialId,
  kingdomTacticId,
} from "./config.mjs";
import { ArmyModel } from "./models/actors/armyModel.mjs";
import { KingdomModel } from "./models/actors/kingdomModel.mjs";
import { BuildingModel } from "./models/items/buildingModel.mjs";
import { EventModel } from "./models/items/eventModel.mjs";
import { ImprovementModel } from "./models/items/improvementModel.mjs";
import { ArmySheet } from "./sheets/actors/armySheet.mjs";
import { KingdomSheet } from "./sheets/actors/kingdomSheet.mjs";
import { BuildingSheet } from "./sheets/items/buildingSheet.mjs";
import { EventSheet } from "./sheets/items/eventSheet.mjs";
import { ImprovementSheet } from "./sheets/items/improvementSheet.mjs";

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
  if (![kingdomBoonId, kingdomResourceId, kingdomSpecialId, kingdomTacticId].includes(item.type)) {
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
});

// TODO
// Hooks.on("renderChatMessage", (message, html) => {
//   if (message.flags?.[CFG.id]?.eventChanceCard) {
//     html.find("button.roll-event").on("click", (e) => rollEventTable(e, message));
//   }
// });

// TODO this is its own module
// Hooks.on("renderCombatTracker", async (app, html, data) => {
//   let xpTotal = 0;
//   for (const combatant of data.combat.combatants) {
//     if (combatant.actor.type === "npc" && combatant.token.disposition === -1) {
//       xpTotal += combatant.actor.getCRExp(combatant.actor.system.details.cr.total);
//     }
//   }

//   const temp = pf1.config.CR_EXP_LEVELS.filter((xp) => xp <= xpTotal);
//   const approxCr = temp.length - 1;

//   const header = html.find(".combat-tracker-header");
//   header.append(`<div>Approx. CR: ${approxCr}</div>`);
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
    "kingdom-sheet-config": `modules/${CFG.id}/templates/actors/kingdom/parts/config.hbs`,
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
    "item-sheet-changes": `modules/${CFG.id}/templates/items/parts/changes.hbs`,
  });
});
