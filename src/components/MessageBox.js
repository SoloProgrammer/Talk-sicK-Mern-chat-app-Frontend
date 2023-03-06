import { Box, FormControl, Image, Spinner, Text, Tooltip } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import { ChatState } from '../Context/ChatProvider'
import BrandLogo from '../utils/BrandLogo'
import MessagesBoxTopbar from './Materials/MessagesBoxTopbar'
import MessageBox from './MessagesBox'
import EmojiPicker from 'emoji-picker-react';
import { server } from '../configs/serverURl'
import { HandleLogout } from '../configs/userConfigs'
import { scrollBottom } from '../configs/scrollConfigs'
import sentAudio from '../../src/mp3/MessageSent.mp3'
import notifyAudio from '../../src/mp3/Notification.mp3'
import chat1_icon from "../Images/chat1.jpg"
import chat2_icon from "../Images/chat2.png"


var selectedChatCompare;
var notificationsCompare;
var chatMessagesCompare;

function MessagesBox() {

  const { user, setChats, refreshChats, setChatMessages, chatMessages, selectedChat, setProfile, profile, showToast, socket, seenlstMessage, notifications, setNotifications, socketConneted, setIsTyping, setTypingUser } = ChatState()

  const [messageText, setMessageText] = useState("")

  const sendBtn = "https://cdn-icons-png.flaticon.com/512/3060/3060014.png"
  const sendBtnActive = "https://cdn-icons-png.flaticon.com/512/3059/3059413.png"

  const emojiIcon = "https://cdn-icons-png.flaticon.com/512/9320/9320978.png"

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

    if (messageText.length > 0) socket.emit("typing", selectedChat?._id, user?.name);

    let TypingDelay = setTimeout(() => {
      socket.emit("stop typing", selectedChat?._id);
    }, 1500);

    return () => clearTimeout(TypingDelay)

    // eslint-disable-next-line
  }, [messageText])

  useEffect(() => {
    if (socket) {
      socket.on("typing", (u, room) => {
        if (selectedChatCompare && (u !== user?.name && room === selectedChatCompare._id)) {
          setIsTyping(true);
          setTypingUser(u)
        }

      })
      socket.on("stop typing", () => setIsTyping(false))
    }
  })

  const [isEmojiPick, setIsEmojiPick] = useState(false);

  window.addEventListener('click', () => {
    setIsEmojiPick(false)
  })

  useEffect(() => {
    setMessageText("")
    setIsEmojiPick(false)
    selectedChatCompare = selectedChat
    chatMessagesCompare = chatMessages
    // eslint-disable-next-line
  }, [selectedChat?._id, chatMessages]);

  const handleEmojiClick = (emoji) => {
    setMessageText(messageText.concat(emoji.emoji))
  }

  useEffect(() => {
    notificationsCompare = notifications
    // eslint-disable-next-line 
  }, [notifications])


  let notificationBeep = new Audio(notifyAudio)

  // reciveing real time message from server with the help of socket!....................................................
  useEffect(() => {

    // this useEFfect will run whenever socket sends a new message.................................. to recieved it!
    socket?.on("message recieved", (newMessageRecieved, Previousmessages, user) => {

      if (!selectedChatCompare || selectedChatCompare?._id !== newMessageRecieved.chat._id) {
        // give notification
        if (!socket) return
        else {

          if ((notificationsCompare.length === 0) || (notificationsCompare.length > 0 && !(notificationsCompare.map(noti => noti.chat._id).includes(newMessageRecieved.chat._id)))) {

            if (!newMessageRecieved.chat.archivedBy.includes(user._id) && !newMessageRecieved.chat.mutedNotificationBy.includes(user?._id)) {
              setNotifications([newMessageRecieved, ...notificationsCompare]);
              notificationBeep.play()
            }
            // console.log(".................", selectedChatCompare);
            setChatMessages(chatMessagesCompare.filter(chatM => chatM.chatId !== newMessageRecieved.chat._id))
          }

        }
        refreshChats(user);
      }
      else {
        setMessages([...Previousmessages, newMessageRecieved]);
        seenlstMessage(newMessageRecieved._id);
        refreshChats(user);

        // console.log("outside",chatMessages);

        chatMessagesCompare.map(cmp => {

          // console.log("inside map", selectedChatCompare._id,cmp.chatId);

          if (cmp.chatId === selectedChatCompare._id) {

            let chatWithNewMsg = { chatId: selectedChatCompare._id, messages: [...cmp.messages, newMessageRecieved] }

            // console.log("chatwithnewMessage", chatWithNewMsg);

            setChatMessages([...(chatMessagesCompare.filter(chm => chm.chatId !== selectedChatCompare._id)), chatWithNewMsg])
          }
          return 1
        })
      }
    })
    // eslint-disable-next-line 

  });

  const [messages, setMessages] = useState([])

  const [loading, setLoading] = useState(false)

  let messageSentBeep = new Audio(sentAudio)

  const sendMessage = async () => {
    if (messageText.replace(regx, '').length === 0) return setMessageText("")

    setMessageText("");
    setLoading(true);

    try {

      let config = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        },
        body: JSON.stringify({ chatId: selectedChat?._id, content: { message: messageText } })
      }

      let res = await fetch(`${server.URL.production}/api/message/sendmessage`, config);

      if (res.status === 401) return HandleLogout()

      let json = await res.json();

      if (!json.status) return showToast("Error", json.message, "error", 3000);

      messageSentBeep?.play();

      socket.emit('new message', json.fullmessage, messages, user)

      setMessages([...messages, json.fullmessage]);

      chatMessages.map(chatMsg => {
        if (chatMsg.chatId === selectedChat?._id) {

          chatMsg = { chatId: selectedChat._id, messages: [...chatMsg.messages, json.fullmessage] }

          setChatMessages([...(chatMessages.filter(cm => cm.chatId !== selectedChat._id)), chatMsg]) // cm := ChatMessage
        }
        return 1
      })

      setChats(json.chats.filter(c => !c.archivedBy.includes(user?._id)));

      setLoading(false);
    } catch (error) {
      showToast("Error", error.message, "error", 3000)
    }
  }

  const regx = / |\n/g

  // const handleKeyDown = (e) => {


  //   if (e.keyCode === 13 && !e.shiftKey) {
  //     if (e.target.value.replace(regx, '').length > 0) {
  //       console.log("Sending...")
  //       setMessageText("")
  //       e.target.value = ""
  //       e.target.value = ""
  //       return
  //     }
  //     else {
  //       e.target.value = ""
  //       setMessageText("")
  //       return
  //     }
  //   }

  //   ((e.target.value.replace(regx, '').length > 0 && e.keyCode !== 13) || (e.keyCode === 8)) && setMessageText(e.target.value);



  //   if ((e.keyCode === 13 && e.shiftKey) || (e.keyCode === 8 && e.shiftKey) || ((e.keyCode !== 13 && e.keyCode !== 8) || (e.keyCode === 8) || messageText.replace(regx, "").length > 1)) {
  //     if (e.target.scrollHeight < 150) {
  //       e.target.style.height = "0"
  //       e.target.style.height = e.target.scrollHeight + "px";
  //       document.querySelector('.messageTextbox').style.height = e.target.scrollHeight + 8 + "px";
  //     }

  //     if (profile) setProfile(null);
  //     if (isEmojiPick) setIsEmojiPick(false);

  //   }

  // }

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) sendMessage()
  }
  return (
    <Box overflow={"hidden"} display={{ base: selectedChat ? "flex" : "none", md: "flex" }} className='messagesBox' width={{ base: "100%", md: "60%", lg: "64%" }}>
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
                Talk-o-Meter a Chat app Project with live personal as well as group messaging functionality<br />You will also recieve live Notifications from chats you have created for the newly recieved messages
              </Text>
              <br />
              <Text
                fontWeight={"medium"}
                fontSize={{ md: "2xl" }}
                color={"#31ceb8"}
                textAlign="center"
              >
                Create a chat or Click on the Existing chat to start Conversation..!
              </Text>
            </Box>
          </Box>
          :
          <Box width={"100%"} pos="relative">

            <MessagesBoxTopbar />

            <MessageBox messages={messages} setMessages={setMessages} />

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
                <FormControl width={"auto"} marginBottom=".5rem" onKeyDown={handleKeyDown} height={"3rem"} marginRight={{base:"0",md:".3rem"}}>
                  <input
                    onFocus={() => scrollBottom('messagesDisplay')}
                    className='MessageBoxInput'
                    placeholder='Type your message......'
                    id='text'
                    type="text"
                    value={messageText} onChange={handleMessageTyping}
                  />
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
                    <Tooltip placement='top' fontSize={".8rem"} label="Image">
                      <Image cursor={"pointer"} src='https://cdn-icons-png.flaticon.com/512/4303/4303472.png' opacity={".5"} width={"1.7rem"} />
                    </Tooltip>
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
                            cursor={messageText !== "" && "pointer"}
                            width={"2rem"}
                            onClick={sendMessage}
                            className={`${messageText.replace(regx, '').length > 0 && "sentBtn"}`}
                            src={`${messageText.replace(regx, '').length !== 0 ? sendBtn : sendBtnActive}`} />
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

export default MessagesBox
