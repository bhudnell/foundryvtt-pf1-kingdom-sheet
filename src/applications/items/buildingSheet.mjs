import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class BuildingSheet extends ItemBaseSheet {
  async getData(options = {}) {
    const itemData = this.item.system;
    const context = await super.getData(options);

    // districtId
    const districtIdOptions = { "": "" };
    this.item.parent?.system.districts.forEach((district) => (districtIdOptions[district.id] = district.name));
    context.districtIdOptions = districtIdOptions;

    // buildingType
    context.buildingTypeOptions = Object.fromEntries(
      Object.entries(pf1ks.config.buildingTypes).map(([key, value]) => [key, value.name])
    );
    context.isCustom = itemData.type === "custom";

    // sidebar info
    context.subType = pf1ks.config.buildingTypes[itemData.type]?.name ?? "";
    context.states = [
      {
        field: "system.damaged",
        value: itemData.damaged,
        label: game.i18n.localize("PF1KS.Damaged"),
      },
    ];

    return context;
  }
}
