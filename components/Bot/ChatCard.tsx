"use client";

import React, { useState } from "react";

type Props = {};

const ChatCard = (props: Props) => {
  const [showChat, setShowChat] = useState<boolean>(false);

  const toggleShowChat = () => {
    setShowChat(!showChat);
  };

  return <div>ChatCard</div>;
};

export default ChatCard;
