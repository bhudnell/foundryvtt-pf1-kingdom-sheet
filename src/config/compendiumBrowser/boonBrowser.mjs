import { kingdomBoonId } from "../config.mjs";

const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class BoonFilter extends pf1.applications.compendiumBrowser.filters.BaseFilter {
  static label = "PF1KS.BoonStuff";
  static type = kingdomBoonId;
}

export class BoonBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
  static documentName = "Item";
  static typeName = kingdomBoonId;
  static filterClasses = [commonFilters.PackFilter, commonFilters.TagFilter, BoonFilter];
}
