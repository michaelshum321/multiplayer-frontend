import React from "react";
import "./App.css";
import Buttons from "./Buttons";
import World from "./game/World";

const RECT_SIZE = 20;
const RECT_OFFSET = RECT_SIZE / 2;

let sock;

function App() {
  const websocketRef = React.useRef(null);

  const [locations, setLocations] = React.useState([]);
  const [created, setCreated] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  const [myPlayerId, setMyPlayerId] = React.useState(null);
  const websocketMsg = (evt) => {
    // TODO: where should I put my command parsing?
    try {
      const msg = JSON.parse(evt.data);
      setMyPlayerId(msg["PlayerID"]);
      setLocations([{ x: msg["X"], y: msg["Y"] }]);
    } catch (e) {}
    console.log(evt.data);
  };
  const connectClick = () => {
    if (websocketRef.current) return;
    websocketRef.current = new WebSocket("ws://127.0.0.1:8080");
    const ws = websocketRef.current;
    ws.onmessage = websocketMsg;
    ws.onerror = (evt) => {
      setConnected(false);
      console.error("err", evt);
    };
    setConnected(true);
    console.log("ws made", websocketRef.current);
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

  // const canvasOnClick = (e) => {
  //   if (created) {
  //     return;
  //   }
  //   setCreated(true);
  //   const canvas = canvasRef.current;
  //   const location = {
  //     x: e.clientX,
  //     y: e.clientY,
  //   };
  //   draw(canvas, location);
  //   setLocations([location]);
  // };

  const leftClick = () => {
    if (!created) {
      return;
    }

    const location = locations[0];
    setLocations([
      {
        x: Math.max(0 + RECT_OFFSET, location.x - 10),
        y: location.y,
      },
    ]);
  };

  // React.useEffect(() => {
  //   const canvas = canvasRef.current;
  //   const ctx = canvas.getContext("2d");
  //   ctx.clearRect(0, 0, window.innerHeight, window.innerWidth);
  //
  //   locations.forEach((loc) => {
  //     draw(canvas, loc);
  //   });
  // });

  const gridProps = {
    x: 10,
    y: 10,
    width: window.innerWidth,
    height: window.innerHeight,
  };
  return (
    <div>
      <Buttons
        connected={connected}
        myPlayerId={myPlayerId}
        onLeftClick={leftClick}
        onConnectClick={connectClick}
      />
      <World grid={gridProps} locations={locations}></World>
    </div>
  );
}
// <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} onClick={canvasOnClick}></canvas>
export default App;
