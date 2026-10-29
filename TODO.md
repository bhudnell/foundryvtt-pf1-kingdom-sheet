# For future releases

## Misc

- clean up compendium extraction (especially journals)
- add `description.unidentified` to itemBaseModel and break description out like system items
- Print control DC on economy/loyalty/stability checks
- other optional rules: https://aonprd.com/Rules.aspx?ID=1547
  - abandoned buildings
  - deities and holy sites
  - special edicts
- read through items and see if any rolls can be automated (ie economic boom)

## Change editor dialog

- maybe I can clean this up to hide unused fields
  - type

## Building grid logic

- toggle for "can overlap" so things like cistern or magical streetlamps can be shown
  - optional list to limit to certain building types
  - must be able to handle lotless and lotted buildings
- follows building limits (ie must be next to X, cannot be next to Y, limit Z per settlement/district)

## Kingdom Log

- Things that log
  - updating turm (creates a new entry)
  - any other updates to kingdom or linked settlements
  - dropping an event, building, or feature (linked settlements only)
  - updating hexes -> adding/removing from kingdom or improvement changes while in kingdom
- Should we create a journal and make each turn an entry? Or make it part of the kingdom data?

## Building discounts

- Each building can provide only 1 discount. Some buildings just have more options for the discount
- discounts are held at the settlement level
- world setting to turn on/off
- Create a discount data model
  - used on
  - options
- dropping a building with a discount adds the discount to the discount list
- dropping a building that can claim a discount does and updates the discount

# Automations

- Dropping buildings deducts BP
- Auto Unrest (on drop and continuous)
  - add settings for each type
  - add handling for each type
  - add default continuous changes for vacancies