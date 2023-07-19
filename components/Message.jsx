import { useAuth } from "@/context/authContext";
import React, { useState } from "react";
import Avatar from "./Avatar";
import { useChatContext } from "@/context/chatContext";
import Image from "next/image";
import ImageViewer from "react-simple-image-viewer";
import { Timestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { formateDate, wrapEmojisInHtmlTag } from "@/utils/helpers";
import Icons from "./Icons";
import { GoChevronDown } from "react-icons/go";
import MessageMenu from "./MessageMenu";
import DeleteMsgPopup from "./popup/DeleteMsgPopup";
import { db } from "@/firebase/firebase";
import { DELETED_FOR_ME, DELETED_FOR_EVERYONE } from "@/utils/constants";

export default function Message({ message }) {
  const { currentUser } = useAuth();
  const { users, data, imageViewer, setImageViewer, setEditMessage } =
    useChatContext();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  //   Date
  const timestamp = new Timestamp(
    message?.date?.seconds,
    message?.date?.nanoseconds
  );
  const date = timestamp.toDate();

  const self = message.sender === currentUser.uid;

  // Delete Popup Handle
  const deletePopupHandle = () => {
    setShowMenu(false);
    setShowDeletePopup(true);
  };

  // Clear Message Handle
  const deleteMessage = async (action) => {
    try {
      const messageId = message.id;
      const chatRef = doc(db, "chats", data.chatId);
      const chatDoc = await getDoc(chatRef);
      const updatedMessages = chatDoc.data().messages.map((message) => {
        if (message.id === messageId) {
          if (action === DELETED_FOR_ME) {
            message.deletedInfo = {
              [currentUser.uid]: DELETED_FOR_ME,
            };
          }

          // Deleted for everyOne
          if (action === DELETED_FOR_EVERYONE) {
            message.deletedInfo = {
              deletedForEveryone: true,
            };
          }
        }
        return message;
      });

      await updateDoc(chatRef, { messages: updatedMessages });
      setShowDeletePopup(false);
    } catch (error) {
      console.log(error);
    }
  };

  //   Return Statement
  return (
    <div className={`mb-5 max-w-[75%] ${self ? "self-end" : ""} `}>
      {showDeletePopup && (
        <DeleteMsgPopup
          onHide={() => setShowDeletePopup(false)}
          self={self}
          noHeader={true}
          shortHeight={true}
          className="DeleteMsgPopup"
          deleteMessage={deleteMessage}
        />
      )}
      <div
        className={`flex items-end mb-1 gap-3 ${
          self ? "justify-start flex-row-reverse" : ""
        }`}
      >
        <Avatar
          size="small"
          user={self ? currentUser : users[data.user.uid]}
          className="mb-4"
        />
        <div
          className={`group flex flex-col gap-4 p-4 rounded-2xl relative break-all
          ${self ? "rounded-br-md bg-c5" : "rounded-bl-md bg-c1"}`}
        >
          {message?.text && (
            <div
              className="text-sm"
              dangerouslySetInnerHTML={{
                __html: wrapEmojisInHtmlTag(message?.text),
              }}
            ></div>
          )}
          {message?.img && (
            <>
              <Image
                src={message?.img}
                width={220}
                height={230}
                alt={message?.text || ""}
                className="max-w-[220px] max-h-[220px] rounded-md hover:scale-110 transition"
                onClick={() => {
                  setImageViewer({
                    msgId: message.id,
                    url: message.img,
                  });
                }}
              />

              {imageViewer && imageViewer.msgId === message.id && (
                <ImageViewer
                  src={[imageViewer.url]}
                  currentIndex={0}
                  disableScroll={false}
                  closeOnClickOutside={true}
                  onClose={() => setImageViewer(null)}
                />
              )}
            </>
          )}

          {/*Edit Message  */}
          <div
            className={`${
              showMenu ? "" : "hidden"
            } group-hover:flex absolute top-2 ${
              self ? "left-2 bg-c5" : "right-2 bg-c1"
            }`}
            onClick={() => setShowMenu(true)}
          >
            <Icons
              size="medium"
              className="bg-inherit rounded-md"
              icon={<GoChevronDown size={24} />}
            />
            {showMenu && (
              <MessageMenu
                self={self}
                showMenu={showMenu}
                setShowMenu={setShowMenu}
                deletePopupHandle={deletePopupHandle}
                setEditMessage={() => setEditMessage(message)}
              />
            )}
          </div>
        </div>
      </div>
      <div
        className={`flex items-end ${
          self ? "justify-start flex-row-reverse mr-12" : "ml-12"
        }`}
      >
        <div className="text-sx text-c3">{formateDate(date)}</div>
      </div>
    </div>
  );
}
