import { doc, DocumentData, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useDispatch } from "react-redux";
import { changeFriend } from "../slices/chatSlice";

const Chats = () => {
  const [chats, setChats] = useState<DocumentData>();
  const user = auth.currentUser;
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "chats", user!.uid), (snapshot) =>
      setChats(snapshot.data())
    );

    return () => {
      unsub();
    };
  }, [db, user?.uid]);

  return (
    <div className="pb-3 overflow-auto scrollbar-hide">
      {chats &&
        Object.entries(chats)
          .sort((a, b) => b[1].date - a[1].date)
          .map((chat) => (
            <div
              key={chat[0]}
              className="flex items-center gap-x-3 px-3 py-3 cursor-pointer hover:bg-[#2f2d52]"
              onClick={() => dispatch(changeFriend(chat[1].friendInfo))}
            >
              <img
                src={chat[1].friendInfo?.photoURL}
                alt="pic"
                className="rounded-full h-12 w-12"
              />
              <div className="text-white">
                <span className="text-lg">
                  {chat[1].friendInfo?.displayName}
                </span>
                <p className="text-sm">{chat[1].lastMessage}</p>
              </div>
            </div>
          ))}
    </div>
  );
};

export default Chats;
