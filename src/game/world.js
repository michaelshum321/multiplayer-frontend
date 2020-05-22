import React from "react";
import Grid, { getCellBoundaries } from "./Grid";
const RECT_SIZE = 40;
const RECT_OFFSET = RECT_SIZE / 2;

const World = ({ grid, locations }) => {
  const worldRef = React.createRef(null);

  React.useEffect(() => {
    const canvas = worldRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, grid.width, grid.height);
    if (!locations) return;
    for (const key in locations) {
      console.log("drawing", locations[key]);
      ctx.fillStyle = "#FF0000";
      const { x, y } = getCellBoundaries(locations[key].x, locations[key].y);
      ctx.fillRect(x, y, RECT_SIZE, RECT_SIZE);
      ctx.restore();
    }
  }, [locations]);
  return (
    <div>
      <canvas
        ref={worldRef}
        id={"world"}
        width={grid.width}
        height={grid.height}
      />
      <Grid x={grid.x} y={grid.y} width={grid.width} height={grid.height} />
    </div>
  );
};

export default World;
