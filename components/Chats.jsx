import React, { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/context/chatContext";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { RiSearch2Line } from "react-icons/ri";
import Avatar from "./Avatar";
import { useAuth } from "@/context/authContext";
import { formateDate } from "@/utils/helpers";

export default function Chats() {
  const {
    users,
    setUsers,
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    dispatch,
    data,
    resetFooterState,
  } = useChatContext();
  const [search, setSearch] = useState("");
  const [unreadMsgs, setUnreadMsgs] = useState({});
  const { currentUser } = useAuth();
  const isBlockExecutedRef = useRef(false);
  const isUsersFetchedRef = useRef(false);

  useEffect(() => {
    resetFooterState();
  }, [data?.chatId]);

  useEffect(() => {
    onSnapshot(collection(db, "users"), (snapshot) => {
      const updatedUsers = {};
      snapshot.forEach((doc) => {
        updatedUsers[doc.id] = doc.data();
      });
      setUsers(updatedUsers);

      if (!isBlockExecutedRef.current) {
        isUsersFetchedRef.current = true;
      }
    });
  }, []);

  // Handle Unread Messages

  useEffect(() => {
    const documentIds = Object.keys(chats);
    if (documentIds.length === 0) return; // Check the length of the array

    const q = query(
      collection(db, "chats"),
      where("__name__", "in", documentIds)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      let msgs = {};
      snapshot.forEach((doc) => {
        if (doc.id !== data.chatId) {
          msgs[doc.id] = doc
            .data()
            ?.messages?.filter(
              (m) => m?.read === false && m?.sender !== currentUser.uid
            );
        }
        Object.keys(msgs || {}).map((c) => {
          if (msgs[c]?.length < 1) {
            delete msgs[c];
          }
        });
      });
      setUnreadMsgs(msgs);
    });
    return () => unsub();
  }, [chats, selectedChat]);

  // Chat User
  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setChats(data);

          if (
            !isBlockExecutedRef.current &&
            isUsersFetchedRef.current &&
            users
          ) {
            const firstChat = Object.values(data)
              .filter((chat) => !chat.hasOwnProperty("chatDeleted"))
              .sort((a, b) => b.date - a.date)[0];

            if (firstChat) {
              const user = users[firstChat?.userInfo?.uid];

              handleSelect(user);

              const chatId =
                currentUser?.uid > user?.uid
                  ? currentUser?.uid + user?.uid
                  : user?.uid + currentUser?.uid;
              readChat(chatId);
            }
            isBlockExecutedRef.current = true;
          }
        }
      });
    };
    currentUser.uid && getChats();
  }, [isBlockExecutedRef.current, users]);

  // Convert Chat into Array
  const filteredChats = Object.entries(chats || {})
    .filter(([, chat]) => !chat.hasOwnProperty("chatDeleted"))
    .filter(
      ([, chat]) =>
        chat?.userInfo?.displayName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        chat?.lastMessage?.text.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b[1].data - a[1].data);
  console.log(filteredChats);

  // Read Chat
  const readChat = async (chatId) => {
    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);

    let updatedMessages = chatDoc?.data()?.messages.map((m) => {
      if (m?.read === false) {
        m.read = true;
      }
      return m;
    });
    await updateDoc(chatRef, {
      messages: updatedMessages,
    });
  };

  // HandleChats

  const handleSelect = (user, selectedChatId) => {
    setSelectedChat(user);
    dispatch({ type: "CHANGE_USER", payload: user });

    if (unreadMsgs?.[selectedChatId]?.length > 0) {
      readChat(selectedChatId);
    }
  };

  //   Return Statment

  return (
    <div className="flex flex-col h-full">
      <div
        className="shrink-0 sticky -top-[20px] z-10 justify-center w-full
       py-5 bg-c2"
      >
        <RiSearch2Line className="absolute top-9 left-3 text-c3 cursor-pointer" />
        <input
          type="search"
          placeholder="Search User..."
          className="w-full border-none outline-none bg-c1/[.5] placeholder:text-c3
           h-12 pl-9 pr-3 rounded-md text-base "
          onChange={(e) => setSearch(e.target.value)}
          // onKeyUp={onkeyup}
          value={search}
          // autoFocus
        />
      </div>
      {/* Users */}

      <ul className="flex flex-col gap-2 w-full my-5">
        {Object.keys(users || {}).length > 0 &&
          filteredChats?.map((chat) => {
            const timestamp = new Timestamp(
              chat[1]?.date?.seconds,
              chat[1]?.date?.nanoseconds
            );
            const date = timestamp.toDate();
            // get User Info
            const user = users[chat[1]?.userInfo?.uid];

            return (
              <li
                key={chat[0]}
                onClick={() => handleSelect(user, chat[0])}
                className={`h-[90px] flex items-center gap-4 rounded-xl hover:bg-c1
            p-4 cursor-pointer ${
              selectedChat?.uid === user?.uid ? "bg-c1/[.5]" : ""
            }`}
              >
                <Avatar size="x-large" user={user} />
                <div className="flex flex-col gap-1 grow relative">
                  <span
                    className="text-base text-white flex items-center 
              justify-between"
                  >
                    <div className="font-medium">{user?.displayName}</div>
                    <div className="text-c3 text-xs">{formateDate(date)}</div>
                  </span>
                  <p className="text-c3 text-sm line-clamp-1 break-all">
                    {chat[1]?.lastMessage?.text ||
                      (chat[1]?.lastMessage?.img && "image") ||
                      "Send first message"}
                  </p>
                  {!!unreadMsgs?.[chat[0]]?.length && (
                    <span
                      className="absolute right-0  top-8 min-w-[19px] h-5 rounded-full
               bg-red-700 text-white flex items-center justify-center font-sm "
                    >
                      {unreadMsgs?.[chat[0]]?.length}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
