import { buildingId } from "../config.mjs";

const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class BuildingFilter extends pf1.applications.compendiumBrowser.filters.BaseFilter {
  static label = "PF1KS.BuildingStuff";
  static type = buildingId;
}

export class BuildingBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
  static documentName = "Item";
  static typeName = "PF1KS.Buildings";
  static filterClasses = [commonFilters.PackFilter, commonFilters.TagFilter, BuildingFilter];
}
