import { log } from "../util/utils.mjs";

const truthiness = (x) => (typeof x === "string" ? !!x?.trim() : !!x);

export class BaseMigrate {
  static getItemUpdateData(item) {
    throw new Error("must be overridden");
  }

  static async migrateItem(item) {
    log(`migrating item: '${item.name}' (${item._id})`);

    const data = this.getItemUpdateData(item);
    if (data) {
      await item.update(data);
    }

    log("...finished migrating item");
  }

  static async migrateActor(actor) {
    log(`migrating items for actor '${actor?.name}'`);

    if (actor?.items?.size) {
      const updates = actor.items.map(this.getItemUpdateData).filter(truthiness);
      if (updates.length) {
        await actor.updateEmbeddedDocuments("Item", updates);
      }
    }

    log("...finished migrating actor");
  }

  static async migrateWorldItems() {
    log("migrating game items");

    await game.items?.updateAll((item) => this.getItemUpdateData(item) || {});

    log("...finished migrating game items");
  }

  static async migratePacks() {
    log("migrating unlocked packs");

    for (const pack of game.packs.filter((x) => x.documentName === "Item" && !x.locked)) {
      // eslint-disable-next-line no-await-in-loop
      await pack.updateAll((item) => this.getItemUpdateData(item) || {});
    }

    for (const pack of game.packs.filter((x) => x.documentName === "Actor" && !x.locked)) {
      // eslint-disable-next-line no-await-in-loop
      const actors = await pack.getDocuments();
      for (const actor of actors) {
        const updates = actor.items.map(this.getItemUpdateData).filter(truthiness);
        if (updates.length) {
          // eslint-disable-next-line no-await-in-loop
          await actor.updateEmbeddedDocuments("Item", updates);
        }
      }
    }

    log("...finished migrating unlocked packs");
  }

  static async migrateWorldActors() {
    log("migrating world actors");

    for (const actor of game.actors) {
      const updates = actor.items.map(this.getItemUpdateData).filter(truthiness);
      if (updates.length) {
        // eslint-disable-next-line no-await-in-loop
        await actor.updateEmbeddedDocuments("Item", updates);
      }
    }

    log("...finished migrating world actors");
  }

  static async migrateSyntheticActors() {
    log("migrating synthetic actors");

    const synthetics = [...game.scenes].flatMap((s) =>
      [...s.tokens].filter((t) => !t.isLinked && t.actor?.items?.size)
    );
    for (const synthetic of synthetics) {
      if (synthetic.actor) {
        const updates = synthetic.actor.items.map(this.getItemUpdateData).filter(truthiness);
        if (updates.length) {
          // eslint-disable-next-line no-await-in-loop
          await synthetic.actor.updateEmbeddedDocuments("Item", updates);
        }
      }
    }

    log("...finished migrating synthetic actors");
  }

  static async migrateWorld() {
    await this.migrateWorldItems();
    await this.migratePacks();
    await this.migrateWorldActors();
    await this.migrateSyntheticActors();
  }
}
