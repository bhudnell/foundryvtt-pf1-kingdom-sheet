import { log } from "../util/utils.mjs";

import { BaseMigrate } from "./baseMigrate.mjs";

export class MigrateV2 extends BaseMigrate {
  static async migrateActor(actor) {
    if (actor.type !== pf1ks.config.kingdomId) {
      return;
    }

    log(`migrating actor '${actor?.name}'`);

    // create settlement actors
    const settlements = actor.system.settlements;

    log(`creating ${settlements.length} new settlement actors`);
    const settlementActors = await Actor.implementation.createDocuments(
      settlements.map((s) => {
        const { name, id, districtCount, ...system } = s.toObject();
        return { name, type: pf1ks.config.settlementId, system };
      })
    );
    log(`...finished creating ${settlementActors.length} new settlement actors`);

    // create map of kingdom settlement id -> settlement actor id
    const settlementActorIdByName = new Map(settlementActors.map((sa) => [sa.name, sa.id]));
    const kingdomSettlementIdByName = new Map(settlements.map((sa) => [sa.name, sa.id]));

    // create settlement proxy items on kingdom
    const settlementProxies = settlements.map((s) => ({
      id: foundry.utils.randomID(),
      actor: settlementActorIdByName.get(s.name),
    }));

    // unset kingdom settlement array and set the new settlement proxies
    log(`updating actor '${actor?.name}'`);
    await actor.update({ "system.settlements": [], "system.settlementProxies": settlementProxies });
    log(`...finished updating actor '${actor?.name}'`);

    // get list of building and feature items that belong to each settlement
    // and add those items to each settlement actor
    const itemCreatePromises = settlementActors.map(async (sa) => {
      const creates = actor.items
        .filter(
          (i) =>
            pf1ks.config.settlementItemTypes.includes(i.type) &&
            i.system.settlementId === kingdomSettlementIdByName.get(sa.name)
        )
        .map((e) => {
          const data = game.items.fromCompendium(e);
          delete data.system.settlementId;
          return data;
        });
      if (creates.length) {
        return sa.createEmbeddedDocuments("Item", creates);
      }
    });
    log(`adding items to settlement actors`);
    await Promise.all(itemCreatePromises);
    log(`...finished adding items to settlement actors`);

    // delete building and feature items from kingdom
    const deletes = actor.items.filter((i) => pf1ks.config.settlementItemTypes.includes(i.type)).map((e) => e.id);
    if (deletes.length) {
      log(`deleting items from actor '${actor?.name}'`);
      await actor.deleteEmbeddedDocuments("Item", deletes);
      log(`...finished deleting items from actor '${actor?.name}'`);
    }

    log("...finished migrating actor");
  }

  static getItemUpdateData(item) {} // TODO maybe remove settlementId from events and improvements
}
