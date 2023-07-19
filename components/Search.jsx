import { db } from "@/firebase/firebase";
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useState } from "react";
import { RiSearch2Line } from "react-icons/ri";
import Avatar from "./Avatar";
import { useAuth } from "@/context/authContext";
import { useChatContext } from "@/context/chatContext";

export default function Search() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);
  const { currentUser } = useAuth();
  const { dispatch } = useChatContext();

  const onkeyup = async (e) => {
    if (e.code === "Enter" && !!username) {
      try {
        setErr(false);
        const userRef = collection(db, "users");
        const q = query(userRef, where("displayName", "==", username));
        const queryShapshot = await getDocs(q);
        if (queryShapshot.empty) {
          setErr(true);
          setUser(null);
        } else {
          queryShapshot.forEach((doc) => {
            setUser(doc.data());
          });
        }
      } catch (error) {
        console.log(error);
        setErr(error);
      }
    }
  };

  const handleSelect = async () => {
    try {
      const combinedId =
        currentUser.uid > user.uid
          ? currentUser.uid + user.uid
          : user.uid + currentUser.uid;

      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        const currentUserChatRef = await getDoc(
          doc(db, "userChats", currentUser.uid)
        );

        const userChatRef = await getDoc(doc(db, "userChats", user.uid));

        if (!currentUserChatRef.exists()) {
          await setDoc(doc(db, "userChats", currentUser.uid), {});
        }
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL || null,
            color: user.color,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        if (!userChatRef.exists()) {
          await setDoc(doc(db, "userChats", user.uid), {});
        }
        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL || null,
            color: currentUser.color,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".chatDeleted"]: deleteField(),
        });
      }

      setUser(null);
      setUsername("");
      dispatch({ type: "CHANGE_USER", payload: user });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="shrink-0 w-full ">
      <div className="relative ">
        <RiSearch2Line className="absolute top-4 left-3 text-c3 cursor-pointer" />
        <input
          type="search"
          placeholder="Search User..."
          className="w-full border-none outline-none bg-c1 placeholder:text-c3
           h-12 pl-9 pr-3 rounded-md text-base "
          onChange={(e) => setUsername(e.target.value)}
          onKeyUp={onkeyup}
          value={username}
          autoFocus
        />
        <span className="absolute top-[14px] right-4 text-sm text-c3 cursor-pointer"></span>
      </div>
      {err && (
        <>
          <div className="mt-4 w-full text-center">
            <h3>User not found!😰</h3>
          </div>
          <div className="w-full h-[.1rem] bg-white/[0.3] mt-5"></div>
        </>
      )}
      {user && (
        <>
          <div
            className="flex items-center gap-4 rounded-xl hover:bg-c5 py-2 px-4 
            cursor-pointer mt-4 "
            onClick={() => handleSelect(user)}
          >
            <Avatar size="large" user={user} />
            <div className="flex flex-col gap-1 grow">
              <span className="text-base text-white flex items-center justify-between">
                <div className="font-medium">{user.displayName}</div>
              </span>
              <p className="text-sm text-c3">{user.email}</p>
            </div>
          </div>
          <div className="w-full h-[.1rem] bg-white/[0.3] mt-5"></div>
        </>
      )}
    </div>
  );
}
