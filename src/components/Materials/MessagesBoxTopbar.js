import { Avatar, Box, Text } from '@chakra-ui/react'
import React from 'react'
import { getSender } from '../../configs/userConfigs';
import { ChatState } from '../../Context/ChatProvider'

function MessagesBoxTopbar() {

    const { selectedChat, user } = ChatState();

    return (
        <Box zIndex={10}
            pos={"relative"}
            height={"5rem"}
            maxWidth="100%"
            background={"#27aea4"}
            marginLeft=".1rem"
            boxShadow="0 0 3px rgba(0,0,0,.5)"
            display={"flex"}
            justifyContent="space-between"
            alignItems={"center"}
            padding="0 .9rem">

            <Box display={"flex"} color="white" gap="1rem" className='msgleftTop' alignItems={"center"}>
                <Avatar boxShadow={"0 0 0 2px #fff"} src={getSender(selectedChat, user)?.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png"} />
                <Text fontSize={{ base: "1.3rem", md: "1.5rem" }} fontWeight="normal">
                    {
                        getSender(selectedChat, user)?.name
                    }
                </Text>

            </Box>
            <Box className='msgrightTop'>

            </Box>
        </Box>
    )
}

export default MessagesBoxTopbar
