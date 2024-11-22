import {
  alignments,
  armyHD,
  armySizes,
  armyStrategy,
  CFG,
  kingdomBoonId,
  kingdomSpecialId,
  kingdomTacticId,
} from "../../config/config.mjs";

export class ArmySheet extends pf1.applications.actor.ActorSheetPF {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "kingdom"],
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

  get template() {
    return `modules/${CFG.id}/templates/actors/army/${this.isEditable ? "edit" : "view"}.hbs`;
  }

  async getData() {
    const actor = this.actor;
    const actorData = actor.system;
    const isOwner = actor.isOwner;

    const data = {
      ...this.actor,
      owner: isOwner,
      enrichedNotes: await TextEditor.enrichHTML(actorData.notes.value ?? "", {
        rolldata: actor.getRollData(),
        async: true,
        secrets: this.object.isOwner,
        relativeTo: this.actor,
      }),
      editable: this.isEditable,
      cssClass: isOwner ? "editable" : "locked",
    };

    data.sections = this._prepareItems();

    // selectors
    data.alignmentChoices = Object.fromEntries(
      Object.entries(alignments).map(([key, label]) => [key, game.i18n.localize(label)])
    );
    data.hdChoices = Object.fromEntries(Object.keys(armyHD).map((key) => [key, key]));
    data.sizeChoices = Object.entries(armySizes)
      .map(([key, label]) => ({ key, label: game.i18n.localize(label) }))
      .sort((a, b) => Number(a.key) - Number(b.key));
    data.strategyChoices = Object.entries(armyStrategy)
      .map(([key, label]) => ({ key, label: game.i18n.localize(label) }))
      .sort((a, b) => Number(a.key) - Number(b.key));

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

    html.find(".resource").on("change", (e) => this._onTogglePairedResource(e));

    html.find(".attribute .rollable").on("click", (e) => this._onRollAttribute(e));
  }

  _prepareItems() {
    const features = [];
    for (const section of Object.values(pf1.config.sheetSections.armyFeature)) {
      section.items = this.actor.itemTypes[section.create.type];
      features.push(section);
    }

    const commander = [];
    for (const section of Object.values(pf1.config.sheetSections.armyCommander)) {
      section.items = this.actor.itemTypes[section.create.type];
      commander.push(section);
    }

    const categories = [
      { key: "features", sections: features },
      { key: "commander", sections: commander },
    ];

    for (const { key, sections } of categories) {
      const set = this._filters.sections[key];
      for (const section of sections) {
        if (!section) {
          continue;
        }
        section._hidden = set?.size > 0 && !set.has(section.id);
      }
    }

    return { features, commander };
  }

  _onTogglePairedResource(event) {
    const pair = event.currentTarget.closest(".resource").dataset.pair;

    if (event.target.checked) {
      this.actor.update({ "system.resources": { [pair]: false } });
    }
  }

  async _onRollAttribute(event) {
    event.preventDefault();
    const attribute = event.currentTarget.closest(".attribute").dataset.attribute;
    this.actor.system.rollAttribute(attribute, { actor: this.actor });
  }

  // overrides
  _focusTabByItem(item) {
    let tabId;
    switch (item.type) {
      case kingdomBoonId:
        tabId = "commander";
        break;
      case kingdomSpecialId:
      case kingdomTacticId:
        tabId = "features";
        break;
      default:
        tabId = "summary";
    }

    if (tabId) {
      this.activateTab(tabId, "primary");
    }
  }

  _getTooltipContext(fullId, context) {
    const actor = this.actor;
    const actorData = actor.system;

    // Lazy roll data
    const lazy = {
      get rollData() {
        this._rollData ??= actor.getRollData();
        return this._rollData;
      },
    };

    const getSource = (path) => this.actor.sourceDetails[path];

    const getNotes = (context, all = true) => {
      const noteObjs = actor.getContextNotes(context, all);
      return actor.formatContextNotes(noteObjs, lazy.rollData, { roll: false });
    };

    let header, subHeader;
    const details = [];
    const paths = [];
    const sources = [];
    let notes;

    const re = /^(?<id>[\w-]+)(?:\.(?<detail>.*))?$/.exec(fullId);
    const { id } = re?.groups ?? {};

    switch (id) {
      case "acr":
        paths.push({
          path: "@acr",
          value: actorData.acr,
        });
        break;
      case "hp":
        paths.push(
          {
            path: "@hp.current",
            value: actorData.hp.current,
          },
          {
            path: "@hp.max",
            value: actorData.hp.max,
          }
        );
        break;
      case "speed":
        sources.push(
          {
            sources: getSource("system.speed.total"),
            untyped: true,
          },
          {
            sources: getSource("system.speed.base"),
            untyped: true,
          }
        );
        paths.push(
          {
            path: "@speed.base",
            value: actorData.speed.base,
            unit: game.i18n.localize("PF1KS.Army.SpeedUnit"),
          },
          {
            path: "@speed.total",
            value: actorData.speed.total,
            unit: game.i18n.localize("PF1KS.Army.SpeedUnit"),
          }
        );
        break;
      case "morale":
        paths.push(
          {
            path: "@morale.base",
            value: actorData.morale.base,
          },
          {
            path: "@morale.commander",
            value: actorData.morale.commander,
          },
          {
            path: "@morale.total",
            value: actorData.morale.total,
          }
        );
        sources.push({
          sources: getSource("system.morale.total"),
          untyped: true,
        });
        notes = getNotes(`${CFG.changePrefix}_morale`);
        break;
      case "dv":
      case "om":
      case "consumption":
        paths.push(
          {
            path: `@${id}.base`,
            value: actorData[id].base,
          },
          {
            path: `@${id}.total`,
            value: actorData[id].total,
          }
        );
        sources.push({
          sources: getSource(`system.${id}.total`),
          untyped: true,
        });
        notes = getNotes(`${CFG.changePrefix}_${id}`);
        break;
      case "damageBonus":
        paths.push({
          path: "@damageBonus.total",
          value: actorData.damageBonus.total,
        });
        sources.push({
          sources: getSource("system.damageBonus.total"),
          untyped: true,
        });
        notes = getNotes(`${CFG.changePrefix}_damage`);
        break;
      case "maxTactics":
        sources.push({
          sources: getSource("system.tactics.max.total"),
          untyped: true,
        });
        break;
      case "commander":
        paths.push(
          {
            path: "@commander.chaMod",
            value: actorData.commander.chaMod,
          },
          {
            path: "@commander.profSoldier",
            value: actorData.commander.profSoldier,
          },
          {
            path: "@commander.leadership",
            value: actorData.commander.leadership,
          }
        );
        break;

      default:
        throw new Error(`Invalid extended tooltip identifier "${fullId}"`);
    }

    context.header = header;
    context.subHeader = subHeader;
    context.details = details;
    context.paths = paths;
    context.sources = sources;
    context.notes = notes ?? [];
  }
}
