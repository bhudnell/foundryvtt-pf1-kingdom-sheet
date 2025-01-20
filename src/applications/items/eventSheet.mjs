import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class EventSheet extends ItemBaseSheet {
  async getData(options = {}) {
    const itemData = this.item.system;
    const context = await super.getData(options);

    // settlementId
    const settlementIdOptions = { "": "" };
    this.item.parent?.system.settlements.forEach(
      (settlement) => (settlementIdOptions[settlement.id] = settlement.name)
    );
    context.settlementIdOptions = settlementIdOptions;

    // subType
    context.subTypeOptions = pf1ks.config.eventSubTypes;

    // sidebar info
    context.subType = pf1ks.config.itemSubTypes[itemData.subType];
    context.sidebarContent = [
      {
        isNumber: true,
        name: "system.turn",
        label: game.i18n.localize("PF1KS.Turn"),
        value: itemData.turn,
      },
    ];
    context.states = [
      {
        field: "system.continuous",
        value: itemData.continuous,
        label: game.i18n.localize("PF1KS.Continuous"),
      },
    ];

    return context;
  }
}
