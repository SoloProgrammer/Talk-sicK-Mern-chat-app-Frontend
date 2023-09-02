import { Box, FormControl, Image, Spinner, Text, Tooltip, useDisclosure } from '@chakra-ui/react'
import React, { useState, useEffect, useCallback } from 'react'
import { ChatState } from '../Context/ChatProvider'
import BrandLogo from '../utils/BrandLogo'
import MessagesBoxTopbar from './Materials/MessagesBoxTopbar'
import MessagesBox from './MessagesBox'
import EmojiPicker from 'emoji-picker-react';
import { server } from '../configs/serverURl'
import { HandleLogout } from '../configs/userConfigs'
import { scrollBottom } from '../configs/scrollConfigs'
import sentAudio from '../../src/mp3/MessageSent.mp3'
import notifyAudio from '../../src/mp3/Notification.mp3'
import chat1_icon from "../Images/chat1.jpg"
import chat2_icon from "../Images/chat2.png"
import SendImageModal from './Materials/Modals/SendImageModal'
import { emojiIcon, sendBtn, sendBtnActive } from '../configs/ImageConfigs'
import Linkify from 'react-linkify'
import { flushSync } from 'react-dom';


var selectedChatCompare;
var notificationsCompare;
var chatMessagesCompare;
var chatsFetchCount = 0;

function MessageBox() {

  const { getPinnedChats, getUnPinnedChats, user, setChats, setArchivedChats, refreshChats, setChatMessages, chatMessages, selectedChat, setProfile, profile, showToast, socket, seenMessages, notifications, setNotifications, socketConneted, sendPic, setSendPic, messages, setMessages } = ChatState()

  const [messageText, setMessageText] = useState("");

  const [isFirstLoadOfMsgs, setIsFirstLoadOfMsgs] = useState(true)

  const handleMessageTyping = (e) => {

    // if (e.target.scrollHeight < 150) {
    //   e.target.style.height = "0"
    //   e.target.style.height = e.target.scrollHeight + "px";
    //   document.querySelector('.messageTextbox').style.height = e.target.scrollHeight + 8 + "px";
    // }

    setMessageText(e.target.value);

    if (profile) setProfile(null);
    if (isEmojiPick) setIsEmojiPick(false);

  }

  useEffect(() => {

    if (!socketConneted) return console.log("Socket disconnected!");

    if (messageText.length > 0) socket.emit("typing", selectedChatCompare?._id, user);

    let TypingDelay = setTimeout(() => {
      socket.emit("stop typing", selectedChatCompare?._id, user);
    }, 1500);

    return () => clearTimeout(TypingDelay)

    // eslint-disable-next-line
  }, [messageText])
  
  const [isEmojiPick, setIsEmojiPick] = useState(false);

  window.addEventListener('click', () => {
    isEmojiPick && setIsEmojiPick(false)
  })

  useEffect(() => {
    setMessageText("")
    setIsEmojiPick(false)
    selectedChatCompare = selectedChat
    // eslint-disable-next-line
  }, [selectedChat?._id, chatMessages]);

  useEffect(() => {
    chatMessagesCompare = chatMessages
  }, [chatMessages]);


  // const [] = useState([]);

  useEffect(() => {
    if (messages.length > 0) chatsFetchCount = 0
    // eslint-disable-next-line
  }, [messages])

  const handleEmojiClick = (emoji) => {
    setMessageText(messageText.concat(emoji.emoji))
  }

  useEffect(() => {
    notificationsCompare = notifications
    // eslint-disable-next-line 
  }, [notifications])

  const getSelectedChatDownloadedMsgs = () => {
    // console.log(selectedChatCompare, '[[[[');
    // it will return all the already downloaded messages from the server which is cached in the chatMessagesCompare
    return chatMessagesCompare?.filter(ch => ch.chatId === selectedChatCompare?._id)[0]?.messages
  }

  const updateChatMsgs = (newMessage) => {
    chatMessagesCompare.forEach(cmp => {

      // console.log("inside map", selectedChatCompare._id,cmp.chatId);

      if (cmp.chatId === newMessage?.chat?._id) {

        let chatWithNewMsgs = { chatId: newMessage?.chat._id, messages: [...cmp.messages, newMessage] }

        // console.log("chatwithnewMessage", chatWithNewMsg);

        setChatMessages([...(chatMessagesCompare.filter(chm => chm.chatId !== selectedChatCompare._id)), chatWithNewMsgs])
        // console.log('after');
        // setIsFirstLoadOfMsgs(true)
      }
    })
  }
  // reciveing real time/live message from users with the help of socket servers!....................................................
  useEffect(() => {

    const messageReceivedEventListener = (newMessageRecieved, User) => {
      if (!user) return

      let chatMsgs = getSelectedChatDownloadedMsgs()

      !chatsFetchCount && chatsFetchCount++

      // auming that user is in the chat and he has fetched the messeges before so now we are updating the firstloadMsgs value to false saying that messges are already loaded if not then still no problem when we are fetching the messeges if the user open the chats first time when he receives the new messges then in that function we are updating the  IsFirstLoadOfMsgs to true!
      setIsFirstLoadOfMsgs(false);

      if (!selectedChatCompare || selectedChatCompare?._id !== newMessageRecieved.chat._id) {

        // give notification
        let notificationBeep = new Audio(notifyAudio)

        // console.log("notification");
        if (!socket) return
        else {

          if ((notificationsCompare.length === 0) || (notificationsCompare.length > 0 && !(notificationsCompare.map(noti => noti.chat._id).includes(newMessageRecieved.chat._id)))) {

            if (!newMessageRecieved.chat.archivedBy.includes(User._id) && !newMessageRecieved.chat.mutedNotificationBy.includes(User?._id)) {
              setNotifications([newMessageRecieved, ...notificationsCompare]);
              notificationBeep.play()
              notificationBeep.remove();
            }
            // console.log("hhh");
            // updateChatMsgs(newMessageRecieved)
            setChatMessages(chatMessagesCompare?.filter(chm => chm.chatId !== newMessageRecieved?.chat?._id))
          }

        }
        if (chatsFetchCount === 1) {
          refreshChats(User);
        }

      }
      else {
        // console.log("seenMessge");
        setMessages([...chatMsgs, newMessageRecieved]);
        seenMessages(selectedChatCompare);
        if (chatsFetchCount === 1) {
          refreshChats(user, selectedChatCompare);
          setTimeout(() => {
            chatsFetchCount = 0
          }, 200);
        }
        updateChatMsgs(newMessageRecieved)

      }
    };
    socket?.on("message recieved", messageReceivedEventListener);
    // eslint-disable-next-line 
  }, [socket, user]);

  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (messageText.replace(regx, '').length === 0 && !sendPic) return setMessageText("")
    setLoading(true);

    try {
      let content;
      let messageSentBeep = new Audio(sentAudio)

      if (sendPic) {
        content = { message: messageText, img: sendPic.picture }
      }
      else {
        content = { message: messageText }
      }

      let config = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        },
        body: JSON.stringify({ chatId: selectedChat?._id, content, receiverIds: selectedChat.users.filter(u => u._id !== user?._id).map(u => u._id), msgType: "regular" })
      }

      setMessageText("");
      setSendPic(null)

      let res = await fetch(`${server.URL.local}/api/message/sendmessage`, config);

      if (res.status === 401) return HandleLogout()

      let json = await res.json();

      if (!json.status) return showToast("Error", json.message, "error", 3000);

      messageSentBeep?.play();
      messageSentBeep?.remove()

      setMessages((prevMessages) => [...prevMessages, json.fullmessage]);

      socket.emit('new message', json.fullmessage)
      let chatMsg;

      if (chatMessages.length === 0 || !chatMessages.map(ch => ch.chatId).includes(selectedChat._id)) {
        chatMsg = { chatId: selectedChat._id, messages: [json.fullmessage] }
        flushSync(() => setChatMessages([...chatMessages, chatMsg])) // cm := ChatMessage
      }
      else {
        chatMessages.forEach(chatMsg => {
          if (chatMsg.chatId === selectedChat?._id) {

            chatMsg = { chatId: selectedChat._id, messages: [...chatMsg.messages, json.fullmessage] }

            flushSync(() => setChatMessages([...(chatMessages.filter(cm => cm.chatId !== selectedChat._id)), chatMsg])) // cm := ChatMessage
          }
        })
      }

      setArchivedChats(json.chats.filter(c => c.archivedBy.includes(user?._id)))
      setChats([...getPinnedChats(json.chats, user), ...getUnPinnedChats(json.chats, user)]);

      setLoading(false);
    } catch (error) {
      showToast("Error", error.message, "error", 3000)
    }
  }

  const regx = / |\n/g

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) sendMessage()
  }

  const { isOpen, onOpen, onClose } = useDisclosure();

  const trimPicname = useCallback(name => {

    let nameSplit = name.split('.')

    if (window.innerWidth > 890) return name;
    else if (nameSplit[0].length > 16) {
      return name.slice(0, 15) + "..." + nameSplit[1]
    }
    else return name

    // eslint-disable-next-line
  }, [sendPic])

  return (
    <Box overflow={"hidden"} display={{ base: selectedChat ? "flex" : "none", md: selectedChat ? "flex" : "none", lg: "flex" }} className='messagesBox' width={{ base: "100%", md: "100%", lg: "64%" }}>
      {
        !selectedChat ?
          <Box zIndex={1}
            display="flex"
            alignItems="center"
            flexDir={"column"}
            width="100%"
            padding={{ base: "0 .5rem", md: "0 5rem" }} gap="2rem" marginTop={"7rem"}>
            <BrandLogo />
            <Image className='chat1_icon' opacity={".7"} width="220px" src={chat2_icon} />
            <Image className='chat2_icon' opacity={".7"} width="220px" src={chat1_icon} />
            <Box className='messagesBoxText'>
              <Text
                fontWeight={"normal"}
                letterSpacing="0.05rem"
                textAlign={"center"}
                fontSize={{ md: ".9rem" }} >
                Talk-sicK a Chat app Project with live personal as well as group messaging functionality<br />You will also recieve live Notifications from chats you have created for the newly recieved messages
              </Text>
              <br />
              <Text
                fontWeight={"medium"}
                fontSize={{ md: "2xl" }}
                color={"#31ceb8"}
                textAlign="center"
              >
                Search and Create a Chat or Click on the Existing Chat to Start Conversation..!
              </Text>
            </Box>
          </Box>
          :
          <Box width={"100%"} pos="relative">

            <MessagesBoxTopbar />

            <MessagesBox messages={messages} setMessages={setMessages} isFirstLoadOfMsgs={isFirstLoadOfMsgs} setIsFirstLoadOfMsgs={setIsFirstLoadOfMsgs} />

            <Box
              zIndex={3}
              marginLeft={{ base: "0rem", md: ".2rem" }}
              background={"white"}
              pos={"absolute"}
              bottom="0"
              className='messageTextbox'
              width={"100%"}
              minHeight="57px !important"
              boxShadow="0 -4px 4px -4px rgba(0,0,0,.3)">
              <Box pos={"relative"} height={"100%"} padding=".3rem">
                {
                  isEmojiPick &&
                  <Box width={{ base: "315px", md: "360px" }} pos={"absolute"} bottom="6.5rem" onClick={(e) => e.stopPropagation()} >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={"100%"}
                      height={"20rem"}
                      className="emojiPicker"
                      lazyLoadEmojis={false}
                      searchDisabled
                    />
                  </Box>
                }
                <FormControl width={"auto"} marginBottom=".5rem" onKeyDown={handleKeyDown} height={"3rem"} marginRight={{ base: "0", md: ".3rem" }}>
                  <Linkify>
                    <input
                      onFocus={() => scrollBottom('messagesDisplay')}
                      className='MessageBoxInput none'
                      placeholder={sendPic ? "Type your message OR Send Image...." : 'Type your message......'}
                      id='text'
                      type="text"
                      value={messageText}
                      onChange={handleMessageTyping}
                    />
                  </Linkify>
                </FormControl>
                <Box className="flex" alignItems={"end"} paddingBottom=".5rem" justifyContent={'space-between'} padding="0 .5rem 0 0">
                  <Box className='flex' gap={"1rem"}>
                    <Tooltip placement='top' fontSize={".8rem"} label="Emoji">
                      <Image
                        cursor={"pointer"}
                        onClick={(e) => { setIsEmojiPick(!isEmojiPick); e.stopPropagation() }}
                        width={{ base: "2rem" }}
                        src={emojiIcon}
                      />
                    </Tooltip>
                    <SendImageModal isOpen={isOpen} onClose={onClose}>
                      <Tooltip placement='top' fontSize={".8rem"} label="Image">
                        <Image onClick={onOpen} cursor={"pointer"} src='https://cdn-icons-png.flaticon.com/512/4303/4303472.png' opacity={".5"} width={"1.7rem"} />
                      </Tooltip>
                    </SendImageModal>
                    {
                      sendPic
                      &&
                      <Box padding={".055rem 1rem"} background="gray.200" borderRadius={"1rem"} pos="relative">
                        <Tooltip label="remove" fontSize={".7rem"} placement="top">
                          <i className="fa-solid fa-xmark sendPicx-mark" onClick={() => setSendPic(null)} />
                        </Tooltip>
                        <Text fontSize={".95rem"} fontWeight="normal" letterSpacing={"0.01rem"}>
                          {trimPicname(sendPic.picName)}
                        </Text>
                      </Box>
                    }
                  </Box>
                  <Box className='flex' alignItems={"end"} justifyContent={"end"}>
                    {
                      loading
                        ?
                        <Tooltip placement='top' label="sending...." isOpen>
                          <Spinner size={"lg"} color="#39b5ac" />
                        </Tooltip>
                        :
                        <Tooltip placement='top' fontSize={".8rem"} label="Enter/Click to Send">
                          <Image
                            opacity={".5"}
                            cursor={(messageText !== "" || sendPic) && "pointer"}
                            width={"2rem"}
                            onClick={sendMessage}
                            className={`${messageText.replace(regx, '').length > 0 && "sentBtn"}`}
                            src={`${messageText.replace(regx, '').length !== 0 || sendPic ? sendBtnActive : sendBtn}`} />
                        </Tooltip>
                    }
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
      }
    </Box>
  )
}

export default MessageBox
