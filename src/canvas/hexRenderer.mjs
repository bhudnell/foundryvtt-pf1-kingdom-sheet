import { HexStore } from "./hexStore.mjs";

export class HexRenderer {
  static draw(container) {
    const hexes = HexStore.getAll();

    for (const [key, hex] of Object.entries(hexes)) {
      this.drawHex(container, hex);
    }
  }

  static drawHex(container, hex) {
    const g = new PIXI.Graphics();

    const topLeft = canvas.grid.getCenterPoint({
      i: hex.q,
      j: hex.r,
    });

    const polygon = canvas.grid.getVertices(topLeft);

    const kingdom = game.actors.get(hex.kingdomId);

    if (kingdom) {
      const fillColor = kingdom.system.settings.color ?? 0x00ff00;
      g.beginFill(fillColor, 0.25);
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

  for (let edge = 0; edge < 6; edge++) {
    const neighborCoords = neighbors[edgeToNeighbor[edge]];

    const neighbor = neighborCoords ? HexStore.get(neighborCoords.i, neighborCoords.j) : null;

    const differentOwner = neighbor?.kingdomId !== hex.kingdomId;
    if (!differentOwner) {
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
