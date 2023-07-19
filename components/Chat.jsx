import React from "react";
import ChatHeader from "./ChatHeader";
import Messages from "./Messages";
import { useChatContext } from "@/context/chatContext";
import ChatFooter from "./ChatFooter";
import { useAuth } from "@/context/authContext";

export default function Chat() {
  const { data, users } = useChatContext();

  const { currentUser } = useAuth();

  const isUserBlocked = users[currentUser.uid]?.blockedUsers?.find(
    (u) => u === data?.user.uid
  );

  const IamBlocked = users[data.user.uid]?.blockedUsers?.find(
    (u) => u === currentUser.uid
  );

  return (
    <div className="flex flex-col p-5 gap-1 grow relative">
      <ChatHeader />
      {data?.chatId && <Messages />}
      {!isUserBlocked && !IamBlocked && <ChatFooter />}

      {isUserBlocked && (
        <div className="w-full text-center text-c3 py-f font-bold">
          This User has been Blocked!
        </div>
      )}

      {IamBlocked && (
        <div className="w-full text-center text-red-500 py-f font-bold">
          {`${data.user.displayName} has blocked you 😭`}
        </div>
      )}
    </div>
  );
}
