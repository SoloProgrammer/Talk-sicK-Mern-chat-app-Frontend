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

var selectedChatCompare;
var notificationsCompare;
function MessagesBox() {

  const { setChats, selectedChat, setProfile, profile, showToast, socket, seenlstMessage, notifications, setNotifications } = ChatState()

  const [messageText, setMessageText] = useState("")

  const sendBtn = "https://cdn-icons-png.flaticon.com/512/3060/3060014.png"
  const sendBtnActive = "https://cdn-icons-png.flaticon.com/512/3059/3059413.png"

  const emojiIconActive = "https://cdn-icons-png.flaticon.com/512/166/166549.png"
  const emojiIcon = "https://cdn-icons-png.flaticon.com/512/9320/9320978.png"

  const handleChange = (e) => {
    setMessageText(e.target.value)
    if (profile) setProfile(null)
    if (isEmojiPick) setIsEmojiPick(false)
  }

  const [isEmojiPick, setIsEmojiPick] = useState(false)

  useEffect(() => {
    setMessageText("")
    setIsEmojiPick(false)
    selectedChatCompare = selectedChat

    // eslint-disable-next-line
  }, [selectedChat?._id]);

  const handleEmojiClick = (emoji) => {
    setMessageText(messageText.concat(emoji.emoji))
    setIsEmojiPick(false)
  }


  const refreshChats = async () => {

    try {
      const config = {
        headers: {
          token: localStorage.getItem('token')
        }
      }

      const res = await fetch(`${server.URL.production}/api/chat/allchats`, config);

      if (res.status === 401) HandleLogout()

      const json = await res.json();

      if (!json.status) return showToast("Error", json.message, "error", 3000)

      setChats(json.chats);

    } catch (error) {
      return showToast("Error", error.message, "error", 3000)
    }

  }
  useEffect(() => {
    notificationsCompare = notifications
    // console.log(notifications);

  }, [notifications])

  let notificationBeep = new Audio(notifyAudio)
  // reciveing real time message from server with the help of socket!....................................................
  useEffect(() => {

    // this useEFfect will run whenever socket sends a new message.................................. to recieved it!
    socket?.on("message recieved", (newMessageRecieved, Previousmessages) => {

      if (!selectedChatCompare || selectedChatCompare?._id !== newMessageRecieved.chat._id) {
        // give notification
        if (!socket) return
        else {
          
          if ((notificationsCompare.length === 0) || (notificationsCompare.length > 0 && !(notificationsCompare.map(noti => noti.chat._id).includes(newMessageRecieved.chat._id)))) {
            setNotifications([newMessageRecieved, ...notificationsCompare])
            notificationBeep.play()
          }

        }
        refreshChats();
      }
      else {
        setMessages([...Previousmessages, newMessageRecieved]);
        seenlstMessage(newMessageRecieved._id);
        refreshChats();

      }
    })

  });


  const [messages, setMessages] = useState([])

  const [loading, setLoading] = useState(false)

  let messageSentBeep = new Audio(sentAudio)

  const sendMessage = async () => {
    if (messageText === "") return

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

      socket.emit('new message', json.fullmessage, messages)

      setMessages([...messages, json.fullmessage]);

      setChats(json.chats);

      setLoading(false);


    } catch (error) {
      showToast("Error", error.message, "error", 3000)
    }
  }

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      sendMessage()
    }

  }

  return (
    <Box overflow={"hidden"} display={{ base: selectedChat ? "flex" : "none", md: "flex" }} className='messagesBox' width={{ base: "100%", md: "60%", lg: "64%" }}>
      {
        !selectedChat ?
          <Box zIndex={1}
            display="flex"
            justifyContent={"center"}
            alignItems="center"
            flexDir={"column"}
            width="100%"
            padding={{ base: "0 .5rem", md: "0 5rem" }} gap="2rem" marginTop={"4rem"}>
            <BrandLogo />
            <Image opacity={".5"} width={{ base: "250px", md: "300px" }} src="https://cdn-icons-png.flaticon.com/512/3964/3964329.png"></Image>
            <Box className='messagesBoxText'>
              <Text
                fontWeight={"normal"}
                letterSpacing="0.05rem"
                textAlign={"center"}
                color="black"
                fontSize={{ base: "1rem", md: "1.1rem" }} >
                Talk-o-Meter a Chat app Project with live personal as well as group messaging functionality<br />You will also recieve live Notifications from chats you have created for the newly recieved messages
              </Text>
              <br />
              <Text
                fontWeight={"hairline"}
                fontSize={{ base: "xl", md: "2xl" }}
                color={"black"}
                textAlign="center"
              >
                Create a chat or Click on the Existing chat to start Messaging
              </Text>
            </Box>
          </Box>
          :
          <Box width={"100%"} pos="relative">

            <MessagesBoxTopbar />

            <MessageBox messages={messages} setMessages={setMessages} />

            <Box zIndex={3} marginLeft={{ base: "0rem", md: ".2rem" }} background={"white"} pos={"absolute"} bottom="0" width={"100%"} boxShadow="0 0 4px rgba(0,0,0,.3)">
              <Box pos={"relative"} display="flex" padding={{ base: ".3rem .9rem", md: ".3rem" }}>
                {
                  isEmojiPick &&
                  <Box width={{ base: "315px", md: "360px" }} pos={"absolute"} bottom="4.2rem">
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
                <Box className="emojiPickbtn flex" width={{ base: "8%", md: "5%" }} >
                  <Image _hover={{ width: { base: "2rem", md: "1.6rem" } }}
                    cursor={"pointer"}
                    onClick={() => setIsEmojiPick(!isEmojiPick)}
                    width={{ base: isEmojiPick ? "1.4rem !important" : "2rem", md: isEmojiPick ? "1.6rem !important" : "2rem" }}
                    src={isEmojiPick ? emojiIconActive : emojiIcon}
                    onMouseOver={(e) => e.target.src = emojiIconActive} onMouseOut={(e) => e.target.src = !isEmojiPick ? emojiIcon : emojiIconActive} />
                </Box>
                <FormControl onKeyDown={handleKeyDown} height={"3rem"} width={{ base: "84%", md: "90%" }}>
                  <input onFocus={() => scrollBottom('messagesDisplay')} className='MessageBoxInput' placeholder='Write message here......' id='text' type="text" value={messageText} onChange={handleChange} />
                </FormControl>
                <Box className='flex' width={{ base: "8%", md: "5%" }}>
                  {
                    loading
                      ?
                      <Tooltip placement='top' label="sending...." isOpen>
                        <Spinner size={"md"} color="#39b5ac" />
                      </Tooltip>
                      :
                      <Image
                        opacity={".5"}
                        cursor={messageText !== "" && "pointer"}
                        width={"2rem"}
                        onClick={sendMessage}
                        className={`${messageText !== "" && "sentBtn"}`}
                        src={`${messageText.length !== 0 ? sendBtn : sendBtnActive}`} ></Image>
                  }
                </Box>
              </Box>
            </Box>
          </Box>
      }
    </Box>
  )
}

export default MessagesBox
