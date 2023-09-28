import { Box, Image } from '@chakra-ui/react'
import React from 'react'
import { ChatState } from '../../Context/ChatProvider'
import { BrandImg } from '../../configs/ImageConfigs';

function Alert() {
  const {alertInfo} = ChatState();
  return (
    <Box pos={"absolute"} bottom={"0rem"} width={"100%"} className='flex' overflow={"hidden"} paddingBottom={"3rem"}>
      <Box opacity={!alertInfo.active && 0} transform={`translateY(${alertInfo.active ? "0" : "20rem"})`} transition={".4s all ease-in-out"} 
      zIndex={30} background={"#ffff"} boxShadow={"0 0 10px rgba(0,0,0,.3)"}
      color={"#40faec"}
      backgroundColor={"#303030"}
      borderRadius={".3rem"}
      gap={".5rem"}
      display={"flex"}
      alignItems={"center"}
      padding={".7rem 1.2rem"}
      maxW={"95%"}
      >
          <Box>
              <Image width="1.2rem" src={BrandImg}/>
          </Box>
          <Box fontSize={".85rem"} letterSpacing={".03rem"}>
            {alertInfo.copy}
          </Box>
      </Box>
    </Box>
  )
}

export default Alert
