import { BaseMigrate } from "./baseMigrate.mjs";

function getLotDimensions(lotSize) {
  if (lotSize <= 0) {
    return { width: 0, height: 0 };
  }

  let height = Math.floor(Math.sqrt(lotSize));
  while (lotSize % height !== 0) {
    height--;
  }
  let width = lotSize / height;

  // ensure width >= height
  if (width < height) {
    [width, height] = [height, width];
  }

  return { width, height };
}

export class MigrateV1 extends BaseMigrate {
  static getActorUpdateData(actor) {
    if (actor.type === pf1ks.config.kingdomId) {
      const settlements = foundry.utils.duplicate(actor.system.settlements ?? []);
      for (const settlement of settlements) {
        settlement.districts ??= [];
        for (let i = 0; i < settlement.districtCount; i++) {
          settlement.districts.push({
            name: game.i18n.format("PF1KS.NewDistrictLabel", { number: i + 1 }),
            id: foundry.utils.randomID(),
          });
        }
        settlement.districtCount = null;
      }

      return {
        "system.settlements": settlements,
      };
    }
  }

  static getItemUpdateData(item) {
    if (item.type === pf1ks.config.buildingId) {
      const { width, height } = getLotDimensions(item.system.lotSize);

      const settlement = item.parent?.system.settlements.find(
        (settlement) => settlement.id === item.system.settlementId
      );

      const districtId = settlement?.districts.length === 1 ? settlement.districts[0].id : undefined;

      return {
        _id: item.id,
        system: {
          width,
          height,
          quantity: null,
          districtId,
        },
      };
    }
  }

  static getItemCreateData(item) {
    if (item.type === pf1ks.config.buildingId) {
      const quantity = item.system.quantity;
      if (quantity > 1) {
        return Array.from({ length: quantity - 1 }, () => {
          const data = item.toObject();
          delete data.system.quantity;
          return data;
        });
      }
    }
  }

  static getItemDeleteData(item) {
    if (item.type === pf1ks.config.buildingId && item.system.quantity === 0) {
      return item.id;
    }
  }
}
