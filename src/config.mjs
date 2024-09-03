export const CFG = {
  id: "pf1-kingdom-sheet",
};

export const kingdomSheetId = `${CFG.id}.kingdom`;
export const kingdomArmyId = `${CFG.id}.army`;
export const kingdomBuildingId = `${CFG.id}.building`;
export const kingdomEventId = `${CFG.id}.event`;
export const kingdomImprovementId = `${CFG.id}.improvement`;
export const kingdomBoonId = `${CFG.id}.boon`;
export const kingdomResourceId = `${CFG.id}.resource`;
export const kingdomSpecialId = `${CFG.id}.special`;
export const kingdomTacticId = `${CFG.id}.tactic`;

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

export const alignments = {
  lg: "PF1KS.Alignment.LG",
  ng: "PF1KS.Alignment.NG",
  cg: "PF1KS.Alignment.CG",
  ln: "PF1KS.Alignment.LN",
  tn: "PF1KS.Alignment.TN",
  cn: "PF1KS.Alignment.CN",
  le: "PF1KS.Alignment.LE",
  ne: "PF1KS.Alignment.NE",
  ce: "PF1KS.Alignment.CE",
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
  defense: "PF1KS.Defense",
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

export const compendiumEntries = {
  kingdomModifiers: "TODO",
  fameInfamy: "TODO",
  governmentForms: "TODO",
  leadershipSkills: "TODO",
  altSettlementSizes: "TODO",
};

export const armySizes = {
  "-4": "PF1KS.Army.Size.Fine",
  "-3": "PF1KS.Army.Size.Diminutive",
  "-2": "PF1KS.Army.Size.Tiny",
  "-1": "PF1KS.Army.Size.Small",
  0: "PF1KS.Army.Size.Medium",
  1: "PF1KS.Army.Size.Large",
  2: "PF1KS.Army.Size.Huge",
  3: "PF1KS.Army.Size.Gargantuan",
  4: "PF1KS.Army.Size.Colossal",
};

export const armyHD = {
  d6: 3.5,
  d8: 4.5,
  d10: 5.5,
  d12: 6.5,
};

export const armyConsumptionScaling = {
  "-4": 1 / 8,
  "-3": 1 / 6,
  "-2": 1 / 4,
  "-1": 1 / 2,
  0: 1,
  1: 2,
  2: 4,
  3: 10,
  4: 20,
};

export const armySelectorOptions = {
  tactics: {
    cc: "PF1KS.Army.Tactics.CautiousCombat",
    ce: "PF1KS.Army.Tactics.CavalryExperts",
    dw: "PF1KS.Army.Tactics.DefensiveWall",
    df: "PF1KS.Army.Tactics.DirtyFighters",
    ef: "PF1KS.Army.Tactics.ExpertFlankers",
    fr: "PF1KS.Army.Tactics.FalseRetreat",
    fd: "PF1KS.Army.Tactics.FullDefense",
    rb: "PF1KS.Army.Tactics.RelentlessBrutality",
    si: "PF1KS.Army.Tactics.Siegebreaker",
    ss: "PF1KS.Army.Tactics.SniperSupport",
    sp: "PF1KS.Army.Tactics.Spellbreaker",
    st: "PF1KS.Army.Tactics.Standard",
    tt: "PF1KS.Army.Tactics.Taunt",
    wd: "PF1KS.Army.Tactics.Withdraw",
  },
  resources: {
    hp: "PF1KS.Army.Resources.HealingPotion",
    ia: "PF1KS.Army.Resources.ImprovedArmor",
    ma: "PF1KS.Army.Resources.MagicArmor",
    iw: "PF1KS.Army.Resources.ImprovedWeapons",
    mw: "PF1KS.Army.Resources.MagicWeapons",
    mt: "PF1KS.Army.Resources.Mounts",
    rw: "PF1KS.Army.Resources.RangedWeapons",
    se: "PF1KS.Army.Resources.SiegeEngines",
  },
  special: {
    ad: "PF1KS.Army.Special.AbilityDrainDamage",
    al: "PF1KS.Army.Special.Alchemy",
    am: "PF1KS.Army.Special.Amphibious",
    ac: "PF1KS.Army.Special.AnimalCompanion",
    aq: "PF1KS.Army.Special.Aquatic",
    aoc: "PF1KS.Army.Special.AuraCourage",
    at: "PF1KS.Army.Special.ArmorTraining",
    bl: "PF1KS.Army.Special.Bleed",
    bse: "PF1KS.Army.Special.Blindsense",
    bsi: "PF1KS.Army.Special.Blindsight",
    bo: "PF1KS.Army.Special.Bomb",
    br: "PF1KS.Army.Special.Bravery",
    bw: "PF1KS.Army.Special.BreathWeapon",
    bp: "PF1KS.Army.Special.BrewPotion",
    bu: "PF1KS.Army.Special.Burn",
    brw: "PF1KS.Army.Special.Burrow",
    ca: "PF1KS.Army.Special.Cannibalize",
    ch: "PF1KS.Army.Special.Challenge",
    cne: "PF1KS.Army.Special.ChannelNegative",
    cpe: "PF1KS.Army.Special.ChannelPositive",
    cl: "PF1KS.Army.Special.Climb",
    cst: "PF1KS.Army.Special.CombatStyle",
    co: "PF1KS.Army.Special.Construct",
    csa: "PF1KS.Army.Special.CreateSandstorm",
    csp: "PF1KS.Army.Special.CreateSpawn",
    dr: "PF1KS.Army.Special.DamageReduction",
    da: "PF1KS.Army.Special.Darkvision",
    dic: "PF1KS.Army.Special.Discovery",
    dis: "PF1KS.Army.Special.Disease",
    dh: "PF1KS.Army.Special.DivineHealth",
    eg: "PF1KS.Army.Special.EarthGlide",
    ei: "PF1KS.Army.Special.Eidolon",
    ev: "PF1KS.Army.Special.Evasion",
    fh: "PF1KS.Army.Special.FastHealing",
    fen: "PF1KS.Army.Special.FavoredEnemy",
    ft: "PF1KS.Army.Special.FavoredTerrain",
    fea: "PF1KS.Army.Special.Fear",
    fer: "PF1KS.Army.Special.Ferocity",
    fl: "PF1KS.Army.Special.Flight",
    fb: "PF1KS.Army.Special.FlurryBlows",
    gr: "PF1KS.Army.Special.Grab",
    hh: "PF1KS.Army.Special.HexHealing",
    hc: "PF1KS.Army.Special.HexCauldron",
    hbc: "PF1KS.Army.Special.HunterBondCompanion",
    hba: "PF1KS.Army.Special.HunterBondAnimal",
    im: "PF1KS.Army.Special.Immunity",
    inc: "PF1KS.Army.Special.Incorporeal",
    ic: "PF1KS.Army.Special.InspireCourage",
    inv: "PF1KS.Army.Special.Invisibility",
    ju: "PF1KS.Army.Special.Judgement",
    kp: "PF1KS.Army.Special.KiPool",
    lh: "PF1KS.Army.Special.LayHands",
    lb: "PF1KS.Army.Special.LightBlind",
    ls: "PF1KS.Army.Special.LightSense",
    ll: "PF1KS.Army.Special.LowLight",
    me: "PF1KS.Army.Special.Mercy",
    mi: "PF1KS.Army.Special.Mindless",
    mob: "PF1KS.Army.Special.Mobility",
    mou: "PF1KS.Army.Special.Mount",
    or: "PF1KS.Army.Special.Order",
    pa: "PF1KS.Army.Special.Paralysis",
    pe: "PF1KS.Army.Special.Petrification",
    pl: "PF1KS.Army.Special.Plant",
    pr: "PF1KS.Army.Special.PoisonResist",
    poi: "PF1KS.Army.Special.Poison",
    pou: "PF1KS.Army.Special.Pounce",
    pc: "PF1KS.Army.Special.PowerfulCharge",
    rag: "PF1KS.Army.Special.Rage",
    rak: "PF1KS.Army.Special.Rake",
    reg: "PF1KS.Army.Special.Regeneration",
    ren: "PF1KS.Army.Special.Rend",
    res: "PF1KS.Army.Special.Resistance",
    rc: "PF1KS.Army.Special.RockCatch",
    rth: "PF1KS.Army.Special.RockThrow",
    rta: "PF1KS.Army.Special.RogueTalent",
    sc: "PF1KS.Army.Special.Scent",
    sha: "PF1KS.Army.Special.ShieldAlly",
    sd: "PF1KS.Army.Special.SignificantDefense",
    se: "PF1KS.Army.Special.SmiteEvil",
    sna: "PF1KS.Army.Special.SneakAttack",
    sr: "PF1KS.Army.Special.SpellResist",
    sp: "PF1KS.Army.Special.Spellcasting",
    sf: "PF1KS.Army.Special.StunningFist",
    sw: "PF1KS.Army.Special.Swarm",
    ta: "PF1KS.Army.Special.Tactician",
    te: "PF1KS.Army.Special.Teleportation",
    trk: "PF1KS.Army.Special.Track",
    trm: "PF1KS.Army.Special.Trample",
    ts: "PF1KS.Army.Special.TrapSense",
    tre: "PF1KS.Army.Special.Tremorsense",
    tri: "PF1KS.Army.Special.Trip",
    un: "PF1KS.Army.Special.Undead",
    ua: "PF1KS.Army.Special.UnnaturalAura",
    vo: "PF1KS.Army.Special.Vortex",
    wsp: "PF1KS.Army.Special.WeaponSpec",
    ww: "PF1KS.Army.Special.Whirlwind",
    wsh: "PF1KS.Army.Special.WildShape",
  },
  boons: {
    bu: "PF1KS.Army.Boons.BloodiedUnbroken",
    bt: "PF1KS.Army.Boons.BonusTactic",
    dt: "PF1KS.Army.Boons.DefensiveTactics",
    ft: "PF1KS.Army.Boons.FlexibleTactics",
    hr: "PF1KS.Army.Boons.HitRun",
    hl: "PF1KS.Army.Boons.HoldLine",
    ll: "PF1KS.Army.Boons.LiveOffLand",
    lo: "PF1KS.Army.Boons.Loyalty",
    me: "PF1KS.Army.Boons.Merciless",
    sh: "PF1KS.Army.Boons.Sharpshooter",
    tr: "PF1KS.Army.Boons.Triage",
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

export const miscChangeTargets = {
  consumption: "PF1KS.Consumption",
  bonusBP: "PF1KS.BonusBP",
  fame: "PF1KS.Fame",
  infamy: "PF1KS.Infamy",
};

export const allChangeTargets = {
  ...kingdomStats,
  ...allSettlementModifiers,
  ...miscChangeTargets,
};

export const changeScopes = {
  kingdom: "PF1KS.ChangeScope.Kingdom",
  settlement: "PF1KS.ChangeScope.Settlement",
  hex: "PF1KS.ChangeScope.Hex",
};
