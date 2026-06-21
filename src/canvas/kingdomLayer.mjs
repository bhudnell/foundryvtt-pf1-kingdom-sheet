import { validateImprovement } from "../util/utils.mjs";

import { HexRenderer } from "./hexRenderer.mjs";
import { HexStore } from "./hexStore.mjs";

export class KingdomLayer extends foundry.canvas.layers.InteractionLayer {
  static get layerOptions() {
    return foundry.utils.mergeObject(super.layerOptions, {
      name: "kingdom",
      zIndex: 50,
    });
  }

  constructor() {
    super();

    this.shouldDraw = game.settings.get(pf1ks.config.moduleId, pf1ks.config.viewInOtherLayersSetting);
  }

  async _draw(options) {
    await super._draw(options);

    if (!this._hoverTicker) {
      this._hoverTicker = this._updateHover.bind(this);
      canvas.app.ticker.add(this._hoverTicker);
    }

    if (!canvas.grid.isHexagonal) {
      return;
    }

    // draw overlays only if visible
    if (this.shouldDraw) {
      this.hexContainer = this.addChild(new PIXI.Container());
      HexRenderer.draw(this.hexContainer);
    }
  }

  async _tearDown(options) {
    if (this._hoverTicker) {
      canvas.app.ticker.remove(this._hoverTicker);
      this._hoverTicker = null;
    }

    return super._tearDown(options);
  }

  _activate() {
    this.shouldDraw = true;
    this.draw();
  }

  _deactivate() {
    this.shouldDraw = game.settings.get(pf1ks.config.moduleId, pf1ks.config.viewInOtherLayersSetting);
    this.draw();

    if (!this.shouldDraw) {
      pf1ks.tooltip.style.display = "none";
      this._hoveredHexKey = null;
    }
  }

  _updateHover() {
    if (!this.shouldDraw) {
      if (this._hoveredHexKey) {
        this._onPointerOut();
      }
      return;
    }

    const mouse = pf1ks.mouse;
    if (!mouse) {
      return;
    }

    // throttle to once per 50ms
    const now = Date.now();
    if (now - (this._lastHoverCheck ?? 0) < 50) {
      return;
    }
    this._lastHoverCheck = now;

    // dont render when not over canvas
    const hoveredElement = document.elementFromPoint(mouse.x, mouse.y);
    if (hoveredElement !== canvas.app.view && !canvas.app.view.contains(hoveredElement)) {
      if (this._hoveredHexKey) {
        this._onPointerOut();
      }
      return;
    }

    const rect = canvas.app.view.getBoundingClientRect();

    const screenX = mouse.x - rect.left;
    const screenY = mouse.y - rect.top;

    // Mouse is outside canvas
    if (screenX < 0 || screenY < 0 || screenX >= rect.width || screenY >= rect.height) {
      this._onPointerOut();
      return;
    }

    const world = canvas.stage.toLocal({
      x: screenX,
      y: screenY,
    });

    const coords = canvas.grid.getOffset(world);

    const key = `${coords.i},${coords.j}`;

    if (key === this._hoveredHexKey) {
      return;
    }

    this._hoveredHexKey = key;

    const hex = HexStore.get(coords.i, coords.j);

    if (!hex) {
      this._onPointerOut();
      return;
    }

    this._showTooltip(hex);
  }

  _onPointerOut() {
    pf1ks.tooltip.style.display = "none";
    this._hoveredHexKey = null;
  }

  _showTooltip(hex) {
    const tooltip = pf1ks.tooltip;

    tooltip.innerHTML = `
      <strong>
        ${pf1ks.config.terrainTypes[hex.terrain]}
      </strong>

      <br>

      Kingdom:
      ${game.actors.get(hex.kingdomId)?.name ?? "Unclaimed"}
    `;

    tooltip.style.display = "block";

    const center = canvas.grid.getCenterPoint({
      i: hex.q,
      j: hex.r,
    });

    const wt = canvas.stage.worldTransform;
    const screenX = center.x * wt.a + wt.tx;
    const screenY = center.y * wt.d + wt.ty;

    const rect = tooltip.getBoundingClientRect();
    tooltip.style.left = `${screenX - rect.width / 2}px`;
    tooltip.style.top = `${screenY - rect.height - 12}px`;
  }

  _prepareTerrainImprovements(hex) {
    const kingdom = game.actors.get(hex.kingdomId);

    return Object.keys(pf1ks.config.terrainImprovements).map((id) => {
      const improvement = pf1ks.config.terrainImprovements[id];

      const result = validateImprovement(improvement, { hex, kingdom });

      return {
        id,
        label: improvement.name,
        checked: hex.improvements.includes(id),
        disabled: !result.valid,
        errors: result.failures,
      };
    });
  }

  async _onClickLeft(event) {
    if (game.activeTool !== "editHexes") {
      return;
    }

    const pos = event.interactionData.origin;
    const coords = canvas.grid.getOffset(pos);
    const hex = HexStore.get(coords.i, coords.j);

    const kingdomOptions = { "": "" };
    game.actors
      .filter(
        (actor) => actor.permission > CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE && actor.type === pf1ks.config.kingdomId
      )
      .forEach((actor) => (kingdomOptions[actor.id] = actor.name));

    const templateData = {
      hex,
      kingdomOptions,
      terrainOptions: pf1ks.config.terrainTypes,
      improvementOptions: this._prepareTerrainImprovements(hex),
      specialTerrainOptions: Object.entries(pf1ks.config.specialTerrain).reduce((acc, [key, obj]) => {
        acc[key] = obj.name;
        return acc;
      }, {}),
    };

    const content = await renderTemplate(
      `modules/${pf1ks.config.moduleId}/templates/canvas/hex-edit.hbs`,
      templateData
    );

    new foundry.applications.api.DialogV2({
      window: { title: `Hex ${coords.i},${coords.j}` },
      content,
      buttons: [
        {
          action: "save",
          label: "Save",
          default: true,
          callback: (event, button, dialog) => button.form.elements,
        },

        {
          action: "delete",
          label: "Reset",
        },
      ],
      submit: async (result) => {
        if (result === "delete") {
          await HexStore.delete(coords.i, coords.j);
        } else {
          hex.terrain = result.terrain.value;
          hex.kingdomId = result.kingdomId.value || null;
          hex.improvements = []; // TODO
          hex.specialTerrain = []; // TODO
          await HexStore.set(coords.i, coords.j, hex);
        }
      },
    }).render({ force: true });
  }

  static prepareSceneControls() {
    return {
      name: "kingdom",
      title: "Kingdom",
      icon: "fa-solid fa-crown",
      onChange: (event, active) => {
        if (active) {
          canvas.kingdom.activate();
        }
      },
      tools: {
        viewHexes: {
          name: "viewHexes",
          order: 1,
          title: "View Hexes",
          icon: "fa-solid fa-eye",
        },
        editHexes: {
          name: "editHexes",
          order: 2,
          title: "Edit Hexes",
          icon: "fa-solid fa-draw-polygon",
          visible: game.user.isGM, // TODO maybe this is a setting?
        },
        viewInOtherLayers: {
          name: "viewInOtherLayers",
          order: 3,
          title: "Show in Other Layers",
          icon: "fa-solid fa-layer-group",
          toggle: true,
          active: game.settings.get(pf1ks.config.moduleId, pf1ks.config.viewInOtherLayersSetting),
          onChange: (event, active) => {
            game.settings.set(pf1ks.config.moduleId, pf1ks.config.viewInOtherLayersSetting, active);
          },
        },
      },
      activeTool: "viewHexes",
    };
  }
}
