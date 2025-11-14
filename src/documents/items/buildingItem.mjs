import { BaseItemKS } from "./baseItem.mjs";

export class BuildingItem extends BaseItemKS {
  get isActive() {
    return !this.system.damaged && this.isAssigned && !this.error;
  }

  get isAssigned() {
    const settlementIds = this.parent?.system.settlements.map((settlement) => settlement.id) ?? [];
    const districtIds =
      this.parent?.system.settlements.flatMap((settlement) => settlement.districts.map((district) => district.id)) ??
      [];

    return settlementIds.includes(this.system.settlementId) && districtIds.includes(this.system.districtId);
  }

  get inGrid() {
    const { lotSize, x, y, width, height } = this.system;

    // no x, y, or lots
    if (x === null || y === null || lotSize < 1) {
      return false;
    }

    // width * height != lot size
    if (lotSize !== width * height) {
      return false;
    }

    return true;
  }

  get error() {
    const { lotSize, x, y, width, height } = this.system;

    // width * height != lot size
    if (lotSize !== width * height) {
      return pf1ks.config.buildingErrors.lotSizeMismatch;
    }

    // has lots but not placed
    if (lotSize > 0 && (x === null || y === null)) {
      return pf1ks.config.buildingErrors.unplacedLotBuilding;
    }

    return undefined;
  }
}
