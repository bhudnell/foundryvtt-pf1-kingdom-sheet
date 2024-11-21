import { kingdomTacticId } from "../config.mjs";

const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class TacticFilter extends pf1.applications.compendiumBrowser.filters.BaseFilter {
  static label = "PF1KS.TacticStuff";
  static type = kingdomTacticId;
}

export class TacticBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
  static documentName = "Item";
  static typeName = kingdomTacticId;
  static filterClasses = [commonFilters.PackFilter, commonFilters.TagFilter, TacticFilter];
}
