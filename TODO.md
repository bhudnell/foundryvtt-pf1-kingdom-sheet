# For future releases

## Misc
- clean up compendium extraction (especially journals)
- add `description.unidentified` to itemBaseModel and break description out like system items
- Auto Unrest (on drop and continuous)
  - add settings for each type
  - add handling for each type
  - add default continuous changes for vacancies
- Print control DC on economy/loyalty/stability checks
- other optional rules: https://aonprd.com/Rules.aspx?ID=1547
  - abandoned buildings
  - deities and holy sites
  - special edicts
- read through items and see if any rolls can be automated (ie economic boom)
- when event added, auto fill in turn with current kingdom turn

## Change editor dialog
- maybe I can clean this up to hide unused fields
  - type

## Building grid logic
- toggle for "can overlap" so things like cistern or magical streetlamps can be shown
  - optional list to limit to certain building types
  - must be able to handle lotless and lotted buildings
- follows building limits (ie must be next to X, cannot be next to Y, limit Z per settlement/district)

## Hex map
- remove all improvement item things
  - compendium
  - kingdom logic
  - rules
  - will need to leave the item type/changes/context notes around so the migration can run
    remove item type in a later version

- new terrain logic for kingdom sheet
  - for all scenes, get the hexes flag and create changes based on that
  - I think we can keep the same UI, it'll just be read only and be populated from hex data

- better edit dialog -> turn into a sheet like system ChangeEditor
- better tooltip
- make hex editing a setting
- create a log of the number of each terrain type and all improvements
- migration
- localize all strings

## for terrain changes
- get improvement changes
  - function applyBaseMechanics(improvementId, context) {
  const improvement = terrainImprovements[improvementId];

  return improvement.mechanics?.changes ?? [];
}
- get terrain changes
  - applySpecialTerrainEffects()
- merge all together
  - export function computeHexEffects(hex, context) {
  const results = [];

  // 1. base improvement effects
  for (const imp of hex.improvements ?? []) {
    results.push(...applyBaseMechanics(imp, context));
  }

  // 2. terrain-based modifiers
  results.push(...applyTerrainInteractions(hex, context));

  return results;
}
- merge all changes of same target together when collapseTooltips is checked