import { featureId } from "../config.mjs";

const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class FeatureFilter extends pf1.applications.compendiumBrowser.filters.BaseFilter {
  static label = "PF1KS.FeatureStuff";
  static type = featureId;
}

export class FeatureBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
  static documentName = "Item";
  static typeName = "PF1KS.Features";
  static filterClasses = [commonFilters.PackFilter, commonFilters.TagFilter, FeatureFilter];
}
