import { Box, Text } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { ChatState } from '../Context/ChatProvider'
import ProfileDrawer from './Materials/ProfileDrawer'
// import ScrollableFeed from 'react-scrollable-feed'

function MessageBox() {

  const { profile, user } = ChatState()

  const messages = new Array(5).fill(1)

  useEffect(() => {
    setTimeout(() => {
      document.querySelector('.profileDrawer')?.classList.remove('translateXFull')
    }, 0);
  }, [profile])


  return (
    <Box marginLeft={{ base: "0rem", md: ".2rem" }} className='MessagesBox' display={"flex"} flexDir="column" justifyContent={"flex-end"} gap={".3rem"} overflowX="hidden">
      {
        profile && profile._id !== user._id &&
        <ProfileDrawer width="50%" />
      }
      <Box display={"flex"} flexDir="column" gap=".4rem" overflowY={"auto"} width="100vh">
          {
            messages.map((m, i) => {
              return <Text pos="relative" width={"fit-content"} background={"white"} color="black" padding={".3rem"} borderRadius=".2rem">
                hii how are you?❤️
              </Text>
            })
          }
        {/* <ScrollableFeed>
        </ScrollableFeed> */}
      </Box>
    </Box>
  )
}

export default MessageBox
