import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();
import { onAuthStateChanged, signOut as authSignOut } from "firebase/auth";
import { auth, db } from "@/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const UserProviser = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clear = async () => {
    try {
      if (currentUser) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          isOnline: false,
        });
      }

      setCurrentUser(null);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const authStateChanged = async (user) => {
    setIsLoading(true);
    if (!user) {
      clear();
      return;
    }

    const userDocExit = await getDoc(doc(db, "users", user.uid));
    if (userDocExit.exists()) {
      await updateDoc(doc(db, "users", user.uid), {
        isOnline: true,
      });
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));

    setCurrentUser(userDoc.data());
    setIsLoading(false);
  };

  const signOut = () => {
    authSignOut(auth).then(() => clear());
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, authStateChanged);

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{ currentUser, setCurrentUser, isLoading, setIsLoading, signOut }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);