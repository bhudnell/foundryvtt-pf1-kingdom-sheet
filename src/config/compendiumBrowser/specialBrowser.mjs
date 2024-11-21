import { kingdomSpecialId } from "../config.mjs";

const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class SpecialFilter extends pf1.applications.compendiumBrowser.filters.BaseFilter {
  static label = "PF1KS.SpecialStuff";
  static type = kingdomSpecialId;
}

export class SpecialBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
  static documentName = "Item";
  static typeName = kingdomSpecialId;
  static filterClasses = [commonFilters.PackFilter, commonFilters.TagFilter, SpecialFilter];
}
