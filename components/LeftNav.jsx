import React, { useState } from "react";
import { BiCheck, BiEdit } from "react-icons/bi";
import Avatar from "./Avatar";
import { useAuth } from "@/context/authContext";
import Icons from "./Icons";
import { FiPlus } from "react-icons/fi";
import { IoLogOutOutline, IoClose } from "react-icons/io5";
import { MdAddAPhoto, MdDeleteForever, MdPhotoCamera } from "react-icons/md";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { profileColors } from "@/utils/constants";
import ToastMessage from "@/components/ToastMessage";
import { toast } from "react-toastify";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth, storage } from "@/firebase/firebase";
import { updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import UsersPopup from "./popup/UsersPopup";

export default function LeftNav() {
  const [usersPopup, setUsersPopup] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [nameEdited, setNameEdited] = useState(false);
  const { currentUser, signOut, setCurrentUser } = useAuth();
  const authUser = auth.currentUser;

  // Update Photo
  const uploadImageToFirestore = (file) => {
    try {
      if (file) {
        // Upload File Logic
        const storageRef = ref(storage, currentUser.displayName);
        const uploadTask = uploadBytesResumable(storageRef, file);

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
            getDownloadURL(uploadTask.snapshot.ref).then(
              async (downloadURL) => {
                console.log("File available at", downloadURL);
                handleUpdateProfile("photo", downloadURL);
                await updateProfile(authUser, {
                  photoURL: downloadURL,
                });
              }
            );
          }
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle Update Profile
  const handleUpdateProfile = (type, value) => {
    // Change (Color, name, photo, remove-photo)
    const obj = { ...currentUser };
    switch (type) {
      case "color":
        obj.color = value;
        break;
      case "name":
        obj.displayName = value;
        break;
      case "photo":
        obj.photoURL = value;
        break;
      case "photo-remove":
        obj.photoURL = null;
        break;
      default:
        break;
    }

    try {
      toast.promise(
        async () => {
          // Updation
          const userDocRef = doc(db, "users", currentUser.uid);
          await updateDoc(userDocRef, obj);
          setCurrentUser(obj);

          if (type === "photo-remove") {
            await updateProfile(authUser, {
              photoURL: null,
            });
          }
          if (type === "name") {
            await updateProfile(authUser, {
              displayName: value,
            });
            setNameEdited(false);
          }
        },
        {
          pending: "Updating Profile...",
          success: "Profile is updated successfully",
          error: "Profile update failed! 🤯",
        },
        {
          autoClose: 3000,
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const onkeyup = (e) => {
    if (e.target.innerText.trim() !== currentUser.displayName) {
      // Name is edited
      setNameEdited(true);
    } else {
      // Name is not Edited
      setNameEdited(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const editProfileContainer = () => {
    return (
      <div className="relative flex flex-col items-center">
        <ToastMessage />
        <Icons
          size="small"
          icon={<IoClose size={20} />}
          onClick={() => setEditProfile(false)}
          className="absolute top-1 right-5 hover:bg-c2 transition-all"
        />

        {/* Avatars */}
        <div className="relative group cursor-pointer ">
          <Avatar size="xx-large" user={currentUser} />
          <div
            className="w-full h-full rounded-full bg-black/[0.5] absolute 
            top-0 left-0 items-center justify-center hidden group-hover:flex"
          >
            <label htmlFor="fileUpload">
              {currentUser?.photoURL ? (
                <MdPhotoCamera size={34} />
              ) : (
                <MdAddAPhoto size={34} />
              )}
            </label>
            <input
              type="file"
              id="fileUpload"
              style={{ display: "none" }}
              onChange={(e) => uploadImageToFirestore(e.target.files[0])}
            />
          </div>

          {/* Delete Profile */}
          {currentUser.photoURL && (
            <div
              className="w-6 h-6 rounded-full bg-red-500 flex justify-center
           items-center absolute right-0 bottom-0 "
              onClick={() => handleUpdateProfile("photo-remove")}
            >
              <MdDeleteForever size={14} />
            </div>
          )}
        </div>

        {/* Name and Email */}
        <div className="mt-5 flex flex-col items-center gap-1 select-none">
          <div className="flex items-center gap-2">
            {/*If Name is not edited  */}

            {!nameEdited && <BiEdit className="text-c3  " />}

            {/*If Name is edited  */}

            {nameEdited && (
              <BsFillCheckCircleFill
                className="text-c4 cursor-pointer  "
                onClick={() => {
                  handleUpdateProfile(
                    "name",
                    document.getElementById("displayNameEdit").innerText
                  );
                }}
              />
            )}
            <div
              contentEditable
              className="bg-transparent outline-none border-none text-center select-none"
              id="displayNameEdit"
              onKeyUp={onkeyup}
              onKeyDown={onKeyDown}
            >
              {currentUser.displayName}
            </div>
          </div>
          <span className="text-c3 text-sm">{currentUser.email}</span>
        </div>

        {/* ---------Color Pannel--------- */}
        <div className="grid grid-cols-5 gap-4 mt-5">
          {profileColors.map((color, index) => (
            <span
              key={index}
              className="w-10 h-10 rounded-full flex items-center justify-center
               cursor-pointer transition-transform hover:scale-125 "
              style={{ backgroundColor: color }}
              onClick={() => {
                handleUpdateProfile("color", color);
              }}
            >
              {color === currentUser.color && <BiCheck size={24} />}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${
        editProfile ? "w-[350px]" : "w-[80px] items-center"
      } flex flex-col justify-between py-5
       shrink-0 transition-all`}
    >
      {editProfile ? (
        editProfileContainer()
      ) : (
        <div
          className="relative group cursor-pointer"
          onClick={() => setEditProfile(true)}
        >
          <Avatar size="large" user={currentUser} />
          <div
            className="w-full h-full rounded-full bg-black/[0.5] absolute left-0 top-0 
          justify-center items-center hidden group-hover:flex"
          >
            <BiEdit size={14} />
          </div>
        </div>
      )}

      {/* Bottom Icons */}
      <div
        className={`flex gap-5 
       ${editProfile ? "ml-5" : "flex-col items-center"}`}
      >
        <Icons
          size="x-large"
          icon={<FiPlus size={24} />}
          onClick={() => setUsersPopup(!usersPopup)}
          className="bg-green-500 hover:bg-green-700 transition-all"
        />

        <Icons
          size="x-large"
          icon={<IoLogOutOutline size={24} />}
          onClick={signOut}
          className="bg-c1 hover:bg-c2 transition-all"
        />
      </div>
      {/* Users PopUp */}
      {usersPopup && (
        <UsersPopup onHide={() => setUsersPopup(false)} title="Find Users" />
      )}
    </div>
  );
}
