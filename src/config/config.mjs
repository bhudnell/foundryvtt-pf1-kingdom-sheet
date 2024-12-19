export const moduleId = "pf1-kingdom-sheet";
export const changePrefix = "pf1ks";

export const kingdomId = `${moduleId}.kingdom`;
export const armyId = `${moduleId}.army`;

export const buildingId = `${moduleId}.building`;
export const eventId = `${moduleId}.event`;
export const improvementId = `${moduleId}.improvement`;
export const boonId = `${moduleId}.boon`;
export const specialId = `${moduleId}.special`;
export const tacticId = `${moduleId}.tactic`;

export const kingdomItemTypes = [buildingId, eventId, improvementId];
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

export const governmentBonuses = {
  aut: { corruption: 0, crime: 0, productivity: 0, law: 0, lore: 0, society: 0 },
  mag: { corruption: 0, crime: 0, productivity: -1, law: 0, lore: 2, society: -1 },
  oli: { corruption: 1, crime: 0, productivity: 0, law: -1, lore: -1, society: 1 },
  ove: { corruption: 1, crime: -1, productivity: 0, law: 1, lore: 0, society: -1 },
  rep: { corruption: 0, crime: -1, productivity: 1, law: -1, lore: 0, society: 1 },
  sec: { corruption: 1, crime: 1, productivity: 1, law: -3, lore: 0, society: 0 },
  the: { corruption: -1, crime: 0, productivity: 0, law: 1, lore: 1, society: -1 },
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
  productivity: "PF1KS.Productivity",
  law: "PF1KS.Law",
  lore: "PF1KS.Lore",
  society: "PF1KS.Society",
};

export const allSettlementModifiers = {
  ...settlementModifiers,
  defense: "PF1.Defense",
  baseValue: "PF1KS.BaseValue",
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
  thorpe: { modifiers: -4, danger: -10, maxBaseValue: 50 },
  hamlet: { modifiers: -2, danger: -5, maxBaseValue: 200 },
  village: { modifiers: -1, danger: 0, maxBaseValue: 500 },
  stown: { modifiers: 0, danger: 0, maxBaseValue: 1000 },
  ltown: { modifiers: 0, danger: 5, maxBaseValue: 2000 },
  scity: { modifiers: 1, danger: 5, maxBaseValue: 4000 },
  lcity: { modifiers: 2, danger: 10, maxBaseValue: 8000 },
  metro: { modifiers: 4, danger: 10, maxBaseValue: 16000 },
};

export const altSettlementValues = {
  village: { modifiers: -4, danger: -10, maxBaseValue: 500 },
  stown: { modifiers: -2, danger: -5, maxBaseValue: 1000 },
  ltown: { modifiers: 0, danger: 0, maxBaseValue: 2000 },
  scity: { modifiers: 1, danger: 5, maxBaseValue: 4000 },
  lcity: { modifiers: 1, danger: 5, maxBaseValue: 8000 },
  metro: { modifiers: 1, danger: 5, maxBaseValue: 16000 },
};

export const buildingTypes = {
  academy: "PF1KS.Building.Academy",
  alchemist: "PF1KS.Building.Alchemist",
  arena: "PF1KS.Building.Arena",
  bank: "PF1KS.Building.Bank",
  bardic_college: "PF1KS.Building.BardicCollege",
  barracks: "PF1KS.Building.Barracks",
  black_market: "PF1KS.Building.BlackMarket",
  brewery: "PF1KS.Building.Brewery",
  bridge: "PF1KS.Building.Bridge",
  bureau: "PF1KS.Building.Bureau",
  casters_tower: "PF1KS.Building.CastersTower",
  castle: "PF1KS.Building.Castle",
  cathedral: "PF1KS.Building.Cathedral",
  cistern: "PF1KS.Building.Cistern",
  city_wall: "PF1KS.Building.CityWall",
  dance_hall: "PF1KS.Building.DanceHall",
  dump: "PF1KS.Building.Dump",
  everflowing_spring: "PF1KS.Building.EverflowingSpring",
  exotic_artisan: "PF1KS.Building.ExoticArtisan",
  foreign_quarter: "PF1KS.Building.ForeignQuarter",
  foundry: "PF1KS.Building.Foundry",
  garrison: "PF1KS.Building.Garrison",
  granary: "PF1KS.Building.Granary",
  graveyard: "PF1KS.Building.Graveyard",
  guildhall: "PF1KS.Building.Guildhall",
  herbalist: "PF1KS.Building.Herbalist",
  hospital: "PF1KS.Building.Hospital",
  house: "PF1KS.Building.House",
  inn: "PF1KS.Building.Inn",
  jail: "PF1KS.Building.Jail",
  library: "PF1KS.Building.Library",
  luxury_store: "PF1KS.Building.LuxuryStore",
  magic_shop: "PF1KS.Building.MagicShop",
  magical_academy: "PF1KS.Building.MagicalAcademy",
  magical_streetlamps: "PF1KS.Building.MagicalStreetlamps",
  mansion: "PF1KS.Building.Mansion",
  market: "PF1KS.Building.Market",
  menagerie: "PF1KS.Building.Menagerie",
  military_academy: "PF1KS.Building.MilitaryAcademy",
  mill: "PF1KS.Building.Mill",
  mint: "PF1KS.Building.Mint",
  moat: "PF1KS.Building.Moat",
  monastery: "PF1KS.Building.Monastery",
  monument: "PF1KS.Building.Monument",
  museum: "PF1KS.Building.Museum",
  noble_villa: "PF1KS.Building.NobleVilla",
  observatory: "PF1KS.Building.Observatory",
  orphanage: "PF1KS.Building.Orphanage",
  palace: "PF1KS.Building.Palace",
  park: "PF1KS.Building.Park",
  paved_streets: "PF1KS.Building.PavedStreets",
  pier: "PF1KS.Building.Pier",
  sewer_system: "PF1KS.Building.SewerSystem",
  shop: "PF1KS.Building.Shop",
  shrine: "PF1KS.Building.Shrine",
  smithy: "PF1KS.Building.Smithy",
  stable: "PF1KS.Building.Stable",
  stockyard: "PF1KS.Building.Stockyard",
  tannery: "PF1KS.Building.Tannery",
  tavern: "PF1KS.Building.Tavern",
  temple: "PF1KS.Building.Temple",
  tenement: "PF1KS.Building.Tenement",
  theater: "PF1KS.Building.Theater",
  town_hall: "PF1KS.Building.TownHall",
  trade_shop: "PF1KS.Building.TradeShop",
  university: "PF1KS.Building.University",
  watchtower: "PF1KS.Building.Watchtower",
  watergate: "PF1KS.Building.Watergate",
  waterfront: "PF1KS.Building.Waterfront",
  waterway: "PF1KS.Building.Waterway",
  custom: "PF1KS.Building.Custom",
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

export const optionalRules = {
  kingdomModifiers: "PF1KS.Settings.KingdomModifiers",
  fameInfamy: "PF1KS.Settings.FameInfamy",
  governmentForms: "PF1KS.Settings.GovernmentForms",
  leadershipSkills: "PF1KS.Settings.LeadershipSkills",
  altSettlementSizes: "PF1KS.Settings.SettlementSizes",
};

// todo add compendium entries https://www.aonprd.com/Rules.aspx?ID=1547
export const compendiumEntries = {
  kingdomModifiers: "",
  fameInfamy: "",
  governmentForms: "",
  leadershipSkills: "",
  altSettlementSizes: "",
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

// todo add compendium entries https://www.aonprd.com/Rules.aspx?ID=1575
export const armyConditions = {
  [`${changePrefix}-advantageous-terrain`]: {
    id: `${changePrefix}-advantageous-terrain`,
    name: "PF1KS.Condition.AdvantageousTerrain",
    texture: `modules/${moduleId}/icons/advantageousTerrain.svg`,
    mechanics: {
      changes: [
        {
          formula: 2,
          target: `${changePrefix}_dv`,
          type: "untyped",
        },
      ],
    },
    journal: "",
  },
  [`${changePrefix}-ambush`]: {
    id: `${changePrefix}-ambush`,
    name: "PF1KS.Condition.Ambush",
    texture: `modules/${moduleId}/icons/ambush.svg`,
    journal: "",
  },
  [`${changePrefix}-battlefield-advantage`]: {
    id: `${changePrefix}-battlefield-advantage`,
    name: "PF1KS.Condition.BattlefieldAdvantage",
    texture: `modules/${moduleId}/icons/battlefieldAdvantage.svg`,
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
    journal: "",
  },
  [`${changePrefix}-darkness`]: {
    id: `${changePrefix}-darkness`,
    name: "PF1KS.Condition.Darkness",
    texture: `modules/${moduleId}/icons/darkness.svg`,
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
    journal: "",
  },
  [`${changePrefix}-dim-light`]: {
    id: `${changePrefix}-dim-light`,
    name: "PF1KS.Condition.DimLight",
    texture: `modules/${moduleId}/icons/dimLight.svg`,
    mechanics: {
      changes: [
        {
          formula: 1,
          target: `${changePrefix}_om`,
          type: "untyped",
        },
      ],
    },
    journal: "",
  },
  [`${changePrefix}-fog`]: {
    id: `${changePrefix}-fog`,
    name: "PF1KS.Condition.Fog",
    texture: `modules/${moduleId}/icons/fog.svg`,
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
    journal: "",
  },
  [`${changePrefix}-fortifications`]: {
    id: `${changePrefix}-fortifications`,
    name: "PF1KS.Condition.Fortifications",
    texture: `modules/${moduleId}/icons/fortifications.svg`,
    mechanics: {
      contextNotes: [
        {
          text: "add fortification Defense",
          target: `${changePrefix}_dv`,
        },
      ],
    },
    journal: "",
  },
  [`${changePrefix}-rain`]: {
    id: `${changePrefix}-rain`,
    name: "PF1KS.Condition.Rain",
    texture: `modules/${moduleId}/icons/rain.svg`,
    mechanics: {
      contextNotes: [
        {
          text: "[[-4]] during the Ranged phase",
          target: `${changePrefix}_om`,
        },
      ],
    },
    journal: "",
  },
  [`${changePrefix}-sandstorm`]: {
    id: `${changePrefix}-sandstorm`,
    name: "PF1KS.Condition.Sandstorm",
    texture: `modules/${moduleId}/icons/sandstorm.svg`,
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
    journal: "",
  },
  [`${changePrefix}-snow`]: {
    id: `${changePrefix}-snow`,
    name: "PF1KS.Condition.Snow",
    texture: `modules/${moduleId}/icons/snow.svg`,
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
    journal: "",
  },
  [`${changePrefix}-wind`]: {
    id: `${changePrefix}-wind`,
    name: "PF1KS.Condition.Wind",
    texture: `modules/${moduleId}/icons/wind.svg`,
    mechanics: {
      contextNotes: [
        {
          text: "Wind modifier penalties from @UUID[Compendium.pf-content.pf-rules.JournalEntry.GUKeQEgdxbleWA0l]{Table 13-10: Wind Effects} to Ranged phase",
          target: `${changePrefix}_om`,
        },
      ],
    },
    journal: "",
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

export const itemSubTypes = {
  ...eventSubTypes,
  ...improvementSubTypes,
};
