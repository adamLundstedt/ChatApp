import "./message.css";
import { format } from "timeago.js";

export default function Message({ message, own, adminMsg, senderName }) {

  return (
    <div className={adminMsg ? 'message admin' : own ? "message own" : "message"}>
      <div className="messageTop">
        <p className="messageText">
          {adminMsg ? 'Message By Admin: ' : ''}{senderName ? `Message By ${senderName}: ` : ''}{message.text}
        </p>
      </div>
      <div className="messageBottom">{format(message.createdAt)}</div>
    </div>
  );
}
