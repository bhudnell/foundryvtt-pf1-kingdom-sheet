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
} from "./config.mjs";

export const defaultIcons = {
  actors: {
    [kingdomId]: "icons/svg/city.svg", // TODO settlementId
    [armyId]: "icons/svg/combat.svg",
  },
  items: {
    [buildingId]: "icons/svg/house.svg",
    [kingdomEventId]: "icons/svg/clockwork.svg",
    [settlementEventId]: "icons/svg/clockwork.svg", // TODO should this be different
    [improvementId]: "icons/svg/windmill.svg",
    [featureId]: "icons/svg/coins.svg",
    [boonId]: "icons/svg/upgrade.svg",
    [specialId]: "icons/svg/daze.svg",
    [tacticId]: "icons/svg/target.svg",
  },
};
