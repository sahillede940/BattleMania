import React, { useEffect, useContext } from "react";
import { getSocket } from "../../services/socket";
import { RoomContext } from "./Room";

const Canvas = () => {

    const socket = getSocket();
    const { roomId } = useContext(RoomContext);

  return <div>Canvas</div>;
};

export default Canvas;
