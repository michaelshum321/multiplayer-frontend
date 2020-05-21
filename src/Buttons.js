import React from "react";
import Directions from "./game/Directions";

const Buttons = ({ connected, myPlayerId, onDirClick, onConnectClick }) => (
  <div className={"buttons"}>
    <button onClick={() => onDirClick(Directions.LEFT)}>left</button>
    <button onClick={() => onDirClick(Directions.RIGHT)}>right</button>
    <button onClick={() => onDirClick(Directions.UP)}>up</button>
    <button onClick={() => onDirClick(Directions.DOWN)}>down</button>
    <button onClick={onConnectClick}>Connect</button>
    {connected && "Connected!"}
    {myPlayerId !== null && `PlayerID: ${myPlayerId}`}
  </div>
);

export default Buttons;
