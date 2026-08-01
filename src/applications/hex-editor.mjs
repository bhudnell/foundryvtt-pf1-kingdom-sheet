import { HexStore } from "../canvas/hexStore.mjs";
import { moduleId } from "../config/config.mjs";
import { validateImprovement } from "../util/utils.mjs";

import { ImprovementSelector } from "./improvement-selector.mjs";

const { DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class HexEditor extends HandlebarsApplicationMixin(DocumentSheetV2) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    form: {
      handler: this._onSubmit,
      submitOnChange: true,
      submitOnClose: true,
      closeOnSubmit: false,
    },
    classes: ["pf1ks", "hex-editor", "pf1-v2", "standard-form"],
    window: {
      minimizable: false,
      resizable: true,
    },
    position: {
      width: 400,
    },
    sheetConfig: false,
  };

  static PARTS = {
    form: {
      template: `modules/${moduleId}/templates/apps/hex-editor.hbs`,
    },
  };

  constructor(options) {
    super(options);
    this.hex = options.hex;
  }

  get scene() {
    return this.document;
  }

  get title() {
    return this.hex.name ?? "";
  }

  async _prepareContext() {
    this.hex = HexStore.get(this.hex.q, this.hex.r);
    const hex = this.hex;

    const kingdomOptions = { "": "" };
    game.actors
      .filter(
        (actor) => actor.permission > CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE && actor.type === pf1ks.config.kingdomId
      )
      .forEach((actor) => (kingdomOptions[actor.id] = actor.name));

    return {
      hex: {
        ...hex,
        improvements: hex.improvements?.map((i) => pf1ks.config.terrainImprovements[i].name) ?? [],
        specialTerrain: hex.specialTerrain?.map((st) => pf1ks.config.specialTerrain[st].name) ?? [],
      },
      statusOptions: pf1ks.config.hexStatuses, // TODO add logic where kingdom is only available if status is Claimed
      kingdomOptions,
      terrainOptions: pf1ks.config.terrainTypes,
      improvementPath: `flags.${pf1ks.config.moduleId}.hexes.${hex.q},${hex.r}.improvements`,
      specialTerrainPath: `flags.${pf1ks.config.moduleId}.hexes.${hex.q},${hex.r}.specialTerrain`,
    };
  }

  _onRender(context, options) {
    super._onRender(context, options);

    this.element.querySelectorAll(".improvement-selector").forEach((el) => {
      el.addEventListener("click", (e) => this._onImprovementSelector(e));
    });

    this.element.reportValidity();
  }

  static async wait(options) {
    const old = Object.values(foundry.applications.instances).find(
      (app) => app instanceof this && app.hex === options.hex
    );

    if (old) {
      old.render(true);
      old.bringToFront();
      return old;
    }

    return new Promise((resolve) => {
      options.document = options.scene;
      const app = new this(options);
      app.resolve = resolve;
      app.render(true);
    });
  }

  static _onSubmit(event, form, formData) {
    formData = formData.object;
    const updateData = { ...this.hex, ...foundry.utils.expandObject(formData) };
    if (!updateData.kingdomId) {
      updateData.kingdomId = null;
    }
    HexStore.set(this.hex.q, this.hex.r, updateData);
  }

  _onImprovementSelector(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const label = a.parentElement.parentElement.querySelector("label");

    const options = {
      name: a.dataset.for,
      title: label.innerText,
      subject: a.dataset.options,
      hasCustom: false,
      choices: Object.fromEntries(
        Object.entries(pf1ks.config[a.dataset.options]).map(([key, value]) => [key, value.name])
      ),
      document: this.scene,
      hex: this.hex,
      kingdom: game.actors.get(this.hex.kingdomId),
      sceneEditor: this,
    };

    const app = Object.values(this.scene.apps).find(
      (app) => app instanceof ImprovementSelector && app.options.name === options.name
    );
    if (app) {
      app.render(true);
      app.bringToFront();
    } else {
      new ImprovementSelector(options).render({ force: true });
    }
  }
}
