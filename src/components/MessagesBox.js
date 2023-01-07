import { Box, Image, Text } from '@chakra-ui/react'
import React from 'react'
import { ChatState } from '../Context/ChatProvider'
import BrandLogo from '../utils/BrandLogo'

function MessagesBox() {

  const { selectedChat } = ChatState()
  return (
    <Box display={{ base: "none", md: "flex" }} className='messagesBox' width={{ base: "100%", md: "60%", lg: "64%" }}>
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
                fontWeight={"semibold"}
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
          </Box> :
          <Box>

          </Box>
      }
    </Box>
  )
}

export default MessagesBox
