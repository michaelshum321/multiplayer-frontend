import React from "react";
import logo from "./logo.svg";
import "./App.css";
import worker from "workerize-loader!./worker"; // eslint-disable-line import/no-webpack-loader-syntax

const w = worker();
const RECT_SIZE = 20;
const RECT_OFFSET = RECT_SIZE / 2;
const worky = () => w.doodoo();

let sock;

function App() {
  const canvasRef = React.useRef(null);

  const [locations, setLocations] = React.useState([]);
  const [created, setCreated] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  const connectClick = () => {
    if (sock) return;
    sock = new WebSocket("ws://127.0.0.1:8080");
    sock.onmessage = (evt) => console.log("evt", evt);
    sock.onerror = (evt) => console.error("err", evt);
    setConnected(true);
    console.log("ws made");
  };
  const draw = (canvas, loc) => {
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(
      loc.x - RECT_OFFSET,
      loc.y - RECT_OFFSET - rect.y,
      RECT_SIZE,
      RECT_SIZE
    );
    ctx.restore();
  };

  const canvasOnClick = (e) => {
    if (created) {
      return;
    }
    setCreated(true);
    const canvas = canvasRef.current;
    const location = { x: e.clientX, y: e.clientY };
    draw(canvas, location);
    setLocations([location]);
  };

  const leftClick = () => {
    if (!created) {
      return;
    }

    const location = locations[0];
    setLocations([
      { x: Math.max(0 + RECT_OFFSET, location.x - 10), y: location.y },
    ]);
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, window.innerHeight, window.innerWidth);

    locations.forEach((loc) => {
      draw(canvas, loc);
    });
  });
  return (
    <div>
      <div className={"buttons"}>
        <button onClick={leftClick}>left</button>
        <button onClick={worky}>right</button>
        <button>up</button>
        <button>down</button>
        <button onClick={connectClick}>Connect</button>
        {connected && "Connected!"}
      </div>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={canvasOnClick}
      ></canvas>
    </div>
  );
}

export default App;
