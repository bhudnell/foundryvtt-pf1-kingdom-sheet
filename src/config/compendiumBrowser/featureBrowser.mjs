import { featureId } from "../config.mjs";

const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class FeatureFilter extends pf1.applications.compendiumBrowser.filters.CheckboxFilter {
  static label = "PF1.Type";
  static type = featureId;
  static indexField = "system.subType";

  prepareChoices() {
    this.choices = this.constructor.getChoicesFromConfig(pf1ks.config.featureSubTypes);
  }
}

export class FeatureBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
  static typeName = "PF1KS.Features";
  static filterClasses = [commonFilters.PackFilter, FeatureFilter, commonFilters.TagFilter];
}
