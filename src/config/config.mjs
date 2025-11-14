export const moduleId = "pf1-kingdom-sheet";
export const changePrefix = "pf1ks";

export const kingdomId = `${moduleId}.kingdom`;
export const armyId = `${moduleId}.army`;

export const buildingId = `${moduleId}.building`;
export const eventId = `${moduleId}.event`;
export const improvementId = `${moduleId}.improvement`;
export const featureId = `${moduleId}.feature`;
export const boonId = `${moduleId}.boon`;
export const specialId = `${moduleId}.special`;
export const tacticId = `${moduleId}.tactic`;

export const kingdomItemTypes = [buildingId, eventId, improvementId, featureId];
export const armyItemTypes = [boonId, specialId, tacticId];

export const kingdomStats = {
  economy: "PF1KS.Economy",
  loyalty: "PF1KS.Loyalty",
  stability: "PF1KS.Stability",
};

export const actionsPerTurn = {
  0: {
    fame: 1,
    hexes: 1,
    settlements: 1,
    buildings: 1,
    improvements: 2,
  },
  10: {
    fame: 2,
    hexes: 2,
    settlements: 1,
    buildings: 2,
    improvements: 3,
  },
  25: {
    fame: 3,
    hexes: 3,
    settlements: 1,
    buildings: 5,
    improvements: 5,
  },
  50: {
    fame: 4,
    hexes: 4,
    settlements: 2,
    buildings: 10,
    improvements: 7,
  },
  100: {
    fame: 5,
    hexes: 8,
    settlements: 3,
    buildings: 20,
    improvements: 9,
  },
  200: {
    fame: 6,
    hexes: 12,
    settlements: 4,
    buildings: Infinity,
    improvements: 12,
  },
};

export const actionsPerTurnLabels = {
  fame: "PF1KS.Fame",
  hexes: "PF1KS.HexClaims",
  settlements: "PF1KS.SettlementsOrArmies",
  buildings: "PF1KS.Buildings",
  improvements: "PF1KS.Improvements",
};

export const kingdomGovernments = {
  aut: "PF1KS.Government.Autocracy",
  mag: "PF1KS.Government.Magocracy",
  oli: "PF1KS.Government.Oligarchy",
  ove: "PF1KS.Government.Overlord",
  rep: "PF1KS.Government.Republic",
  sec: "PF1KS.Government.SecretSyndicate",
  the: "PF1KS.Government.Theocracy",
};

export const kingdomGovernmentBonuses = {
  aut: { corruption: 0, crime: 0, productivity: 0, law: 0, lore: 0, society: 0 },
  mag: { corruption: 0, crime: 0, productivity: -1, law: 0, lore: 2, society: -1 },
  oli: { corruption: 1, crime: 0, productivity: 0, law: -1, lore: -1, society: 1 },
  ove: { corruption: 1, crime: -1, productivity: 0, law: 1, lore: 0, society: -1 },
  rep: { corruption: 0, crime: -1, productivity: 1, law: -1, lore: 0, society: 1 },
  sec: { corruption: 1, crime: 1, productivity: 1, law: -3, lore: 0, society: 0 },
  the: { corruption: -1, crime: 0, productivity: 0, law: 1, lore: 1, society: -1 },
};

export const settlementGovernments = {
  aut: "PF1KS.Government.Autocracy",
  cou: "PF1KS.Government.Council",
  mag: "PF1KS.Government.Magical",
  ove: "PF1KS.Government.Overlord",
  sec: "PF1KS.Government.SecretSyndicate",
};

export const settlementGovernmentBonuses = {
  aut: { corruption: 0, crime: 0, productivity: 0, law: 0, lore: 0, society: 0, spellcasting: 0 },
  cou: { corruption: 0, crime: 0, productivity: 0, law: -2, lore: -2, society: 4, spellcasting: 0 },
  mag: { corruption: -2, crime: 0, productivity: 0, law: 0, lore: 2, society: -2, spellcasting: 1 },
  ove: { corruption: 2, crime: -2, productivity: 0, law: 2, lore: 0, society: -2, spellcasting: 0 },
  sec: { corruption: 2, crime: 2, productivity: 2, law: -6, lore: 0, society: 0, spellcasting: 0 },
};

export const alignmentEffects = {
  lg: {
    economy: 2,
    loyalty: 2,
    law: 1,
    society: 1,
  },
  ng: {
    loyalty: 2,
    stability: 2,
    lore: 1,
    society: 1,
  },
  cg: {
    loyalty: 4,
    crime: 1,
    society: 1,
  },
  ln: {
    economy: 2,
    stability: 2,
    law: 1,
    lore: 1,
  },
  tn: {
    stability: 4,
    lore: 2,
  },
  cn: {
    loyalty: 2,
    stability: 2,
    crime: 1,
    lore: 1,
  },
  le: {
    economy: 4,
    corruption: 1,
    law: 1,
  },
  ne: {
    economy: 2,
    stability: 2,
    corruption: 1,
    lore: 1,
  },
  ce: {
    economy: 2,
    loyalty: 2,
    corruption: 1,
    crime: 1,
  },
};

export const edicts = {
  holiday: {
    0: "PF1KS.Edict.Holiday.None",
    1: "PF1KS.Edict.Holiday.1",
    2: "PF1KS.Edict.Holiday.6",
    3: "PF1KS.Edict.Holiday.12",
    4: "PF1KS.Edict.Holiday.24",
  },
  promotion: {
    0: "PF1KS.Edict.Promotion.None",
    1: "PF1KS.Edict.Promotion.Token",
    2: "PF1KS.Edict.Promotion.Standard",
    3: "PF1KS.Edict.Promotion.Aggressive",
    4: "PF1KS.Edict.Promotion.Expansionist",
  },
  taxation: {
    0: "PF1KS.Edict.Taxation.None",
    1: "PF1KS.Edict.Taxation.Light",
    2: "PF1KS.Edict.Taxation.Normal",
    3: "PF1KS.Edict.Taxation.Heavy",
    4: "PF1KS.Edict.Taxation.Overwhelming",
  },
};

export const edictEffects = {
  holiday: {
    0: {
      economy: 0,
      loyalty: -1,
      stability: 0,
      consumption: 0,
    },
    1: {
      economy: 0,
      loyalty: 1,
      stability: 0,
      consumption: 1,
    },
    2: {
      economy: 0,
      loyalty: 2,
      stability: 0,
      consumption: 2,
    },
    3: {
      economy: 0,
      loyalty: 3,
      stability: 0,
      consumption: 4,
    },
    4: {
      economy: 0,
      loyalty: 4,
      stability: 0,
      consumption: 8,
    },
  },
  promotion: {
    0: {
      economy: 0,
      loyalty: 0,
      stability: -1,
      consumption: 0,
    },
    1: {
      economy: 0,
      loyalty: 0,
      stability: 1,
      consumption: 1,
    },
    2: {
      economy: 0,
      loyalty: 0,
      stability: 2,
      consumption: 2,
    },
    3: {
      economy: 0,
      loyalty: 0,
      stability: 3,
      consumption: 4,
    },
    4: {
      economy: 0,
      loyalty: 0,
      stability: 4,
      consumption: 8,
    },
  },
  taxation: {
    0: {
      economy: 0,
      loyalty: 1,
      stability: 0,
      consumption: 0,
    },
    1: {
      economy: 1,
      loyalty: -1,
      stability: 0,
      consumption: 0,
    },
    2: {
      economy: 2,
      loyalty: -2,
      stability: 0,
      consumption: 0,
    },
    3: {
      economy: 3,
      loyalty: -4,
      stability: 0,
      consumption: 0,
    },
    4: {
      economy: 4,
      loyalty: -8,
      stability: 0,
      consumption: 0,
    },
  },
};

export const leadershipRoles = {
  ruler: "PF1KS.Leadership.Ruler",
  consort: "PF1KS.Leadership.Consort",
  heir: "PF1KS.Leadership.Heir",
  councilor: "PF1KS.Leadership.Councilor",
  general: "PF1KS.Leadership.General",
  diplomat: "PF1KS.Leadership.GrandDiplomat",
  priest: "PF1KS.Leadership.HighPriest",
  magister: "PF1KS.Leadership.Magister",
  marshal: "PF1KS.Leadership.Marshal",
  enforcer: "PF1KS.Leadership.RoyalEnforcer",
  spymaster: "PF1KS.Leadership.Spymaster",
  treasurer: "PF1KS.Leadership.Treasurer",
  warden: "PF1KS.Leadership.Warden",
  viceroy: "PF1KS.Leadership.Viceroy",
};

export const leadershipBonusTwoStats = {
  ecoLoy: "PF1KS.EconomyLoyalty",
  ecoSta: "PF1KS.EconomyStability",
  loySta: "PF1KS.LoyaltyStability",
};

export const leadershipBonusOptions = {
  ...kingdomStats,
  ...leadershipBonusTwoStats,
  all: "PF1KS.AllStats",
};

export const leadershipBonusToKingdomStats = {
  economy: ["economy"],
  loyalty: ["loyalty"],
  stability: ["stability"],
  ecoLoy: ["economy", "loyalty"],
  ecoSta: ["economy", "stability"],
  loySta: ["loyalty", "stability"],
  all: ["economy", "loyalty", "stability"],
};

export const leadershipPenalties = {
  ruler: {
    unrest: 4,
  },
  consort: {},
  heir: {},
  councilor: {
    loyalty: 2,
    unrest: 1,
  },
  general: {
    loyalty: 4,
  },
  diplomat: {
    stability: 2,
  },
  priest: {
    stability: 2,
    loyalty: 2,
    unrest: 1,
  },
  magister: {
    economy: 4,
  },
  marshal: {
    economy: 4,
  },
  enforcer: {},
  spymaster: {
    economy: 4,
    unrest: 1,
  },
  treasurer: {
    economy: 4,
  },
  warden: {
    loyalty: 2,
    stability: 2,
  },
  viceroy: {},
};

export const leadershipSkillBonuses = {
  dip: "PF1KS.Leadership.Skills.Diplomacy",
  int: "PF1KS.Leadership.Skills.Intimidate",
  kar: "PF1KS.Leadership.Skills.Arcana",
  ken: "PF1KS.Leadership.Skills.Engineering",
  kge: "PF1KS.Leadership.Skills.Geography",
  klo: "PF1KS.Leadership.Skills.Local",
  kno: "PF1KS.Leadership.Skills.Nobility",
  kre: "PF1KS.Leadership.Skills.Religion",
  mer: "PF1KS.Leadership.Skills.Merchant",
  sen: "PF1KS.Leadership.Skills.SenseMotive",
  sol: "PF1KS.Leadership.Skills.Soldier",
  sur: "PF1KS.Leadership.Skills.Survival",
};

export const settlementModifiers = {
  corruption: "PF1KS.Corruption",
  crime: "PF1KS.Crime",
  law: "PF1KS.Law",
  lore: "PF1KS.Lore",
  productivity: "PF1KS.Productivity",
  society: "PF1KS.Society",
};

export const settlementAttributes = {
  danger: "PF1KS.Danger",
  defense: "PF1.Defense",
  baseValue: "PF1KS.BaseValue",
  maxBaseValue: "PF1KS.MaxBaseValue",
  // expanded settlement stuff
  purchaseLimit: "PF1KS.PurchaseLimit",
  spellcasting: "PF1KS.Spellcasting",
};

export const settlementSizes = {
  thorpe: "PF1KS.Settlement.Sizes.Thorpe",
  hamlet: "PF1KS.Settlement.Sizes.Hamlet",
  village: "PF1KS.Settlement.Sizes.Village",
  stown: "PF1KS.Settlement.Sizes.SmallTown",
  ltown: "PF1KS.Settlement.Sizes.LargeTown",
  scity: "PF1KS.Settlement.Sizes.SmallCity",
  lcity: "PF1KS.Settlement.Sizes.LargeCity",
  metro: "PF1KS.Settlement.Sizes.Metropolis",
};

export const settlementValues = {
  thorpe: { modifiers: -4, danger: -10, maxBaseValue: 50, purchaseLimit: 500, spellcasting: 1, qualities: 1 },
  hamlet: { modifiers: -2, danger: -5, maxBaseValue: 200, purchaseLimit: 1000, spellcasting: 2, qualities: 1 },
  village: { modifiers: -1, danger: 0, maxBaseValue: 500, purchaseLimit: 2500, spellcasting: 3, qualities: 2 },
  stown: { modifiers: 0, danger: 0, maxBaseValue: 1000, purchaseLimit: 5000, spellcasting: 4, qualities: 2 },
  ltown: { modifiers: 0, danger: 5, maxBaseValue: 2000, purchaseLimit: 10000, spellcasting: 5, qualities: 3 },
  scity: { modifiers: 1, danger: 5, maxBaseValue: 4000, purchaseLimit: 25000, spellcasting: 6, qualities: 4 },
  lcity: { modifiers: 2, danger: 10, maxBaseValue: 8000, purchaseLimit: 50000, spellcasting: 7, qualities: 5 },
  metro: { modifiers: 4, danger: 10, maxBaseValue: 16000, purchaseLimit: 100000, spellcasting: 8, qualities: 6 },
};

export const altSettlementValues = {
  village: { modifiers: -4, danger: -10, maxBaseValue: 500, purchaseLimit: 2500, spellcasting: 3, qualities: 2 },
  stown: { modifiers: -2, danger: -5, maxBaseValue: 1000, purchaseLimit: 5000, spellcasting: 4, qualities: 2 },
  ltown: { modifiers: 0, danger: 0, maxBaseValue: 2000, purchaseLimit: 10000, spellcasting: 5, qualities: 3 },
  scity: { modifiers: 1, danger: 5, maxBaseValue: 4000, purchaseLimit: 25000, spellcasting: 6, qualities: 4 },
  lcity: { modifiers: 1, danger: 5, maxBaseValue: 8000, purchaseLimit: 50000, spellcasting: 7, qualities: 5 },
  metro: { modifiers: 1, danger: 5, maxBaseValue: 16000, purchaseLimit: 100000, spellcasting: 8, qualities: 6 },
};

export const districtBorders = {
  land: "PF1KS.Border.Land",
  water: "PF1KS.Border.Water",
  cliff: "PF1KS.Border.Cliff",
};

export const buildingTypes = {
  academy: {
    name: "PF1KS.Building.Academy",
    lotSize: 2,
    cost: 52,
  },
  alchemist: {
    name: "PF1KS.Building.Alchemist",
    lotSize: 1,
    cost: 18,
  },
  arena: {
    name: "PF1KS.Building.Arena",
    lotSize: 4,
    cost: 40,
  },
  bank: {
    name: "PF1KS.Building.Bank",
    lotSize: 1,
    cost: 28,
  },
  bardic_college: {
    name: "PF1KS.Building.BardicCollege",
    lotSize: 2,
    cost: 40,
  },
  barracks: {
    name: "PF1KS.Building.Barracks",
    lotSize: 1,
    cost: 6,
  },
  black_market: {
    name: "PF1KS.Building.BlackMarket",
    lotSize: 1,
    cost: 50,
  },
  brewery: {
    name: "PF1KS.Building.Brewery",
    lotSize: 1,
    cost: 6,
  },
  bridge: {
    name: "PF1KS.Building.Bridge",
    lotSize: 1,
    cost: 6,
  },
  bureau: {
    name: "PF1KS.Building.Bureau",
    lotSize: 2,
    cost: 10,
  },
  casters_tower: {
    name: "PF1KS.Building.CastersTower",
    lotSize: 1,
    cost: 30,
  },
  castle: {
    name: "PF1KS.Building.Castle",
    lotSize: 4,
    cost: 54,
  },
  cathedral: {
    name: "PF1KS.Building.Cathedral",
    lotSize: 4,
    cost: 58,
  },
  cistern: {
    name: "PF1KS.Building.Cistern",
    lotSize: 1,
    cost: 6,
  },
  city_wall: {
    name: "PF1KS.Building.CityWall",
    lotSize: 0,
    cost: 2,
  },
  dance_hall: {
    name: "PF1KS.Building.DanceHall",
    lotSize: 1,
    cost: 4,
  },
  dump: {
    name: "PF1KS.Building.Dump",
    lotSize: 1,
    cost: 4,
  },
  everflowing_spring: {
    name: "PF1KS.Building.EverflowingSpring",
    lotSize: 0,
    cost: 5,
  },
  exotic_artisan: {
    name: "PF1KS.Building.ExoticArtisan",
    lotSize: 1,
    cost: 10,
  },
  foreign_quarter: {
    name: "PF1KS.Building.ForeignQuarter",
    lotSize: 4,
    cost: 30,
  },
  foundry: {
    name: "PF1KS.Building.Foundry",
    lotSize: 2,
    cost: 16,
  },
  garrison: {
    name: "PF1KS.Building.Garrison",
    lotSize: 2,
    cost: 28,
  },
  granary: {
    name: "PF1KS.Building.Granary",
    lotSize: 1,
    cost: 12,
  },
  graveyard: {
    name: "PF1KS.Building.Graveyard",
    lotSize: 1,
    cost: 4,
  },
  guildhall: {
    name: "PF1KS.Building.Guildhall",
    lotSize: 2,
    cost: 34,
  },
  herbalist: {
    name: "PF1KS.Building.Herbalist",
    lotSize: 1,
    cost: 40,
  },
  hospital: {
    name: "PF1KS.Building.Hospital",
    lotSize: 2,
    cost: 30,
  },
  house: {
    name: "PF1KS.Building.House",
    lotSize: 1,
    cost: 3,
  },
  inn: {
    name: "PF1KS.Building.Inn",
    lotSize: 1,
    cost: 10,
  },
  jail: {
    name: "PF1KS.Building.Jail",
    lotSize: 1,
    cost: 14,
  },
  library: {
    name: "PF1KS.Building.Library",
    lotSize: 1,
    cost: 6,
  },
  luxury_store: {
    name: "PF1KS.Building.LuxuryStore",
    lotSize: 1,
    cost: 28,
  },
  magic_shop: {
    name: "PF1KS.Building.MagicShop",
    lotSize: 1,
    cost: 68,
  },
  magical_academy: {
    name: "PF1KS.Building.MagicalAcademy",
    lotSize: 2,
    cost: 58,
  },
  magical_streetlamps: {
    name: "PF1KS.Building.MagicalStreetlamps",
    lotSize: 0,
    cost: 5,
  },
  mansion: {
    name: "PF1KS.Building.Mansion",
    lotSize: 1,
    cost: 10,
  },
  market: {
    name: "PF1KS.Building.Market",
    lotSize: 2,
    cost: 48,
  },
  menagerie: {
    name: "PF1KS.Building.Menagerie",
    lotSize: 4,
    cost: 16,
  },
  military_academy: {
    name: "PF1KS.Building.MilitaryAcademy",
    lotSize: 2,
    cost: 36,
  },
  mill: {
    name: "PF1KS.Building.Mill",
    lotSize: 1,
    cost: 6,
  },
  mint: {
    name: "PF1KS.Building.Mint",
    lotSize: 1,
    cost: 30,
  },
  moat: {
    name: "PF1KS.Building.Moat",
    lotSize: 0,
    cost: 2,
  },
  monastery: {
    name: "PF1KS.Building.Monastery",
    lotSize: 2,
    cost: 16,
  },
  monument: {
    name: "PF1KS.Building.Monument",
    lotSize: 1,
    cost: 6,
  },
  museum: {
    name: "PF1KS.Building.Museum",
    lotSize: 2,
    cost: 30,
  },
  noble_villa: {
    name: "PF1KS.Building.NobleVilla",
    lotSize: 2,
    cost: 24,
  },
  observatory: {
    name: "PF1KS.Building.Observatory",
    lotSize: 1,
    cost: 12,
  },
  orphanage: {
    name: "PF1KS.Building.Orphanage",
    lotSize: 1,
    cost: 6,
  },
  palace: {
    name: "PF1KS.Building.Palace",
    lotSize: 4,
    cost: 108,
  },
  park: {
    name: "PF1KS.Building.Park",
    lotSize: 1,
    cost: 4,
  },
  paved_streets: {
    name: "PF1KS.Building.PavedStreets",
    lotSize: 0,
    cost: 24,
  },
  pier: {
    name: "PF1KS.Building.Pier",
    lotSize: 1,
    cost: 16,
  },
  sewer_system: {
    name: "PF1KS.Building.SewerSystem",
    lotSize: 0,
    cost: 24,
  },
  shop: {
    name: "PF1KS.Building.Shop",
    lotSize: 1,
    cost: 8,
  },
  shrine: {
    name: "PF1KS.Building.Shrine",
    lotSize: 1,
    cost: 8,
  },
  smithy: {
    name: "PF1KS.Building.Smithy",
    lotSize: 1,
    cost: 6,
  },
  stable: {
    name: "PF1KS.Building.Stable",
    lotSize: 1,
    cost: 10,
  },
  stockyard: {
    name: "PF1KS.Building.Stockyard",
    lotSize: 4,
    cost: 20,
  },
  tannery: {
    name: "PF1KS.Building.Tannery",
    lotSize: 1,
    cost: 6,
  },
  tavern: {
    name: "PF1KS.Building.Tavern",
    lotSize: 1,
    cost: 12,
  },
  temple: {
    name: "PF1KS.Building.Temple",
    lotSize: 2,
    cost: 32,
  },
  tenement: {
    name: "PF1KS.Building.Tenement",
    lotSize: 1,
    cost: 1,
  },
  theater: {
    name: "PF1KS.Building.Theater",
    lotSize: 2,
    cost: 24,
  },
  town_hall: {
    name: "PF1KS.Building.TownHall",
    lotSize: 2,
    cost: 22,
  },
  trade_shop: {
    name: "PF1KS.Building.TradeShop",
    lotSize: 1,
    cost: 10,
  },
  university: {
    name: "PF1KS.Building.University",
    lotSize: 4,
    cost: 78,
  },
  watchtower: {
    name: "PF1KS.Building.Watchtower",
    lotSize: 1,
    cost: 12,
  },
  waterfront: {
    name: "PF1KS.Building.Waterfront",
    lotSize: 4,
    cost: 90,
  },
  watergate: {
    name: "PF1KS.Building.Watergate",
    lotSize: 0,
    cost: 2,
  },
  waterway: {
    name: "PF1KS.Building.Waterway",
    lotSize: 1,
    cost: 3,
  },
  custom: {
    name: "PF1KS.Building.Custom",
  },
};

export const buildingErrors = {
  lotSizeMismatch: "PF1KS.BuildingError.LotSizeMismatch",
  unplacedLotBuilding: "PF1KS.BuildingError.UnplacedLotBuilding",
};

export const magicItemTypes = {
  minor: "PF1KS.MagicItem.Minor",
  medium: "PF1KS.MagicItem.Medium",
  major: "PF1KS.MagicItem.Major",
};

export const terrainTypes = {
  cavern: "PF1KS.Terrain.Cavern",
  coast: "PF1KS.Terrain.Coast",
  desert: "PF1KS.Terrain.Desert",
  forest: "PF1KS.Terrain.Forest",
  hills: "PF1KS.Terrain.Hills",
  jungle: "PF1KS.Terrain.Jungle",
  marsh: "PF1KS.Terrain.Marsh",
  mountains: "PF1KS.Terrain.Mountains",
  plains: "PF1KS.Terrain.Plains",
  water: "PF1KS.Terrain.Water",
};

export const settings = {
  secondRuler: "PF1KS.Settings.SecondRuler",
  collapseTooltips: "PF1KS.Settings.CollapseTooltips",
};

export const optionalRules = {
  kingdomModifiers: "PF1KS.Settings.KingdomModifiers",
  fameInfamy: "PF1KS.Settings.FameInfamy",
  governmentForms: "PF1KS.Settings.GovernmentForms",
  leadershipSkills: "PF1KS.Settings.LeadershipSkills",
  altSettlementSizes: "PF1KS.Settings.SettlementSizes",
  expandedSettlementModifiers: "PF1KS.Settings.ExpandedSettlementModifiers",
};

export const compendiumEntries = {
  kingdomModifiers:
    "Compendium.pf1-kingdom-sheet.rules.JournalEntry.t1XuuI6w0ZUtN6Hj.JournalEntryPage.rcTSKRBGdY4SI2R6",
  fameInfamy: "Compendium.pf1-kingdom-sheet.rules.JournalEntry.t1XuuI6w0ZUtN6Hj.JournalEntryPage.2GNT3yLzFoYTILTL",
  governmentForms: "Compendium.pf1-kingdom-sheet.rules.JournalEntry.t1XuuI6w0ZUtN6Hj.JournalEntryPage.v08HsMlBmn66rMUk",
  leadershipSkills:
    "Compendium.pf1-kingdom-sheet.rules.JournalEntry.t1XuuI6w0ZUtN6Hj.JournalEntryPage.CY9GAp1XjXgu5pmi",
  altSettlementSizes:
    "Compendium.pf1-kingdom-sheet.rules.JournalEntry.t1XuuI6w0ZUtN6Hj.JournalEntryPage.nZyEv4PWABJwIeLD",
  expandedSettlementModifiers:
    "Compendium.pf1-kingdom-sheet.rules.JournalEntry.t1XuuI6w0ZUtN6Hj.JournalEntryPage.6GfTeS0jM4WmlJk4",
};

export const armyAttributes = {
  dv: "PF1KS.Army.DV",
  om: "PF1KS.Army.OM",
  damage: "PF1.DamageBonus",
  morale: "PF1KS.Army.Morale",
};

export const armySizes = {
  0: "PF1.ActorSize.fine",
  1: "PF1.ActorSize.dim",
  2: "PF1.ActorSize.tiny",
  3: "PF1.ActorSize.sm",
  4: "PF1.ActorSize.med",
  5: "PF1.ActorSize.lg",
  6: "PF1.ActorSize.huge",
  7: "PF1.ActorSize.grg",
  8: "PF1.ActorSize.col",
};

export const armyConsumptionScaling = {
  0: 1 / 8,
  1: 1 / 6,
  2: 1 / 4,
  3: 1 / 2,
  4: 1,
  5: 2,
  6: 4,
  7: 10,
  8: 20,
};

export const armyHD = {
  d6: 3.5,
  d8: 4.5,
  d10: 5.5,
  d12: 6.5,
};

export const armyStrategy = {
  0: "PF1KS.Army.Strategy.Defensive",
  1: "PF1KS.Army.Strategy.Cautious",
  2: "PF1KS.Army.Strategy.Standard",
  3: "PF1KS.Army.Strategy.Aggressive",
  4: "PF1KS.Army.Strategy.Reckless",
};

export const armyConditions = {
  [`${changePrefix}-advantageous-terrain`]: {
    id: `${changePrefix}-advantageous-terrain`,
    name: "PF1KS.Condition.AdvantageousTerrain",
    texture: `modules/${moduleId}/assets/army_conditions/advantageousTerrain.svg`,
    mechanics: {
      changes: [
        {
          formula: 2,
          target: `${changePrefix}_dv`,
          type: "untyped",
        },
      ],
    },
    journal: "Compendium.pf1-kingdom-sheet.rules.JournalEntry.Nl50WVhCMuqqY3Ud.JournalEntryPage.QlOueCvJDAky3jEM",
  },
  [`${changePrefix}-ambush`]: {
    id: `${changePrefix}-ambush`,
    name: "PF1KS.Condition.Ambush",
    texture: `modules/${moduleId}/assets/army_conditions/ambush.svg`,
    journal: "Compendium.pf1-kingdom-sheet.rules.JournalEntry.Nl50WVhCMuqqY3Ud.JournalEntryPage.1L3BEwjri4p8YYlu",
  },
  [`${changePrefix}-battlefield-advantage`]: {
    id: `${changePrefix}-battlefield-advantage`,
    name: "PF1KS.Condition.BattlefieldAdvantage",
    texture: `modules/${moduleId}/assets/army_conditions/battlefieldAdvantage.svg`,
    mechanics: {
      changes: [
        {
          formula: 2,
          target: `${changePrefix}_dv`,
          type: "untyped",
        },
        {
          formula: 2,
          target: `${changePrefix}_om`,
          type: "untyped",
        },
      ],
    },
    journal: "Compendium.pf1-kingdom-sheet.rules.JournalEntry.Nl50WVhCMuqqY3Ud.JournalEntryPage.gH8jLvKjrm9ZTD4v",
  },
  [`${changePrefix}-darkness`]: {
    id: `${changePrefix}-darkness`,
    name: "PF1KS.Condition.Darkness",
    texture: `modules/${moduleId}/assets/army_conditions/darkness.svg`,
    mechanics: {
      changes: [
        {
          formula: -3,
          target: `${changePrefix}_dv`,
          type: "untyped",
        },
        {
          formula: -2,
          target: `${changePrefix}_om`,
          type: "untyped",
        },
      ],
    },
    journal: "Compendium.pf1-kingdom-sheet.rules.JournalEntry.Nl50WVhCMuqqY3Ud.JournalEntryPage.8asxsFmrYySzf6E6",
  },
  [`${changePrefix}-dim-light`]: {
    id: `${changePrefix}-dim-light`,
    name: "PF1KS.Condition.DimLight",
    texture: `modules/${moduleId}/assets/army_conditions/dimLight.svg`,
    mechanics: {
      changes: [
        {
          formula: 1,
          target: `${changePrefix}_om`,
          type: "untyped",
        },
      ],
    },
    journal: "Compendium.pf1-kingdom-sheet.rules.JournalEntry.Nl50WVhCMuqqY3Ud.JournalEntryPage.cCDikJWec80mnG6n",
  },
  [`${changePrefix}-fog`]: {
    id: `${changePrefix}-fog`,
    name: "PF1KS.Condition.Fog",
    texture: `modules/${moduleId}/assets/army_conditions/fog.svg`,
    mechanics: {
      contextNotes: [
        {
          text: "+[[2]] to withdraw",
          target: `${changePrefix}_morale`,
        },
        {
          text: "half damage",
          target: `${changePrefix}_om`,
        },
      ],
    },
    journal: "Compendium.pf1-kingdom-sheet.rules.JournalEntry.Nl50WVhCMuqqY3Ud.JournalEntryPage.c0jSYSCCExA9az4e",
  },
  [`${changePrefix}-fortifications`]: {
    id: `${changePrefix}-fortifications`,
    name: "PF1KS.Condition.Fortifications",
    texture: `modules/${moduleId}/assets/army_conditions/fortifications.svg`,
    mechanics: {
      contextNotes: [
        {
          text: "add fortification Defense",
          target: `${changePrefix}_dv`,
        },
      ],
    },
    journal: "Compendium.pf1-kingdom-sheet.rules.JournalEntry.Nl50WVhCMuqqY3Ud.JournalEntryPage.XzyCEUqKwco2nQsr",
  },
  [`${changePrefix}-rain`]: {
    id: `${changePrefix}-rain`,
    name: "PF1KS.Condition.Rain",
    texture: `modules/${moduleId}/assets/army_conditions/rain.svg`,
    mechanics: {
      contextNotes: [
        {
          text: "[[-4]] during the Ranged phase",
          target: `${changePrefix}_om`,
        },
      ],
    },
    journal: "Compendium.pf1-kingdom-sheet.rules.JournalEntry.Nl50WVhCMuqqY3Ud.JournalEntryPage.qm2lJRiqWyr2LRf6",
  },
  [`${changePrefix}-sandstorm`]: {
    id: `${changePrefix}-sandstorm`,
    name: "PF1KS.Condition.Sandstorm",
    texture: `modules/${moduleId}/assets/army_conditions/sandstorm.svg`,
    mechanics: {
      contextNotes: [
        {
          text: "+[[2]] to withdraw",
          target: `${changePrefix}_morale`,
        },
        {
          text: "half damage",
          target: `${changePrefix}_om`,
        },
      ],
    },
    journal: "Compendium.pf1-kingdom-sheet.rules.JournalEntry.Nl50WVhCMuqqY3Ud.JournalEntryPage.WhAGk6DEzmQLBK12",
  },
  [`${changePrefix}-snow`]: {
    id: `${changePrefix}-snow`,
    name: "PF1KS.Condition.Snow",
    texture: `modules/${moduleId}/assets/army_conditions/snow.svg`,
    mechanics: {
      contextNotes: [
        {
          text: "[[-4]] during the Ranged phase",
          target: `${changePrefix}_om`,
        },
        {
          text: "half damage",
          target: `${changePrefix}_om`,
        },
      ],
    },
    journal: "Compendium.pf1-kingdom-sheet.rules.JournalEntry.Nl50WVhCMuqqY3Ud.JournalEntryPage.oViI7Sz7xSxP5rXv",
  },
  [`${changePrefix}-wind`]: {
    id: `${changePrefix}-wind`,
    name: "PF1KS.Condition.Wind",
    texture: `modules/${moduleId}/assets/army_conditions/wind.svg`,
    mechanics: {
      contextNotes: [
        {
          text: "Wind modifier penalties from @UUID[Compendium.pf1-kingdom-sheet.rules.JournalEntry.Nl50WVhCMuqqY3Ud.JournalEntryPage.oh8QvomTx3B9zlSe]{Wind Effects} to Ranged phase",
          target: `${changePrefix}_om`,
        },
      ],
    },
    journal: "Compendium.pf1-kingdom-sheet.rules.JournalEntry.Nl50WVhCMuqqY3Ud.JournalEntryPage.LGLfLNQbfGP2meKG",
  },
};

export const eventSubTypes = {
  active: "PF1KS.Event.SubTypes.Active",
  misc: "PF1KS.Event.SubTypes.Misc",
};

export const improvementSubTypes = {
  general: "PF1KS.Improvement.SubTypes.General",
  special: "PF1KS.Improvement.SubTypes.Special",
};

export const featureSubTypes = {
  quality: "PF1KS.Feature.SubTypes.Quality",
  disadvantage: "PF1KS.Feature.SubTypes.Disadvantage",
  misc: "PF1KS.Feature.SubTypes.Misc",
};

export const itemSubTypes = {
  ...eventSubTypes,
  ...improvementSubTypes,
  ...featureSubTypes,
};
