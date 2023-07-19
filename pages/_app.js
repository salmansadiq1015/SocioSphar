import "@/styles/globals.css";
import { UserProviser } from "@/context/authContext";
import { ChatContextProvider } from "@/context/chatContext";

export default function App({ Component, pageProps }) {
  return (
    <UserProviser>
      <ChatContextProvider>
        <Component {...pageProps} />
      </ChatContextProvider>
    </UserProviser>
  );
}
