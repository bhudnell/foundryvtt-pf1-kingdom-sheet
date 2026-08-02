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
    this._hoveredHexKey = null;
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
      kingdom: game.actors.get(hex.kingdomId)?.name,
      improvements: (hex.improvements ?? []).map((i) => pf1ks.config.terrainImprovements[i].name).join(", "),
      specialTerrain: (hex.specialTerrain ?? []).map((i) => pf1ks.config.specialTerrain[i].name).join(", "),
    };

    game.tooltip.activate(tooltip, {
      html: renderCachedTemplate(`modules/${pf1ks.config.moduleId}/templates/canvas/hex-tooltip.hbs`, context),
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

    if (hex) {
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
