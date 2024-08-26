import { armyHD, armySelectorOptions, armySizes, CFG } from "../../config.mjs";

export class ArmySheet extends ActorSheet {
  constructor(...args) {
    super(...args);

    this._expandedItems = new Set();
  }
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      template: `modules/${CFG.id}/templates/actors/army/army-sheet.hbs`,
      classes: [...options.classes, "kingdom", "actor"],
      tabs: [
        {
          navSelector: "nav.tabs[data-group='primary']",
          contentSelector: "section.primary-body",
          initial: "summary",
          group: "primary",
        },
      ],
    };
  }

  async getData() {
    const actor = this.actor;
    const actorData = actor.system;

    const data = {
      ...this.actor,
      enrichedNotes: await TextEditor.enrichHTML(actorData.notes),
      editable: this.isEditable,
    };

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
    data.tactics = actorData.tactics.value
      .map((tactic) => game.i18n.localize(armySelectorOptions.tactics[tactic]))
      .join(", ");
    data.resources = actorData.resources.value
      .map((res) => game.i18n.localize(armySelectorOptions.resources[res]))
      .join(", ");
    data.special = actorData.special.value
      .map((special) => game.i18n.localize(armySelectorOptions.special[special]))
      .join(", ");
    data.boons = actorData.commander.boons.value
      .map((boons) => game.i18n.localize(armySelectorOptions.boons[boons]))
      .join(", ");

    // commander
    data.commanderChoices = game.actors
      .filter((actor) => actor.permission > 0 && (actor.type === "character" || actor.type === "npc"))
      .reduce((acc, actor) => {
        acc[actor.id] = actor.name;
        return acc;
      }, {});
    data.actorId = actorData.commander.actor?.id;

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
