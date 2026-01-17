"use client";

import Message from "./Message";
import { Message as MessageType } from "@/lib/types";

interface Props {
  messages: MessageType[];
}

export default function MessageList({ messages }: Props) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <Message
          key={message.id}
          message={message}
          isLatest={index === messages.length - 1}
        />
      ))}
    </div>
  );
}
