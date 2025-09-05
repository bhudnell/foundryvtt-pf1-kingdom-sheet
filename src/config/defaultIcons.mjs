import {
  armyId,
  boonId,
  buildingId,
  eventId,
  featureId,
  improvementId,
  kingdomId,
  specialId,
  tacticId,
} from "./config.mjs";

export const defaultIcons = {
  actors: {
    [kingdomId]: "icons/svg/city.svg",
    [armyId]: "icons/svg/combat.svg",
  },
  items: {
    [buildingId]: "icons/svg/house.svg",
    [eventId]: "icons/svg/clockwork.svg",
    [improvementId]: "icons/svg/windmill.svg",
    [featureId]: "icons/svg/coins.svg",
    [boonId]: "icons/svg/upgrade.svg",
    [specialId]: "icons/svg/daze.svg",
    [tacticId]: "icons/svg/target.svg",
  },
};
