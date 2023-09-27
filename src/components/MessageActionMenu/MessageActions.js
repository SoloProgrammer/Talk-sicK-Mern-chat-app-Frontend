import { Box, useDisclosure } from "@chakra-ui/react";
import React, { useState } from "react";
import "./style.css";
import ActionItem from "./ActionItem";
import ConfirmBoxModal from "../Materials/Modals/ConfirmBoxModal";
import { ChatState } from "../../Context/ChatProvider";
import { server } from "../../configs/serverURl";
import { HandleLogout } from "../../configs/userConfigs";
import EmojiMenu from "./EmojiPicker/EmojiPicker";

const MessageActions = ({ message, user, hidemessageActionMenu, hideEmojiBoxs }) => {
  const {
    selectedChat,
    setIsClosable,
    chatMessages,
    messages,
    setMessages,
    setChatMessages,
    showToast,
    chats,
    setChats,
    socket,
  } = ChatState();

  const initailLoading = {
    btn1: false,
    btn2: false,
  };
  const [loading, setLoading] = useState(initailLoading);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const EVERYONE = "everyone", MYSELF = "myself";

  const deleteMessage = async (e) => {
    setLoading({
      btn1: e.target.dataset.value === EVERYONE,
      btn2: e.target.dataset.value === MYSELF,
    });
    setIsClosable(false);

    try {
      let config = {
        method: "PUT",
        headers: {
          token: localStorage.getItem("token"),
        },
      };
      const res = await fetch(
        `${server.URL.local}/api/message/${message._id}/delete?for=${e.target.dataset.value}`,
        config
      );

      if (res.status === 401) HandleLogout();

      const { msg } = await res.json();

      if (msg?.deleted?.for === EVERYONE) {
        socket?.emit("delete message", msg);
      }

      let updatedmessages = messages.map((m) => {
        if (m._id === msg._id) m = msg;
        return m;
      });

      setMessages(updatedmessages);

      setChatMessages(
        chatMessages.map((chm) => {
          if (chm.chatId === msg.chat._id) {
            chm.messages = updatedmessages;
          }
          return chm;
        })
      );

      chats?.map((chat) => chat?.latestMessage?._id).includes(msg._id) &&
        setChats(
          chats.map((c) => {
            c.latestMessage =
              (c?.latestMessage &&
                c?._id === msg.chat._id &&
                c?.latestMessage?._id) === msg._id
                ? msg
                : c.latestMessage;
            return c;
          })
        );

      console.log(msg);
      setLoading(initailLoading);
      setIsClosable(true);
      onClose();
    } catch (error) {
      showToast("Error", error.message, "error", 3000);
      setLoading(initailLoading);
      setIsClosable(true);
    }
  };

  const handleEmojiIconClick = (e) => {

    e.stopPropagation()
    let EmojiBox = document?.querySelector(`#EmojiBox${message._id}`);
    let messageStrip = document?.querySelector(`#messageStrip${message._id}`);

    // If window size is less than 770px then go inside the if!
    if (window.innerWidth <= 770) {
      // This condition for when senders message width is reaching at the end then we will translate the Emojis box to -20% from the right 
      if (e.clientX < 100) {
        EmojiBox.style.transformOrigin = 'left bottom'
        EmojiBox.style.translate = '-20% 0%'

      }
      // This condition for when senders message width is reaching at the end then we will translate the Emojis box to -90% from the right
      else if (e.clientX > 290) {
        EmojiBox.style.transformOrigin = 'right bottom'
        EmojiBox.style.translate = '-90% 0%'
      }
    }

    hideEmojiBoxs()
    hidemessageActionMenu()
    messageStrip.classList.add('active')
    EmojiBox?.classList.add('active')
  }

  window.addEventListener('click', hideEmojiBoxs)

  return (
    <Box
      opacity={0}
      className="messageActionBox"
      transition={".15s ease-in"}
      pos={"absolute"}
      display={"flex"}
      gap={".5rem"}
      left={message.sender._id === user?._id ? "-5rem" : "auto"}
      right={message.sender._id !== user?._id ? "-2.8rem" : "auto"}
      top={"0%"}
      zIndex={"1"}
    >
      {message.sender._id === user?._id && (
        <ConfirmBoxModal
          isOpen={isOpen}
          onClose={onClose}
          modalDetail={{
            chat: selectedChat,
            text: "Are you Sure You want to Delete the message - ",
            subtext: message.content.message,
            subtextStyles: {
              fontSize: ".9rem",
              fontStyle: "italic",
              fontWeight: 400,
            },
            btn1: { dataValue: EVERYONE, copy: "delete for everyone" },
            btn2: { dataValue: MYSELF, copy: "delete for me" },
          }}
          showCloseBtn={false}
          handleFunc={deleteMessage}
          loading={loading}
        >
          <ActionItem
            handleFunc={onOpen}
            classNames={"delMsgIcon"}
            itemImgSrc={
              "https://cdn-icons-png.flaticon.com/512/3096/3096673.png"
            }
          />
        </ConfirmBoxModal>
      )}
      <ActionItem
        classNames={"reactMsgIcon"}
        handleFunc={handleEmojiIconClick}
        itemImgSrc={"https://cdn-icons-png.flaticon.com/512/1023/1023656.png"}
      >

        <EmojiMenu message={message} key={message._id} hideEmojiBoxs={hideEmojiBoxs} user={user} />
      </ActionItem>
    </Box>
  );
};

export default MessageActions;
