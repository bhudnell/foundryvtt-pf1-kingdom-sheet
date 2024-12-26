import { improvementId } from "../config.mjs";

const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class ImprovementFilter extends pf1.applications.compendiumBrowser.filters.BaseFilter {
  static label = "PF1KS.ImprovementStuff";
  static type = improvementId;
}

export class ImprovementBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
  static documentName = "Item";
  static typeName = "PF1KS.Improvements";
  static filterClasses = [commonFilters.PackFilter, commonFilters.TagFilter, ImprovementFilter];
}
