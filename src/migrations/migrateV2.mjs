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
        return {
          name,
          type: pf1ks.config.settlementId,
          "prototypeToken.actorLink": true,
          system: {
            ...system,
            kingdom: { id: foundry.utils.randomID(), actor: actor.id },
            magicItems: {
              minor: { items: system.magicItems.minor },
              medium: { items: system.magicItems.medium },
              major: { items: system.magicItems.major },
            },
          },
        };
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

    // get list of building, feature, and event items that belong to each settlement
    // and add those items to each settlement actor
    const itemCreatePromises = settlementActors.map(async (sa) => {
      const creates = actor.items
        .filter(
          (i) =>
            [...pf1ks.config.settlementItemTypes, pf1ks.config.kingdomEventId].includes(i.type) &&
            i.system.settlementId === kingdomSettlementIdByName.get(sa.name)
        )
        .map((e) => {
          const data = game.items.fromCompendium(e);
          if (data.type === pf1ks.config.kingdomEventId) {
            data.type = pf1ks.config.settlementEventId;
          }
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

    // delete building, feature, and settlement event items from kingdom
    const deletes = actor.items
      .filter((i) => {
        if (pf1ks.config.settlementItemTypes.includes(i.type)) {
          return true;
        }
        if (i.type === pf1ks.config.kingdomEventId && i.system.settlementId) {
          return true;
        }
        return false;
      })
      .map((e) => e.id);
    if (deletes.length) {
      log(`deleting items from actor '${actor?.name}'`);
      await actor.deleteEmbeddedDocuments("Item", deletes);
      log(`...finished deleting items from actor '${actor?.name}'`);
    }

    // migrate army actors to add a link to the kingdom
    const armyUpdatePromises = actor.system.armies.map((army) => {
      const armyActor = game.actors.get(army.actor.id);
      return armyActor.update({ "system.kingdom": { id: foundry.utils.randomID(), actor: actor.id } });
    });
    log(`linking armies from actor '${actor?.name}'`);
    await Promise.all(armyUpdatePromises);
    log(`...finished linking armies from actor '${actor?.name}'`);

    log("...finished migrating actor");
  }

  static getItemUpdateData(item) {}
}
