import { HexEditor } from "../applications/hex-editor.mjs";
import { renderCachedTemplate } from "../util/utils.mjs";

import { HexRenderer } from "./hexRenderer.mjs";
import { HexStore } from "./hexStore.mjs";

// TODO move elsewhere?
export function isKingdomScene(scene) {
  if (!scene) {
    return false;
  }

  return scene.grid.isHexagonal && scene.getFlag(pf1ks.config.moduleId, "isKingdomMap") === true;
}

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

    if (!isKingdomScene(canvas.scene)) {
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
      this._hoveredHexKey = null;
    }
  }

  _updateHover() {
    if (!this.shouldDraw || !isKingdomScene(canvas.scene)) {
      this._hoveredHexKey = null;
      return;
    }

    const mouse = pf1ks.mouse;
    if (!mouse) {
      this._hoveredHexKey = null;
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
      this._hoveredHexKey = null;
      return;
    }

    const rect = canvas.app.view.getBoundingClientRect();

    const screenX = mouse.x - rect.left;
    const screenY = mouse.y - rect.top;

    const world = canvas.stage.toLocal({
      x: screenX,
      y: screenY,
    });

    // dont render when mouse is outside scene
    if (!canvas.dimensions.sceneRect.contains(world.x, world.y)) {
      this._hoveredHexKey = null;
      game.tooltip.deactivate();
      return;
    }

    const coords = canvas.grid.getOffset(world);

    const key = `${coords.i},${coords.j}`;

    if (key === this._hoveredHexKey) {
      return;
    }

    this._hoveredHexKey = key;

    const hex = HexStore.get(coords.i, coords.j);

    if (!hex || hex.q < 0 || hex.r < 0) {
      this._hoveredHexKey = null;
      return;
    }

    this._showTooltip(hex);
  }

  _showTooltip(hex) {
    const center = canvas.grid.getCenterPoint({
      i: hex.q,
      j: hex.r,
    });

    const wt = canvas.stage.worldTransform;
    const screenX = center.x * wt.a + wt.tx;
    const screenY = center.y * wt.d + wt.ty;

    const tooltip = pf1ks.tooltip;
    const rect = tooltip.getBoundingClientRect();
    tooltip.style.left = `${screenX - rect.width / 2}px`;
    tooltip.style.top = `${screenY - rect.height - 12}px`;

    const context = {
      name: hex.name,
      terrain: pf1ks.config.terrainTypes[hex.terrain],
      status: pf1ks.config.hexStatuses[hex.status],
      showKingdom: hex.status === "claimed",
      kingdom: game.actors.get(hex.kingdomId)?.name,
      improvements: (hex.improvements ?? []).map((i) => pf1ks.config.terrainImprovements[i].name).join(", "),
      specialTerrain: (hex.specialTerrain ?? []).map((i) => pf1ks.config.specialTerrain[i].name).join(", "),
    };

    game.tooltip.activate(tooltip, {
      html: renderCachedTemplate("hex-tooltip", context),
      direction: foundry.helpers.interaction.TooltipManager.implementation.TOOLTIP_DIRECTIONS.UP,
      cssClass: "pf1ks hex-tooltip",
    });
  }

  async _onClickLeft(event) {
    if (game.activeTool !== "editHexes") {
      return;
    }

    const pos = event.interactionData.origin;
    const coords = canvas.grid.getOffset(pos);
    const hex = HexStore.get(coords.i, coords.j);

    if (hex && hex.q >= 0 && hex.r >= 0) {
      HexEditor.wait({ hex, scene: canvas.scene });
    }
  }

  static prepareSceneControls() {
    if (!isKingdomScene(canvas.scene)) {
      return;
    }

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
          title: "PF1KS.ViewHexes",
          icon: "fa-solid fa-eye",
        },
        editHexes: {
          name: "editHexes",
          order: 2,
          title: "PF1KS.EditHexes",
          icon: "fa-solid fa-draw-polygon",
          visible:
            game.user.role >=
            CONST.USER_ROLES[game.settings.get(pf1ks.config.moduleId, pf1ks.config.hexEditorPermissionSetting)],
        },
        viewInOtherLayers: {
          name: "viewInOtherLayers",
          order: 3,
          title: "PF1KS.ShowInOtherLayers",
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
