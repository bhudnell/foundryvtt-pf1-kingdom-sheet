import { improvementId } from "../config.mjs";

const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class ImprovementFilter extends pf1.applications.compendiumBrowser.filters.CheckboxFilter {
  static label = "PF1.Type";
  static type = improvementId;
  static indexField = "system.subType";

  prepareChoices() {
    this.choices = this.constructor.getChoicesFromConfig(pf1ks.config.improvementSubTypes);
  }
}

export class ImprovementBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
  static typeName = "PF1KS.Improvements";
  static filterClasses = [commonFilters.PackFilter, ImprovementFilter, commonFilters.TagFilter];
}
