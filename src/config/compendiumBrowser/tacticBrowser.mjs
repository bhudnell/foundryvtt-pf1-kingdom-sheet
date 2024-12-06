import { tacticId } from "../config.mjs";

const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class TacticFilter extends pf1.applications.compendiumBrowser.filters.BaseFilter {
  static label = "PF1KS.TacticStuff";
  static type = tacticId;
}

export class TacticBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
  static documentName = "Item";
  static typeName = tacticId;
  static filterClasses = [commonFilters.PackFilter, commonFilters.TagFilter, TacticFilter];
}
