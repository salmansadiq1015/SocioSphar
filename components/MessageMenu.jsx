import React, { useEffect, useRef } from "react";
import ClickAwayListener from "react-click-away-listener";

export default function MessageMenu({
  showMenu,
  setShowMenu,
  self,
  deletePopupHandle,
  setEditMessage,
}) {
  const handleClickAway = () => {
    setShowMenu(false);
  };

  const ref = useRef();

  useEffect(() => {
    ref?.current?.scrollIntoViewIfNeeded();
  }, [showMenu]);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div
        ref={ref}
        className={`w-[200px] absolute  bg-c0 p-1  rounded-lg
      z-10 overflow-hidden top-8 ${self ? "right-0" : "left-0"}`}
      >
        <ul className="flex flex-col py-2">
          {self && (
            <li
              className="flex items-center py-3 px-5 hover:bg-black
          rounded-md cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setEditMessage();
                setShowMenu(false);
              }}
            >
              Edit Message
            </li>
          )}
          <li
            className="flex items-center py-3 px-5 hover:bg-black
          rounded-md cursor-pointer hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              deletePopupHandle(true);
            }}
          >
            Delete Message
          </li>
        </ul>
      </div>
    </ClickAwayListener>
  );
}
