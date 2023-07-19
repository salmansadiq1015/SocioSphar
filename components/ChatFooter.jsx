import React, { useState } from "react";
import Icons from "./Icons";
import { CgAttachment } from "react-icons/cg";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import ComposeBar from "./ComposeBar";
import EmojiPicker from "emoji-picker-react";
import ClickAwayListener from "react-click-away-listener";
import { useChatContext } from "@/context/chatContext";
import { IoClose } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";

export default function ChatFooter() {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const {
    data,
    isTyping,
    editMessage,
    setEditMessage,
    inputText,
    setInputText,
    setAttachment,
    setAttachmentPreview,
    attachmentPreview,
  } = useChatContext();

  // Get Imogi
  const onEmojiClick = (emojiData) => {
    let text = inputText;
    setInputText((text += emojiData.emoji));
  };

  // Get file Attachment
  const onFileChange = (e) => {
    const file = e.target.files[0];
    setAttachment(file);

    if (file) {
      const blobURL = URL.createObjectURL(file);
      setAttachmentPreview(blobURL);
    }
  };

  return (
    <div className=" flex items-center bg-c1/[0.5] rounded-md relative p-2">
      {attachmentPreview && (
        <div className="absolute w-[100px] h-[100px] bottom-16 left-0 bg-c1  rounded-md p-1 ">
          <img
            src={attachmentPreview}
            alt=""
            className="w-full h-full object-fill rounded-md select-none hover:scale-110 transition"
          />
          <div
            className=" w-6 h-6 rounded-full bg-red-500 flex
        items-center justify-center absolute -right-2 -top-2 hover:bg-red-700 
        transition-colors cursor-pointer active:scale-95 hover:scale-105"
            onClick={() => {
              setAttachment(null);
              setAttachmentPreview(null);
            }}
          >
            <MdDeleteForever size={18} />
          </div>
        </div>
      )}

      <div className="shrink-0">
        <input
          type="file"
          id="fileUploader"
          onChange={onFileChange}
          className="hidden"
        />
        <label htmlFor="fileUploader">
          <Icons
            size="large"
            icon={<CgAttachment size={20} className="text-c3" />}
          />
        </label>
      </div>
      <div className="relative shrink-0">
        <Icons
          size="large"
          icon={<HiOutlineEmojiHappy size={24} className="text-c3" />}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        />
        {showEmojiPicker && (
          <ClickAwayListener
            onClickAway={() => {
              setShowEmojiPicker(false);
            }}
          >
            <div className="absolute bottom-12 left-0 shadow-lg ">
              <EmojiPicker
                emojiStyle="native"
                theme="light"
                onEmojiClick={onEmojiClick}
                autoFocusSearch={false}
              />
            </div>
          </ClickAwayListener>
        )}
      </div>
      {isTyping && (
        <div className="absolute -top-6 left-4 bg-c2 w-full h-6">
          <div
            className="flex gap-2 w-full h-full opacity-50 text-sm
               text-white"
          >
            {`${data?.user?.displayName} is typing`}
            <img src="/typing.svg" alt="" />
          </div>
        </div>
      )}
      {editMessage && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2
      bg-c4 flex items-center justify-center gap-2 px-4 py-2 pr-2 rounded-full 
      text-sm font-semibold cursor-pointer shadow-lg select-none "
          onClick={() => setEditMessage(null)}
        >
          {" "}
          <span>Cancel Edit</span>
          <IoClose
            size={20}
            className="hover:bg-c2 p2 transition rounded-full"
          />
        </div>
      )}
      <ComposeBar />
    </div>
  );
}
