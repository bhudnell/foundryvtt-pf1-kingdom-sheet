import { keepUpdateArray } from "../../util/utils.mjs";

export class BaseItemKS extends pf1.documents.item.ItemPF {
  static system = Object.freeze({
    hasChanges: true,
    subtypeName: false,
  });

  async update(data, context = {}) {
    const changed = foundry.utils.expandObject(data);

    if (changed.system) {
      const keepPaths = ["system.contextNotes"];

      const itemData = this.toObject();
      for (const path of keepPaths) {
        keepUpdateArray(itemData, changed, path);
      }
    }

    super.update(foundry.utils.flattenObject(changed), context);
  }

  getLabels({ actionId, rollData } = {}) {
    return {};
  }
}
