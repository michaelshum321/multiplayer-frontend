import React from "react";

const LINE_WIDTH = 2;
const CELL_SIZE = 40;

const minBoundary = (input) => input * CELL_SIZE + LINE_WIDTH;
// boundaries are inclusive
export const getCellBoundaries = (x, y) => {
  // 0: 2-39 1: 42-79
  return {
    x: minBoundary(x),
    y: minBoundary(y),
  };
};
const Grid = ({ x, y, width, height }) => {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    for (let i = 0; i < x + 1; i++) {
      ctx.beginPath();
      ctx.lineWidth = LINE_WIDTH;
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CELL_SIZE * y);
      ctx.stroke();
    }

    for (let i = 0; i < y + 1; i++) {
      ctx.beginPath();
      ctx.lineWidth = LINE_WIDTH;
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CELL_SIZE * x, i * CELL_SIZE);
      ctx.stroke();
    }
  }, []);
  return <canvas id={"grid"} ref={canvasRef} width={width} height={height} />;
};

export default Grid;
