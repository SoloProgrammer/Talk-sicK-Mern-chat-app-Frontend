import { Box, Image } from '@chakra-ui/react'
import React from 'react'

function Loading({size}) {
    return (
        <Box display={"flex"} justifyContent="center" alignItems={"center"}>
            <Image width={size} src='https://miro.medium.com/max/600/1*beQRWt1uWdnQM_nqCwhJnA.gif'></Image>
        </Box>
    )
}

export default Loading
