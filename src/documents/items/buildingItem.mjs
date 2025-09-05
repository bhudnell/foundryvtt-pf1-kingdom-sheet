import { BaseItemKS } from "./baseItem.mjs";

export class BuildingItem extends BaseItemKS {
  get isActive() {
    return !this.system.damaged && this.system.quantity > 0 && this.isAssigned;
  }

  get isAssigned() {
    const settlementIds = this.parent?.system.settlements.map((settlement) => settlement.id) ?? [];
    const districtIds =
      this.parent?.system.settlements.flatMap((settlement) => settlement.districts.map((district) => district.id)) ??
      [];

    return settlementIds.includes(this.system.settlementId) && districtIds.includes(this.system.districtId);
  }
}
