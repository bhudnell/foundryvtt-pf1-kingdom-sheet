import { buffTargets } from "../config/buffTargets.mjs";
import { contextNoteTargets } from "../config/contextNoteTargets.mjs";
import { log } from "../util/utils.mjs";

import { BaseMigrate } from "./baseMigrate.mjs";

export class MigrateV3 extends BaseMigrate {
  static improvementLog = null;
  static changeTargets = {};
  static noteTargets = {};

  static async preMigration() {
    this.improvementLog = await JournalEntry.create({ name: game.i18n.localize("PF1KS.Migration.ImprovementLog") });
    this.changeTargets = Object.fromEntries(Object.entries(buffTargets).map(([key, value]) => [key, value.label]));
    this.noteTargets = Object.fromEntries(Object.entries(contextNoteTargets).map(([key, value]) => [key, value.label]));
  }

  static async postMigration() {
    this.improvementLog.sheet.render(true);
  }

  static async migrateActor(actor) {
    if (actor.type !== pf1ks.config.kingdomId || actor.isToken) {
      return;
    }

    log(`migrating actor '${actor?.name}'`);
    const improvementItems = actor.itemTypes[`${pf1ks.config.moduleId}.improvement`];

    let content = `<h2>${game.i18n.localize("PF1KS.TerrainLabel")}</h2><ul>`;

    for (const [terrain, amount] of Object.entries(actor.system.terrain)) {
      content += `<li><p>${pf1ks.config.terrainTypes[terrain]}: ${amount}</p></li>`;
    }

    content += `</ul><h2>${game.i18n.localize("PF1KS.Migration.ImprovementList")}</h2><ul>`;

    for (const item of improvementItems) {
      content += `<li><p>${item.name} (${item.system.quantity}):`;

      for (const change of item.system.changes) {
        content += ` ${change.formula} ${game.i18n.localize(this.changeTargets[change.target])},`;
      }

      for (const note of item.system.contextNotes) {
        content += ` ${note.text} to ${game.i18n.localize(this.noteTargets[note.target])},`;
      }

      content += "</p></li>";
    }

    content += "</ul>";

    log("creating journal entry");
    const improvementLogPage = await JournalEntryPage.create(
      { name: actor?.name, text: { content } },
      { parent: this.improvementLog }
    );
    log("finished creating journal entry");

    log(`deleting improvement items from actor '${actor?.name}'`);
    const deletes = improvementItems.map((e) => e.id);
    await actor.deleteEmbeddedDocuments("Item", deletes);
    log(`...finished deleting improvement items from actor '${actor?.name}'`);

    log("...finished migrating actor");
  }

  static getItemUpdateData(item) {}
}
