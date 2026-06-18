export class HexStore {
  static getAll() {
    return canvas.scene.getFlag(pf1ks.config.moduleId, "hexes") ?? {};
  }

  static createDefault(q, r) {
    return {
      q,
      r,

      terrain: "plains",
      kingdomId: null,
      improvements: [],
      specialTerrain: [],
    };
  }

  static has(q, r) {
    return !!this.getAll()[`${q},${r}`];
  }

  static get(q, r) {
    const stored = this.getAll()[`${q},${r}`];

    return stored ?? this.createDefault(q, r);
  }

  static async set(q, r, data) {
    await canvas.scene.update({
      [`flags.${pf1ks.config.moduleId}.hexes.${q},${r}`]: data,
    });

    await canvas.kingdom?.draw();
  }

  static async delete(q, r) {
    const all = this.getAll();

    delete all[`${q},${r}`];

    await canvas.scene.setFlag(pf1ks.config.moduleId, "hexes", all);

    await canvas.kingdom?.draw();
  }
}
