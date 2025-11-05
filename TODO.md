# For current release

## District stuff
- should buildings have quantity?
  - if not, I need to add something to the migration to spawn new items equal to current
    quantity - 1
- invalid buildings do not add their bonuses to things
  - population due to lot size

## General stuff
- refactor settlements hbs file to make it less huge
- expanded settlement modifiers journal
- All existing TODOs in code

## Documentation
- explain that max base value and purchase limit should be assumed to be percentage
  increases/decreases and the percentages are all added up before being applied
  example: change value of 50 should equate to a 50% increase, -30 should be a 30% decrease
           the overall effect is a 20% increase
- update settlement delete string to say that all associated buildings and features will be
  deleted too
- doc for right clicking buildings in grid to get context menu




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

## Change editor dialog
- maybe I can clean this up to hide unused fields
  - type
  - priority?
  - operator?

## Settlement Features (changes)
- add magic item availability (see impoverished disadvantage)

## Building grid logic
- toggle for "can overlap" so things like cistern or magical streetlamps can be shown
  - optional list to limit to certain building types
  - must be able to handle lotless and lotted buildings
- follows building limits (ie must be next to X, cannot be next to Y, limit Z per settlement/district)

## Settlement actor
- break settlements out into their own actor types
  - current settlements tab will become settlement actor sheet
  - new settlements tab will just show the settlements' contrbutions to kingdom stats,
    maybe some other info too
- buildings and settlement feature items should lose the settlementId data
- how to break up settings and how will that all work
- add a toggle for buildings providing magic items (as currently is) or base for settlement of given size
  - could be called "simple settlement"
  - wouldnt allow the settlement to be linked to a kingdom?

## Settlement and Army actors
- should they have a "parent" field? when dragged onto a kingdom, logic:
  - if no parent (hasnt been added to a kingdom yet)
    - create the proxy item on the parent
    - add the parent's id to the parent field
  - if parent
    - error saying this actor has already been linked to a kingdom
  - when deleting proxy items
    - set parent of linked actor (settlement/army) to null to complete unlinking