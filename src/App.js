import React from "react";
import "./App.css";
import Buttons from "./Buttons";
import World from "./game/World";
import Directions from "./game/Directions";

const RECT_SIZE = 20;
const RECT_OFFSET = RECT_SIZE / 2;
const GRID_SIZE = 10;

function App() {
  const websocketRef = React.useRef(null);

  const [locations, setLocations] = React.useState({});
  const [created, setCreated] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  const [myPlayerId, setMyPlayerId] = React.useState(null);
  const locationsRef = React.useRef({}); // used for closure in websocketMsg

  React.useEffect(() => {
    console.log("loc", locations);
    locationsRef.current = locations;
    const keys = Object.keys(locations);
    if (keys.length == 1) {
      setMyPlayerId(keys[0]);
    }
  }, [locations]);

  const websocketMsg = (evt) => {
    // TODO: where should I put my command parsing?
    console.log("evt", evt);
    const msg = JSON.parse(evt.data);
    setLocations((prev) => {
      const newLocations = Object.assign({}, prev);
      newLocations[msg.PlayerID] = { x: msg.X, y: msg.Y };
      return newLocations;
    });
  };
  const connectClick = () => {
    if (websocketRef.current) return;
    websocketRef.current = new WebSocket("ws://localhost:8080");
    const ws = websocketRef.current;
    ws.onmessage = websocketMsg;
    ws.onerror = (evt) => {
      setConnected(false);
      console.error("err", evt);
    };
    setConnected(true);
    console.log("ws made", websocketRef.current);
  };

  const dirClick = (dir) => {
    if (!websocketRef.current || !connected) return;
    // send cmd to backend
    websocketRef.current.send(JSON.stringify({ Direction: dir }));
    const pastLocation = locations[myPlayerId];
    let newX, newY;
    switch (dir) {
      case Directions.LEFT:
        newX = Math.max(0, pastLocation.x - 1);
        newY = pastLocation.y;
        break;
      case Directions.RIGHT:
        newX = Math.min(GRID_SIZE - 1, pastLocation.x + 1);
        newY = pastLocation.y;
        break;
      case Directions.UP:
        newX = pastLocation.x;
        newY = Math.max(0, pastLocation.y - 1);
        break;
      case Directions.DOWN:
        newX = pastLocation.x;
        newY = Math.min(GRID_SIZE - 1, pastLocation.y + 1);
    }

    // change location of our elem
    const newLocations = Object.assign({}, locations);
    newLocations[myPlayerId] = { x: newX, y: newY };
    setLocations(newLocations);
  };

  const gridProps = {
    x: GRID_SIZE,
    y: GRID_SIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  };
  return (
    <div>
      <Buttons
        connected={connected}
        myPlayerId={myPlayerId}
        onDirClick={(dir) => dirClick(dir)}
        onConnectClick={connectClick}
      />
      <World grid={gridProps} locations={locations}></World>
    </div>
  );
}

export default App;
