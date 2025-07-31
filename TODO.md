- clean up compendium extraction (especially journals and scenes)

# Improvements

- Auto Unrest (on drop and continuous)
  - add settings for each type
  - add handling for each type
  - add default continuous changes for vacancies
- Print control DC on economy/loyalty/stability checks


# Settlement Rework
- settlement governments
- add purchase limit
- tab for qualities/disadvantages
- new modifiers
  - spellcasting
  - purchase limit
- districts should get a name as well
- new setting? what should go behind it? settlement government, purchase limit, spellcasting

## building logic
- drop outside of settlement tab -> should appear in the "buildings without settlements" subtab
- drop in settlement but not in grid -> should appear in settlement's "buildings without districts" subtab
- drop in grid -> goes where dropped
  - buildings with 0 area (lots/width/height === 0) -> appear in districts "lotless buildings" list below grid
    - buildings with lots > 0 but width/height === 0 should have an indicator that they need to be placed in the grid
- highlighting for dragging