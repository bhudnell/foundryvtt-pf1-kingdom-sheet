import { BaseItemKS } from "./baseItem.mjs";

export class EventItem extends BaseItemKS {
  static system = Object.freeze({
    ...super.system,
    subtypeName: true,
  });
}
