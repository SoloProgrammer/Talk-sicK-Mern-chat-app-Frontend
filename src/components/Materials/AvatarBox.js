import { Avatar, AvatarBadge, Box, Spinner, Text, Tooltip } from '@chakra-ui/react'
import React from 'react'
import { defaultPic } from '../../configs/ImageConfigs'
import { ChatState } from '../../Context/ChatProvider'
import { isUserOnline } from '../../configs/userConfigs'

function AvatarBox({ m, startaChat, setIsHoverDisable, i, avatarBoxLoading }) {

    const { user } = ChatState()
    return (
        <Box
            onClick={(e) => e.stopPropagation()}
            minW={"300px"}
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
            minHeight={"82px"}
            cursor={"auto"}
            maxWidth={{ base: "300px", md: "400px" }}
            w="max-content"
            gap={"1rem"}>

            {
                avatarBoxLoading
                    ?
                    <Spinner pos={"absolute"} top={"30%"} left="44%" color="gray" size="lg" />
                    :
                    <>
                        <Avatar src={m.sender.avatar || defaultPic} size="lg">
                            <Tooltip fontSize={".65rem"} label={isUserOnline(m.sender) ? "online" : "offline"} placement="bottom-start">
                                <AvatarBadge
                                    borderWidth="1.8px"
                                    borderColor='#ffffff'
                                    bg={isUserOnline(m.sender) ? '#00c200' : "darkgrey"}
                                    right={"3.5px"}
                                    bottom={"3.5px"}
                                    boxSize='.6em' />
                            </Tooltip>
                        </Avatar>
                        <Box width={"100%"}>
                            <Box display="flex" flexDir={"column"} alignItems="start">
                                <Text fontSize={"1.1rem"}>
                                    {m.sender.name}
                                </Text>
                                <Box cursor={"pointer"} _hover={{ textDecor: "underline" }} fontSize={".9rem"} color="dodgerblue">
                                    <Text wordBreak={"break-word"} textAlign="left">
                                        <a href={`mailto:${m.sender.email}`}>
                                            {m.sender.email}
                                        </a>
                                        <i className="fa-regular fa-envelope ml-3 black-200"></i>
                                    </Text>
                                </Box>
                            </Box>
                            <Box display={"flex"} margin="1.5rem 0 .5rem 0" justifyContent={"end"}>
                                <Text boxShadow={{ base: "0px 1px 2px rgba(0,0,0,.3)", md: "none" }} transition={".3s ease-in-out"} background={"rgb(241,243,244)"} marginBottom=".2rem" padding=".3rem 1rem" fontSize={".94rem"} _hover={{ boxShadow: "0px 2px 3px rgba(0,0,0,.2)" }}
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
