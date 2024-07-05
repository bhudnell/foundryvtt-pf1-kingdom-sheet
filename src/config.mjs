export const CFG = {
  id: "pf1-kingdom-sheet",
};

export const kingdomSheetId = `${CFG.id}.kingdom`;
export const kingdomBuildingId = `${CFG.id}.building`;
export const kingdomEventId = `${CFG.id}.event`;
export const kingdomImprovementId = `${CFG.id}.improvement`;

export const kingdomStats = {
  economy: "PF1KS.Economy",
  loyalty: "PF1KS.Loyalty",
  stability: "PF1KS.Stability",
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
    stability: 0,
  },
  ng: {
    economy: 0,
    loyalty: 2,
    stability: 2,
  },
  cg: {
    economy: 0,
    loyalty: 4,
    stability: 0,
  },
  ln: {
    economy: 2,
    loyalty: 0,
    stability: 2,
  },
  tn: {
    economy: 0,
    loyalty: 0,
    stability: 4,
  },
  cn: {
    economy: 0,
    loyalty: 2,
    stability: 2,
  },
  le: {
    economy: 4,
    loyalty: 0,
    stability: 0,
  },
  ne: {
    economy: 2,
    loyalty: 0,
    stability: 2,
  },
  ce: {
    economy: 2,
    loyalty: 2,
    stability: 0,
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
  marshall: {
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

export const kingdomStatChangeTargets = {
  economy: "PF1KS.Economy",
  loyalty: "PF1KS.Loyalty",
  stability: "PF1KS.Stability",
};

export const settlementModifierChangeTargets = {
  corruption: "PF1KS.Corruption",
  crime: "PF1KS.Crime",
  productivity: "PF1KS.Productivity",
  law: "PF1KS.Law",
  lore: "PF1KS.Lore",
  society: "PF1KS.Society",
};

export const miscChangeTargets = {
  consumption: "PF1KS.Consumption",
  bonusBP: "PF1KS.BonusBP",
  fame: "PF1KS.Fame",
  infamy: "PF1KS.Infamy",
};

export const allChangeTargets = {
  ...kingdomStatChangeTargets,
  ...settlementModifierChangeTargets,
  ...miscChangeTargets,
};
