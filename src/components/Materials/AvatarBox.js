import { Avatar, Box, Spinner, Text } from '@chakra-ui/react'
import React from 'react'
import { defaultPic } from '../../configs/userConfigs'
import { ChatState } from '../../Context/ChatProvider'

function AvatarBox({ m, startaChat, setIsHoverDisable, i, avatarBoxLoading }) {

    const { user } = ChatState()
    return (
        <Box    
            onClick={(e) => e.stopPropagation()}
            minW={"270px"}
            onMouseOver={() => setIsHoverDisable(true)}
            onMouseOut={() => setIsHoverDisable(false)}
            boxShadow={"0 0 0 2px rgba(0,0,0,.1)"}
            id={`avatarBox${i}`}
            className="avatarBox"
            color={"black"}
            textTransform={"none"}
            padding={".5rem .76rem 0 .6rem"}
            borderRadius=".3rem"
            display={"none"}
            pos="absolute"
            background={"white"}
            top="-2rem"
            left={"2.3rem"}
            zIndex="1"
            minHeight={"80px"}
            cursor={"auto"}
            gap={"1rem"}>

            {
                avatarBoxLoading
                    ?
                    <Spinner pos={"absolute"} top={"30%"} left="44%" color="gray" size="lg"/>
                    :
                    <>
                        <Avatar src={m.sender.avatar || defaultPic} size="lg" />
                        <Box width={"100%"}>
                            <Box display="flex" flexDir={"column"} alignItems="start">
                                <Text fontSize={".9rem"}>
                                    {m.sender.name}
                                </Text>
                                <Text fontSize={".8rem"} color="dodgerblue">
                                    {m.sender.email}
                                </Text>
                            </Box>
                            <Box display={"flex"} margin="1.5rem 0 .5rem 0" justifyContent={"end"}>
                                <Text boxShadow={{base:"2px 2px 3px rgba(0,0,0,.2)",md:"none"}} transition={".3s"} background={"rgb(241,243,244)"} marginBottom=".2rem" padding=".2rem 1rem" fontSize={".94rem"} _hover={{ boxShadow: "2px 2px 3px rgba(0,0,0,.2)" }}
                                    cursor="pointer"
                                    onClick={() => startaChat(m.sender._id === user?._id ? user : m.sender)}
                                    borderRadius=".2rem"
                                >
                                    Start a chat
                                </Text>
                            </Box>
                        </Box>
                    </>
            }
        </Box>
    )
}

export default AvatarBox
