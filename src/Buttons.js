import React from "react";

export const Buttons = ({ connected, onLeftClick, onConnectClick }) => (
  <div className={"buttons"}>
    <button onClick={onLeftClick}>left</button>
    <button>right</button>
    <button>up</button>
    <button>down</button>
    <button onClick={connectClick}>Connect</button>
    {connected && "Connected!"}
  </div>
);
