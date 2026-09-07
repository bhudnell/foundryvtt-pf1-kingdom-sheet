export class HexStore {
  static getAll(scene) {
    scene ??= canvas.scene;
    return scene.getFlag(pf1ks.config.moduleId, "hexes") ?? {};
  }

  static getKingdomHexes(kingdomId, scene) {
    return Object.values(this.getAll(scene)).filter((hex) => hex.status === "claimed" && hex.kingdomId === kingdomId);
  }

  static createDefault(q, r) {
    return {
      q,
      r,

      name: game.i18n.format("PF1KS.DefaultHexName", { name: `${q},${r}` }),
      status: "unexplored",
      terrain: "plains",
      kingdomId: null,
      improvements: [],
      specialTerrain: [],
    };
  }

  static has(q, r, scene) {
    scene ??= canvas.scene;
    return !!this.getAll(scene)[`${q},${r}`];
  }

  static get(q, r, scene) {
    scene ??= canvas.scene;
    const stored = this.getAll(scene)[`${q},${r}`];

    return stored ?? this.createDefault(q, r);
  }

  static async set(q, r, data, scene) {
    scene ??= canvas.scene;

    await scene.update({
      [`flags.${pf1ks.config.moduleId}.hexes.${q},${r}`]: data,
    });
  }

  static async delete(q, r, scene) {
    scene ??= canvas.scene;
    const all = this.getAll(scene);

    delete all[`${q},${r}`];

    await scene.setFlag(pf1ks.config.moduleId, "hexes", all);
  }

  static getKingdomIds(scene) {
    scene ??= canvas.scene;
    const kingdomIdSet = Object.values(this.getAll(scene)).reduce((kingdomIds, hex) => {
      if (hex.status === "claimed") {
        kingdomIds.add(hex.kingdomId);
      }
      return kingdomIds;
    }, new Set());

    return [...kingdomIdSet];
  }
}
