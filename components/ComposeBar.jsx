import { useAuth } from "@/context/authContext";
import { useChatContext } from "@/context/chatContext";
import { db, storage } from "@/firebase/firebase";
import {
  Timestamp,
  arrayUnion,
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import React, { useEffect } from "react";
import { TbSend } from "react-icons/tb";
import { v4 as uuid } from "uuid";

let typingTimeout = null;

export default function ComposeBar() {
  const {
    inputText,
    setInputText,
    data,
    attachment,
    setAttachment,
    setAttachmentPreview,
    editMessage,
    setEditMessage,
  } = useChatContext();
  const { currentUser } = useAuth();

  useEffect(() => {
    setInputText(editMessage?.text || "");
  }, [editMessage]);

  const handleTyping = async (e) => {
    setInputText(e.target.value);

    await updateDoc(doc(db, "chats", data.chatId), {
      [`typing.${currentUser.uid}`]: true,
    });

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    typingTimeout = setTimeout(async () => {
      await updateDoc(doc(db, "chats", data.chatId), {
        [`typing.${currentUser.uid}`]: false,
      });

      typingTimeout = null;
    }, 500);
  };

  const onKeyUp = (e) => {
    if (e.key === "Enter" && (inputText || attachment)) {
      editMessage ? handleEdit() : handleSend();
    }
  };

  const handleSend = async () => {
    if (attachment) {
      // Upload File Logic
      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, attachment);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          console.log(error);
        },
        // Handle successful uploads on complete
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text: inputText,
                sender: currentUser.uid,
                date: Timestamp.now(),
                read: false,
                img: downloadURL,
              }),
            });
          });
        }
      );
    } else {
      // Update messages
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text: inputText,
          sender: currentUser.uid,
          date: Timestamp.now(),
          read: false,
        }),
      });
    }

    let msg = { text: inputText };
    if (attachment) {
      msg.img = true;
    }

    //  Your Last Message
    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: msg,
      [data.chatId + ".date"]: serverTimestamp(),
    });

    // Reciver Last Message
    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: msg,
      [data.chatId + ".date"]: serverTimestamp(),
      [data.chatId + ".chatDeleted"]: deleteField(),
    });
    setInputText("");
    setAttachment(null);
    setAttachmentPreview(null);
  };

  // Handle Edit Message--------------------==================>

  const handleEdit = async () => {
    const messageId = editMessage.id;
    const chatRef = doc(db, "chats", data.chatId);

    const chatDoc = await getDoc(chatRef);

    if (attachment) {
      // Upload File Logic
      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, attachment);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          console.log(error);
        },
        // Handle successful uploads on complete
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            let updatedMessages = chatDoc.data().messages.map((message) => {
              if (message.id === messageId) {
                message.text = inputText;
                message.img = downloadURL;
              }
              return message;
            });
            await updateDoc(chatRef, { messages: updatedMessages });
          });
        }
      );
    } else {
      // Update messages
      let updatedMessages = chatDoc.data().messages.map((message) => {
        if (message.id === messageId) {
          message.text = inputText;
        }
        return message;
      });
      await updateDoc(chatRef, { messages: updatedMessages });
    }

    setInputText("");
    setAttachment(null);
    setAttachmentPreview(null);
    setEditMessage(null);
  };

  return (
    <div className="flex items-center gap-2 grow">
      <input
        type="text"
        placeholder="Type a message..."
        className="grow w-full h-full bg-transparent text-white px-2 py-2 outline-none 
        placeholder:text-c3 text-base border-none "
        value={inputText}
        onChange={handleTyping}
        onKeyUp={onKeyUp}
      />
      <button
        className={`w-[3rem] shrink-0 h-full rounded-md cursor-pointer
        flex items-center justify-center active:scale-95
        transition p-2  ${inputText.trim().length > 0 ? "bg-c4" : "bg-c1"}`}
        onClick={editMessage ? handleEdit : handleSend}
      >
        <TbSend size={20} className="text-white" />
      </button>
    </div>
  );
}
