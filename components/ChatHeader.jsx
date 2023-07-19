import React, { useState } from "react";
import { useChatContext } from "@/context/chatContext";
import Avatar from "./Avatar";
import Icons from "./Icons";
import { IoEllipsisVerticalSharp } from "react-icons/io5";
import ChatMenu from "./ChatMenu";

export default function ChatHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const { users, data } = useChatContext();

  // Chack Online Status
  const online = users[data.user.uid]?.isOnline;
  //   userInfo
  const user = users[data.user.uid];

  // Redurn Statemant
  return (
    <div
      className="flex items-center justify-between border-b pb-5
     border-white/[.4]"
    >
      {user && (
        <div className="flex items-center gap-3">
          <Avatar size="large" user={user} />
          <div className="">
            <div className="font-medium">{user.displayName}</div>
            <p className="text-c3 text-sm">{online ? "online" : "offline"}</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Icons
          size="large"
          className={`${showMenu ? "bg-c1" : ""}`}
          onClick={() => setShowMenu(true)}
          icon={<IoEllipsisVerticalSharp size={20} className="text-c3" />}
        />
        {showMenu && <ChatMenu setShowMenu={setShowMenu} showMenu={showMenu} />}
      </div>
    </div>
  );
}
