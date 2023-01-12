import { Box, Image } from '@chakra-ui/react'
import React from 'react'

function Loading({size,src}) {
    return (
        <Box display={"flex"} justifyContent="center" alignItems={"center"}>
            <Image width={size} src={src}/>
        </Box>
    )
}

export default Loading
