import { HexStore } from "./hexStore.mjs";

export class HexRenderer {
  static draw(container, context) {
    const max = canvas.grid.getOffset({
      x: canvas.dimensions.sceneRect.width,
      y: canvas.dimensions.sceneRect.height,
    });

    for (let q = 0; q <= max.i; q++) {
      for (let r = 0; r <= max.j; r++) {
        const hex = HexStore.get(q, r);
        this.drawHex(container, hex, context);
      }
    }
  }

  static drawHex(container, hex, { opacity, color }) {
    const g = new PIXI.Graphics();

    const topLeft = canvas.grid.getCenterPoint({
      i: hex.q,
      j: hex.r,
    });

    const polygon = canvas.grid.getVertices(topLeft);

    const kingdom = game.actors.get(hex.kingdomId);

    if (hex.status === "claimed") {
      if (kingdom) {
        g.beginFill(kingdom.system.settings.color, opacity.claimed);
      } else {
        g.beginFill(color.unknown, opacity.claimed);
      }
    } else if (hex.status === "cleared") {
      g.beginFill(color.fow, opacity.cleared);
    } else if (hex.status === "explored") {
      g.beginFill(color.fow, opacity.explored);
    } else {
      g.beginFill(color.fow, opacity.unexplored);
    }

    g.moveTo(polygon[0].x, polygon[0].y);

    for (let i = 1; i < polygon.length; i++) {
      g.lineTo(polygon[i].x, polygon[i].y);
    }

    g.closePath();
    g.endFill();

    drawBorders(g, hex, polygon);

    container.addChild(g);
  }
}

function drawBorders(g, hex, polygon) {
  const neighbors = canvas.grid.getAdjacentOffsets({ i: hex.q, j: hex.r });

  const edgeToNeighbor = getEdgeToNeighborMap();
  const hexKingdomId = hex.status === "claimed" ? hex.kingdomId : null;

  for (let edge = 0; edge < 6; edge++) {
    const neighborCoords = neighbors[edgeToNeighbor[edge]];

    const neighbor = neighborCoords ? HexStore.get(neighborCoords.i, neighborCoords.j) : null;
    const neighborKingdomId = neighbor?.status === "claimed" ? neighbor?.kingdomId : null;

    if (hexKingdomId === neighborKingdomId) {
      continue;
    }

    const p1 = polygon[edge];
    const p2 = polygon[(edge + 1) % polygon.length];

    g.lineStyle(4, 0x000000, 1);
    g.moveTo(p1.x, p1.y);
    g.lineTo(p2.x, p2.y);
  }
}

function getEdgeToNeighborMap() {
  return canvas.grid.columns
    ? [0, 2, 4, 5, 3, 1] // hexColumns
    : [4, 5, 3, 1, 0, 2]; // hexRows
}
