import { PhoneIcon } from '@chakra-ui/icons'
import { Box, Button, Image, Input, InputGroup, InputLeftElement, InputRightElement, Text } from '@chakra-ui/react'
import React from 'react'
import { getSender } from '../configs/userConfigs'
import { ChatState } from '../Context/ChatProvider'
import BrandLogo from '../utils/BrandLogo'
import MessagesBoxTopbar from './Materials/MessagesBoxTopbar'
import MessageBox from './MessageBox'

function MessagesBox() {

  const { selectedChat, user } = ChatState()

  return (
    <Box display={{ base: selectedChat ? "flex" : "none", md: "flex" }} className='messagesBox' width={{ base: "100%", md: "60%", lg: "64%" }}>
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
          </Box> :
          <Box width={"100%"} pos="relative">
            <MessagesBoxTopbar />
            <MessageBox />
            <Box pos={"absolute"} bottom="0.5" width={"100%"}>
              <InputGroup>
                <InputLeftElement
                  pointerEvents='none'
                  children={<PhoneIcon color='gray.300' />}
                />
                <Input variant={"filled"} type='tel' placeholder='Your message...' />
              </InputGroup>
            </Box>
          </Box>
      }
    </Box>
  )
}

export default MessagesBox
