export const CFG = {
  id: "pf1-kingdom-sheet",
};

export const kingdomSheetId = `${CFG.id}.kingdom`;
export const kingdomBuildingId = `${CFG.id}.building`;
export const kingdomEventId = `${CFG.id}.event`;

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
