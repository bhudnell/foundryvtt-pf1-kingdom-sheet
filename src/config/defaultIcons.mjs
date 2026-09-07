import {
  armyId,
  boonId,
  buildingId,
  kingdomEventId,
  featureId,
  kingdomId,
  settlementEventId,
  specialId,
  tacticId,
  settlementId,
  settlementLiteId,
} from "./config.mjs";

export const defaultIcons = {
  actors: {
    [kingdomId]: "icons/svg/city.svg",
    [settlementId]: "icons/svg/village.svg",
    [settlementLiteId]: "icons/svg/temple.svg",
    [armyId]: "icons/svg/combat.svg",
  },
  items: {
    [buildingId]: "icons/svg/house.svg",
    [kingdomEventId]: "icons/svg/clockwork.svg",
    [settlementEventId]: "icons/svg/clockwork.svg",
    [featureId]: "icons/svg/coins.svg",
    [boonId]: "icons/svg/upgrade.svg",
    [specialId]: "icons/svg/daze.svg",
    [tacticId]: "icons/svg/target.svg",
  },
};
