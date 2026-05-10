import { settlementEventId } from "../config.mjs";

const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class SettlementEventFilter extends pf1.applications.compendiumBrowser.filters.CheckboxFilter {
  static label = "PF1.Type";
  static type = settlementEventId;
  static indexField = "system.subType";

  prepareChoices() {
    this.choices = this.constructor.getChoicesFromConfig(pf1ks.config.eventSubTypes);
  }
}

export class SettlementEventBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
  static typeName = "PF1KS.Events.Settlement";
  static filterClasses = [commonFilters.PackFilter, SettlementEventFilter, commonFilters.TagFilter];
}
