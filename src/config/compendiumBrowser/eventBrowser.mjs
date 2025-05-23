import { eventId } from "../config.mjs";

const commonFilters = pf1.applications.compendiumBrowser.filters.common;

class EventFilter extends pf1.applications.compendiumBrowser.filters.BaseFilter {
  static label = "PF1KS.eventStuff";
  static type = eventId;
}

export class EventBrowser extends pf1.applications.compendiumBrowser.CompendiumBrowser {
  static documentName = "Item";
  static typeName = "PF1KS.Events";
  static filterClasses = [commonFilters.PackFilter, commonFilters.TagFilter, EventFilter];
}
