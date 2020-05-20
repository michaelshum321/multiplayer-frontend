import React from "react";

export const Grid = ({ x, y, width, height }) => {
  const canvasRef = React.useRef(null);
  React.onEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  }, []);
  return <canvas id={"grid"} ref={canvasRef} width={width} height={height} />;
};
