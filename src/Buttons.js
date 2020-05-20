import React from "react";

const Buttons = ({ connected, myPlayerId, onLeftClick, onConnectClick }) => (
  <div className={"buttons"}>
    <button onClick={onLeftClick}>left</button>
    <button>right</button>
    <button>up</button>
    <button>down</button>
    <button onClick={onConnectClick}>Connect</button>
    {connected && "Connected!"}
    {myPlayerId !== null && `PlayerID: ${myPlayerId}`}
  </div>
);

export default Buttons;
