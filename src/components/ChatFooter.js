import { Box, Text } from '@chakra-ui/react'
import React from 'react'

function ChatFooter() {
    return (
        <Box zIndex={10} background={"white"} pos={"absolute"} bottom="0" width="full" height="fit-content" padding={".7rem .6rem"} boxShadow="0 0 3px rgba(0,0,0,.3)">
            <Text margin={0} textAlign={"center"} fontSize={window.innerWidth > 770 ? ".9rem" : ".75rem"} fontWeight={"semibold"}>
                Designed and Developed with ❤️ by Dev Shinde 🚩 {window.innerWidth < 770 ? <br /> : "|"} <span style={{ fontWeight: "lighter" }}>© Copyright 2023</span>
            </Text>
        </Box>
    )
}

export default ChatFooter
