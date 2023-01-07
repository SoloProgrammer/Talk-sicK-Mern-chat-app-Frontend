import { Box } from '@chakra-ui/react'
import React from 'react'
import ChatsTopBar from './Materials/ChatsTopBar'

function ChatsBox() {
  return (
    <Box className='chatsBox' width={{ base: "100%", md: "36%" }} boxShadow="0 0 0 2px rgba(0,0,0,.3)">
      <ChatsTopBar/>
      <Box className='allchats'>

      </Box>
    </Box>
  )
}

export default ChatsBox
