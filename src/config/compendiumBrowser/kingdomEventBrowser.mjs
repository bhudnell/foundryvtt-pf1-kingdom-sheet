import { kingdomEventId } from "../config.mjs";

const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class KingdomEventFilter extends pf1.applications.compendiumBrowser.filters.CheckboxFilter {
  static label = "PF1.Type";
  static type = kingdomEventId;
  static indexField = "system.subType";

  prepareChoices() {
    this.choices = this.constructor.getChoicesFromConfig(pf1ks.config.eventSubTypes);
  }
}

export class KingdomEventBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
  static typeName = "PF1KS.Events.Kingdom";
  static filterClasses = [commonFilters.PackFilter, KingdomEventFilter, commonFilters.TagFilter];
}
