import React from "react";
import "./App.css";
import Buttons from "./Buttons";
import World from "./game/World";
import Directions from "./game/Directions";
import { useKeyPress, useInterval } from './util/Hooks';
import * as ramda from 'ramda';

const RECT_SIZE = 20;
const RECT_OFFSET = RECT_SIZE / 2;
const GRID_SIZE = 10;
const KEY_CODES = Object.freeze({LEFT: 37, UP: 38, RIGHT: 49, DOWN: 40});
const FPS = 1000/30;

// TODO refactor players moving logic

function App() {
  const websocketRef = React.useRef(null);

  const [locations, setLocations] = React.useState({});
  const [created, setCreated] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  const [myPlayerId, setMyPlayerId] = React.useState(null);

  const receiveQueueRef = React.useRef([]);
  const sendQueueRef = React.useRef([]);

  const [lastFrameTs, setLastFrameTs] = React.useState(null);

  const lockRef = React.useRef(false);
  const leftArrowKeyPressed = useKeyPress(KEY_CODES.LEFT);
  const gridRef = React.useRef([]);
  const myPlayerIdRef = React.useRef();
  const dirRef = React.useRef();

  React.useEffect(() => {
    const newGrid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      newGrid.push(new Array(GRID_SIZE));
    }
    gridRef.current = newGrid;
  }, []);

  React.useEffect(() => {
    const keys = Object.keys(locations);
    if (keys.length === 1) setMyPlayerId(keys[0]);
  }, [locations]);

  React.useEffect(() => {
    myPlayerIdRef.current = myPlayerId;
  }, [myPlayerId]);

  const websocketMsg = (evt) => {
    // TODO: where should I put my command parsing?
    const msg = JSON.parse(evt.data);
    const playerId = msg.PlayerID;
    const newLocation = { x: msg.X, y: msg.Y };

    const receivePayload = {playerId, location: newLocation};
    console.log('recd', receivePayload, receiveQueueRef.current.length + 1);
    receiveQueueRef.current.push(receivePayload);
    console.log('newrecvqueue', receiveQueueRef);
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
    sendQueueRef.current.push(dir);
    console.log('added to sq', sendQueueRef.current);
  };

  // React.useEffect(() => {
  //   setSendQueue([...sendQueue, Directions.LEFT]);
  // }, [leftArrowKeyPressed]);

  const gridProps = {
    x: GRID_SIZE,
    y: GRID_SIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // should we goto the next frame? if we pass 1 frame in 60 fps, yes
  const shouldNextFrame = () => {
    if (lastFrameTs === null) {
      return false;
    }

    return (new Date()).getTime() - lastFrameTs > FPS
  }

  React.useEffect(() => {
    console.log('LOCATIONS',locations);
  }, [locations])

 useInterval(() => {
    // TODO - do better 'currency' control for setTimeouts calls overlapping
    if (lockRef.current) {
      console.log('locked!');
      return;
    }
    lockRef.current = true;
    // my player moves around and sends to websocket
    console.log('currSendQuee', sendQueueRef.current);
    // while(sendQueueRef.current.length) {
       dirRef.current = sendQueueRef.current.shift();
      console.log('boopy', dirRef.current);
      // TODO set this to use last location ;_;
    let newLocations = null;
      if (dirRef.current == null)newLocations = locations;
      const pastLocation = locations[myPlayerIdRef.current];
      let newX, newY;
      switch (dirRef.current) {
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
          break;
        default:
          if (dirRef.current != null) {
            throw new Error(`wtf direction is this!!! ${dirRef.current}`,);
          }
          break;
      }

      // do not continue if myplayer did not move
      if (dirRef.current != null&& newX === pastLocation.x && newY === pastLocation.y) newLocations = locations;
      // do not continue if collision detected
      if (dirRef.current != null&& gridRef.current[newY][newX] !== undefined) newLocations = locations;

      // send cmd to backend
      if (dirRef.current != null) {
        // change location of our elem
        newLocations = ramda.clone(locations);
        const newLocation = { x: newX, y: newY };
        newLocations[myPlayerIdRef.current] = newLocation;
        gridRef.current[pastLocation.y][pastLocation.x] = undefined;
        gridRef.current[newLocation.y][newLocation.x] = myPlayerIdRef.current;
        console.log('new recd locations', newLocations);

        websocketRef.current.send(JSON.stringify({ Direction: dirRef.current }));
      }else{
        newLocations = locations;
      }

      setLocations(newLocations);

    //   setLocations(currLocations => {
    //     if (dirRef.current == null) return currLocations;
    //     const pastLocation = currLocations[myPlayerIdRef.current];
    //     let newX, newY;
    //     switch (dirRef.current) {
    //       case Directions.LEFT:
    //         newX = Math.max(0, pastLocation.x - 1);
    //         newY = pastLocation.y;
    //         break;
    //       case Directions.RIGHT:
    //         newX = Math.min(GRID_SIZE - 1, pastLocation.x + 1);
    //         newY = pastLocation.y;
    //         break;
    //       case Directions.UP:
    //         newX = pastLocation.x;
    //         newY = Math.max(0, pastLocation.y - 1);
    //         break;
    //       case Directions.DOWN:
    //         newX = pastLocation.x;
    //         newY = Math.min(GRID_SIZE - 1, pastLocation.y + 1);
    //         break;
    //       default:
    //         throw new Error(`wtf direction is this!!! ${dirRef.current}`,);
    //     }

    //     // do not continue if myplayer did not move
    //     if (newX === pastLocation.x && newY === pastLocation.y) return currLocations;
    //     // do not continue if collision detected
    //     if (gridRef.current[newY][newX] !== undefined) return currLocations;

    //     // send cmd to backend
    //     websocketRef.current.send(JSON.stringify({ Direction: dirRef.current }));

    //     // change location of our elem
    //     const newLocations = ramda.clone(currLocations);
    //     const newLocation = { x: newX, y: newY };
    //     newLocations[myPlayerIdRef.current] = newLocation;
        
    //     gridRef.current[pastLocation.y][pastLocation.x] = undefined;
    //     gridRef.current[newLocation.y][newLocation.x] = myPlayerIdRef.current;
    //     console.log('new recd locations', newLocations);
    //     return newLocations;
    //   })
    // // }


    console.log('rql', receiveQueueRef.current.length);
    // receive moves from server and move other players
    while(!shouldNextFrame() && receiveQueueRef.current.length) {
      const {playerId, location} = receiveQueueRef.current.shift();
      console.log('bopity', playerId, location);
      // if collision detected, do not continue
      
      if (gridRef.current[location.y][location.x] !== undefined) continue;

      setLocations((prev) => {
        const locations = Object.assign({}, prev);
        const prevLocation = prev[playerId];

        console.log('pid', playerId);
        if (prevLocation) {
          // only reset prev location if it is already existing
          gridRef.current[prevLocation.y][prevLocation.x] = undefined;
        }
        // set grid at location
        gridRef.current[location.y][location.x] = playerId;
        console.log('prevgrid', gridRef.current);

        locations[playerId] = location;
        console.log('locs', locations);
        
        return ramda.clone(locations);
      });

    }

    // TODO race condition between frame being too late and next timeout being called?
    lockRef.current = false;
    setLastFrameTs((new Date()).getTime());
  }, FPS);
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
