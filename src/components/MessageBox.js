import { Box } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { ChatState } from '../Context/ChatProvider'
import ProfileDrawer from './Materials/ProfileDrawer'

function MessageBox() {

  const { profile, user } = ChatState()

  // const messages = new Array(50).fill(1)

  useEffect(() => {
    setTimeout(() => {
      document.querySelector('.profileDrawer')?.classList.remove('translateXFull')
    }, 0);
  }, [profile])


  return (
    <Box marginLeft={{ base: "0rem", md: ".2rem" }} className='MessagesBox' display={"flex"} flexDir="column" gap={".3rem"} overflowX="hidden">
      {
        profile && profile._id !== user._id &&
        <ProfileDrawer width="50%"/>
      }
      {/* {
          messages.map((m,i) =>{
            return  <Text pos="relative" background={"white"} color="black" padding={".3rem"} borderRadius=".2rem">
              hii how are you?❤️
            </Text>
          })
        } */}
    </Box>
  )
}

export default MessageBox
