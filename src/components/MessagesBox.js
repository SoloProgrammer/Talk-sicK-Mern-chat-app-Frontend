import { Box, Image, Text } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
// import { getSender } from '../configs/userConfigs'
import { ChatState } from '../Context/ChatProvider'
import BrandLogo from '../utils/BrandLogo'
import MessagesBoxTopbar from './Materials/MessagesBoxTopbar'
import MessageBox from './MessageBox'
import EmojiPicker from 'emoji-picker-react';

function MessagesBox() {

  const { selectedChat,setProfile,profile  } = ChatState()

  const [messageText, setMessageText] = useState("")

  const sendBtn = "https://cdn-icons-png.flaticon.com/512/3060/3060014.png"
  const sendBtnActive = "https://cdn-icons-png.flaticon.com/512/3059/3059413.png"

  const emojiIconActive = "https://cdn-icons-png.flaticon.com/512/166/166549.png"
  const emojiIcon = "https://cdn-icons-png.flaticon.com/512/9320/9320978.png"

  const handleChange = (e) => {
    setMessageText(e.target.value)
    if(profile) setProfile(null)
    if(isEmojiPick) setIsEmojiPick(false)
  }

  const [isEmojiPick, setIsEmojiPick] = useState(false)

  useEffect(() => {
    setIsEmojiPick(false)
    setMessageText("")
  }, [selectedChat])

  const handleEmojiClick = (emoji) => {
    setMessageText(messageText.concat(emoji.emoji))
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
                Talk-o-Meter a Chat app Project with live personal as well as group messaging functionality<br />You will also recieve live Notifications from chats you have created for the newly recived messages
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
            <MessageBox />
            <Box marginLeft={{ base: "0rem", md: ".2rem" }} background={"white"} pos={"absolute"} bottom="0" width={"100%"} boxShadow="0 0 4px rgba(0,0,0,.3)">
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
                      searchDisabled />
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
                <Box height={"3rem"} width={{ base: "84%", md: "90%" }} >
                  <input className='MessageBoxInput' placeholder='Write message here......' id='text' type="text" value={messageText} onChange={handleChange} />
                </Box>
                <Box className='flex' width={{ base: "8%", md: "5%" }}>
                  <Image
                    opacity={".5"}
                    cursor={messageText !== "" && "pointer"}
                    width={"2rem"}
                    className={`${messageText !== "" && "sentBtn"}`}
                    src={`${messageText.length !== 0 ? sendBtn : sendBtnActive}`} ></Image>
                </Box>
              </Box>
            </Box>
          </Box>
      }
    </Box>
  )
}

export default MessagesBox
