import React from "react";
import "./App.css";
import Buttons from "./Buttons";
import World from "./game/World";
import Directions from "./game/Directions";
import { usePrevious } from "./util/Hooks";
const RECT_SIZE = 20;
const RECT_OFFSET = RECT_SIZE / 2;
const GRID_SIZE = 10;

function App() {
  const websocketRef = React.useRef(null);

  const [locations, setLocations] = React.useState({});
  const [created, setCreated] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  const [myPlayerId, setMyPlayerId] = React.useState(null);
  const [grid, setGrid] = React.useState([]);

  React.useEffect(() => console.log("grid", grid), [grid]);
  React.useEffect(() => {
    const newGrid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      newGrid.push(new Array(GRID_SIZE));
    }
    setGrid(newGrid);
  }, []);

  React.useEffect(() => {
    const keys = Object.keys(locations);
    if (keys.length === 1) setMyPlayerId(keys[0]);
  }, [locations]);

  const websocketMsg = (evt) => {
    // TODO: where should I put my command parsing?
    const msg = JSON.parse(evt.data);
    const playerId = msg.PlayerID;
    const newLocation = { x: msg.X, y: msg.Y };

    // if collision detected, do not continue
    if (grid[newLocation.y][newLocation.x] !== undefined) return;

    setLocations((prev) => {
      const newLocations = Object.assign({}, prev);
      const prevLocation = prev[playerId];
      setGrid((prevGrid) => {
        if (prevLocation) {
          // only reset prev location if it is already existing
          prevGrid[prevLocation.y][prevLocation.x] = undefined;
        }
        // set grid at newLocation
        prevGrid[newLocation.y][newLocation.x] = playerId;
        return prevGrid;
      });
      newLocations[playerId] = newLocation;
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
  };

  const dirClick = (dir) => {
    if (!websocketRef.current || !connected) return;
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
    // do not continue if entity did not move
    if (newX === pastLocation.x && newY === pastLocation.y) return;
    // do not continue if collision detected
    if (grid[newY][newX] !== undefined) return;

    // send cmd to backend
    websocketRef.current.send(JSON.stringify({ Direction: dir }));

    // change location of our elem
    const newLocations = Object.assign({}, locations);
    const newLocation = { x: newX, y: newY };
    newLocations[myPlayerId] = newLocation;
    setLocations(() => {
      setGrid((prevGrid) => {
        prevGrid[pastLocation.y][pastLocation.x] = undefined;
        prevGrid[newLocation.y][newLocation.x] = myPlayerId;
        return prevGrid;
      });
      return newLocations;
    });
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
