import {
  armyId,
  boonId,
  buildingId,
  kingdomEventId,
  featureId,
  improvementId,
  kingdomId,
  settlementEventId,
  specialId,
  tacticId,
  settlementId,
} from "./config.mjs";

export const defaultIcons = {
  actors: {
    [kingdomId]: "icons/svg/city.svg",
    [settlementId]: "icons/svg/village.svg",
    [armyId]: "icons/svg/combat.svg",
  },
  items: {
    [buildingId]: "icons/svg/house.svg",
    [kingdomEventId]: "icons/svg/clockwork.svg",
    [settlementEventId]: "icons/svg/clockwork.svg",
    [improvementId]: "icons/svg/windmill.svg",
    [featureId]: "icons/svg/coins.svg",
    [boonId]: "icons/svg/upgrade.svg",
    [specialId]: "icons/svg/daze.svg",
    [tacticId]: "icons/svg/target.svg",
  },
};
