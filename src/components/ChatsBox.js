import { Box, Image, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import ChatsTopBar from './Materials/ChatsTopBar'

function ChatsBox() {

  const [chats, setChats] = useState(null)

  return (
    <Box className='chatsBox' height={"100%"} width={{ base: "100%", md: "40%", lg: "36%" }} boxShadow="0 0 0 2px rgba(0,0,0,.3)">
      <ChatsTopBar />
      <Box className='allchats hidetop' transition={".6s"}  height={"calc(100% - 7rem)"}>
         {
          !chats ? 
           <Box  height={"100%"} display="flex" flexDir={"column"} justifyContent="center" alignItems={"center"}>
              <Image marginBottom={"4rem"} opacity=".3" width={{base:"6rem",md:"10rem"}} src="https://cdn-icons-png.flaticon.com/512/3073/3073428.png"></Image>
              <Text fontWeight={"medium"} >Haven't Created your first Chat Yet?</Text>
              <Text>No Problem!</Text>
              <br/>
              <Text textAlign={"center"} fontWeight={"hairline"} >Let's go ahead and Search Users to Start your First Chat with them</Text>
           </Box> : ""
         }
      </Box>
    </Box>
  )
}

export default ChatsBox
