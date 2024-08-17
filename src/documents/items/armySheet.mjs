import { armyHD, armySelectorOptions, armySizes } from "../../config.mjs";

import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class ArmySheet extends ItemBaseSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "army"],
    };
  }

  async getData() {
    const data = await super.getData();
    const itemData = this.item.system;

    data.isArmy = true;
    data.type = game.i18n.localize("PF1KS.ArmyLabel");

    // selectors
    data.sizeChoices = Object.entries(armySizes).reduce((acc, [key, label]) => {
      acc[key] = game.i18n.localize(label);
      return acc;
    }, {});
    data.hdChoices = Object.keys(armyHD).reduce((acc, key) => {
      acc[key] = key;
      return acc;
    }, {});

    // labels
    data.tactics = itemData.tactics.value
      .map((tactic) => game.i18n.localize(armySelectorOptions.tactics[tactic]))
      .join(", ");
    data.resources = itemData.resources.value
      .map((res) => game.i18n.localize(armySelectorOptions.resources[res]))
      .join(", ");
    data.special = itemData.special.value
      .map((special) => game.i18n.localize(armySelectorOptions.special[special]))
      .join(", ");
    data.boons = itemData.commander.boons.value
      .map((boons) => game.i18n.localize(armySelectorOptions.boons[boons]))
      .join(", ");

    // commander
    data.commanderChoices = game.actors
      .filter((actor) => actor.permission > 0 && (actor.type === "character" || actor.type === "npc"))
      .reduce((acc, actor) => {
        acc[actor.id] = actor.name;
        return acc;
      }, {});
    data.actorId = itemData.commander.actor?.id;

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".trait-selector").on("click", (e) => this._onTraitSelector(e));
  }

  _onTraitSelector(event) {
    event.preventDefault();

    const a = event.currentTarget;
    const label = a.parentElement.querySelector("label");

    const choices = Object.fromEntries(
      Object.entries(armySelectorOptions[a.dataset.options]).map(([key, label]) => [key, game.i18n.localize(label)])
    );

    const app = new pf1.applications.ActorTraitSelector(this.item, {
      name: a.dataset.for,
      title: label.innerText,
      subject: a.dataset.options,
      choices,
    });
    app.render(true, { focus: true });
  }
}
