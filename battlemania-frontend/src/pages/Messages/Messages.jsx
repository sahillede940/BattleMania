import React from "react";
import { RoomContext } from "../../Contexts";
import "./Messages.scss";

const Messages = () => {
  const { messages, sendMessage, message, setMessage, roomId } =
    React.useContext(RoomContext);
  return (
    <div className="message-container">
      <div className="message-input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="message-input"
          placeholder="Type your message..."
        />
        <button
          className="btn send-message-button"
          onClick={() => sendMessage(roomId)}
        >
          Send Message
        </button>
      </div>

      <div className="messages-display-container">
        {messages.map((msg, index) => (
          <p key={index} className="message-item">
            <span className="message-username">{msg.username}</span>:{" "}
            {msg.message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Messages;
