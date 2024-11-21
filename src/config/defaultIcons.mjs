import {
  kingdomArmyId,
  kingdomBoonId,
  kingdomBuildingId,
  kingdomEventId,
  kingdomImprovementId,
  kingdomSheetId,
  kingdomSpecialId,
  kingdomTacticId,
} from "./config.mjs";

export const defaultIcons = {
  actors: {
    [kingdomSheetId]: "icons/svg/city.svg",
    [kingdomArmyId]: "icons/svg/combat.svg",
  },
  items: {
    [kingdomBuildingId]: "icons/svg/house.svg",
    [kingdomEventId]: "icons/svg/clockwork.svg",
    [kingdomImprovementId]: "icons/svg/windmill.svg",
    [kingdomBoonId]: "icons/svg/upgrade.svg",
    [kingdomSpecialId]: "icons/svg/daze.svg",
    [kingdomTacticId]: "icons/svg/target.svg",
  },
};
