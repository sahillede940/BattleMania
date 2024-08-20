import handleRooms from "./handlers/roomHandlers.js";
import handleChallenges from "./handlers/challengehandler.js";
import handleMessages from "./handlers/messageHandlers.js";

const onConnection = (socket) => {
  handleRooms(socket);
  handleChallenges(socket);
  handleMessages(socket);
};

export default onConnection;
