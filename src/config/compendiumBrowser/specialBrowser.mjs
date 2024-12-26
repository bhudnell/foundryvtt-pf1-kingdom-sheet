import { specialId } from "../config.mjs";

const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class SpecialFilter extends pf1.applications.compendiumBrowser.filters.BaseFilter {
  static label = "PF1KS.SpecialStuff";
  static type = specialId;
}

export class SpecialBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
  static documentName = "Item";
  static typeName = "PF1KS.Army.Special";
  static filterClasses = [commonFilters.PackFilter, commonFilters.TagFilter, SpecialFilter];
}
