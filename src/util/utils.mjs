import { kingdomStats, miscChangeTargets, allSettlementModifiers, CFG } from "../config/config.mjs";

export function findLargestSmallerNumber(arr, num) {
  return arr
    .filter((value) => value < num) // Filter out numbers larger than or equal to the target
    .reduce((largest, current) => {
      return current > largest ? current : largest;
    }, -Infinity); // Initialize with a very small number
}

export function renameKeys(obj, keyMap) {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = keyMap[key] || key; // Use the new key if available, otherwise keep the old key
    acc[newKey] = obj[key];
    return acc;
  }, {});
}

export function getChangeCategories() {
  return [
    {
      key: "stats",
      label: game.i18n.localize("PF1KS.KingdomStat"),
      items: Object.entries(kingdomStats).map(([key, label]) => ({ key, label: game.i18n.localize(label) })),
    },
    {
      key: "modifiers",
      label: game.i18n.localize("PF1KS.SettlementModifiers"),
      items: Object.entries(allSettlementModifiers).map(([key, label]) => ({ key, label: game.i18n.localize(label) })),
    },
    {
      key: "misc",
      label: game.i18n.localize("PF1KS.Misc"),
      items: Object.entries(miscChangeTargets).map(([key, label]) => ({ key, label: game.i18n.localize(label) })),
    },
  ];
}

export async function rollEventTable(event, message) {
  event.preventDefault();

  const table = await fromUuid(`Compendium.${CFG.id}.roll-tables.RollTable.NT591DKj9zNeithf`);
  return table.draw();
}
