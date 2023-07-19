import React from "react";
import PopupWrapper from "./PopupWrapper";
import { useAuth } from "@/context/authContext";
import { useChatContext } from "@/context/chatContext";
import { RiErrorWarningLine } from "react-icons/ri";
import { DELETED_FOR_EVERYONE, DELETED_FOR_ME } from "@/utils/constants";

const DeleteMsgPopup = (props) => {
  const { currentUser } = useAuth();
  const { users, dispatch } = useChatContext();

  return (
    <PopupWrapper {...props}>
      <div className="mt-10 mb-5">
        <div className="flex items-center justify-center gap-3">
          <RiErrorWarningLine size={24} className="text-red-600" />
          <div className="text-lg">
            Are you sure, you want to delete this message?
          </div>
        </div>
        <div className="flex items-center justify-around mt-10 ">
          <button
            onClick={() => props.deleteMessage(DELETED_FOR_ME)}
            className=" border-[2px] py-2 px-4 cursor-pointer rounded-md border-red-700
             text-red-600 active:scale-95 text-sm hover:bg-red-600 hover:text-white"
          >
            Delete for me
          </button>

          {props.self && (
            <button
              onClick={() => props.deleteMessage(DELETED_FOR_EVERYONE)}
              className=" border-[2px] py-2 px-4 cursor-pointer rounded-md border-red-700
            text-red-600 active:scale-95 text-sm hover:bg-red-600 hover:text-white"
            >
              Delete for everyone
            </button>
          )}
          <button
            onClick={props.onHide}
            className=" border-[2px] py-2 px-4 cursor-pointer rounded-md border-green-700
            text-green-600 active:scale-95 text-sm hover:bg-green-600 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </PopupWrapper>
  );
};

export default DeleteMsgPopup;
