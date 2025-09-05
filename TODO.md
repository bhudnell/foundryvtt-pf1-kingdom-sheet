- clean up compendium extraction (especially journals and scenes)

# Improvements

- Auto Unrest (on drop and continuous)
  - add settings for each type
  - add handling for each type
  - add default continuous changes for vacancies
- Print control DC on economy/loyalty/stability checks
- other optional rules: https://aonprd.com/Rules.aspx?ID=1547
  - abandoned buildings
  - deities and holy sites
  - special edicts

# Settlement Rework
- move settlement/district delete icons into tab itself (like source editior dialog)

# District stuff
- Add/delete district buttons need to be hooked up
- terrain type for each district border
- should streets/sewers/walls be checkboxes or leave as items?

# building logic
- building drag/drop is scuffed and needs to be fixed
- lotless buildings need to include buildings where x or y are blank
- highlighting for dragging
  - dont show highlights for lot size/height/width = 0
- toggle for "can overlap" so things like cistern or magical streetlamps can be shown
  - optional list to limit to certain building types
  - must be able to handle lotless and lotted buildings
- follows building limits (ie must be next to X, cannot be next to Y, limit Z per settlement/district)

# building stuff
- what to do when a settlement/district is deleted? remove all buildings associated with it?

# for the future:
- break settlements out into their own actor types
  - current settlements tab will become settlement actor sheet
  - new settlements tab will just show the settlements' contrbutions to kingdom stats,
    maybe some other info too
- buildings and settlement feature items should lose the settlementId data

# Documentation
- explain that max base value and purchase limit should be assumed to be percentage
  increases/decreases and the percentages are all added up before being applied
  example: change value of 50 should equate to a 50% increase, -30 should be a 30% decrease
           the overall effect is a 20% increase
