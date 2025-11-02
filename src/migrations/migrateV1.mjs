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
  static getItemUpdateData(item) {
    // calculate building lot sizes based on lot size
    if (item.type === pf1ks.config.buildingId) {
      const { width, height } = getLotDimensions(item.system.lotSize);

      return {
        _id: item.id,
        system: {
          width,
          height,
        },
      };
    }
  }
}
