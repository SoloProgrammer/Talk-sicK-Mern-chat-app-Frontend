import { Avatar, Box, Image, Text, Tooltip } from '@chakra-ui/react'
import React from 'react'
import { getSender } from '../../configs/userConfigs'
import { ChatState } from '../../Context/ChatProvider'

function ProfileDrawer({ width, align = "right" }) {
    const { selectedChat, user, profile, setProfile } = ChatState()

    return (
        <Box
            className={`profileDrawer ${align === "right" ? "right0 translateXFull" : "left0 translateXFull-"}`}
            marginLeft={{ base: ".2rem", md: "0px" }}
            width={{ base: "full", md: width }}
            height={"100%"}
            pos={"absolute"}
            transition="all .3s"
            zIndex={user._id === profile._id && "10"}
            background="white">
            <Box className='DrawerInner' display={"flex"} flexDir="column" gap={".5rem"} alignItems="center" width={"full"} height="full" marginTop={".8rem"} pos="relative">

                <Box onClick={() => setProfile(null)} cursor={"pointer"} pos={"absolute"} left=".8rem" top={".3rem"}>
                    <Tooltip label="Close" placement='bottom'>
                        <Image width="2rem" src="https://cdn-icons-png.flaticon.com/512/2763/2763138.png" />
                    </Tooltip>
                </Box>

                {
                    (user._id === profile._id || selectedChat?.isGroupchat) &&
                    <Box pos={"absolute"} right='1rem' cursor={"pointer"}>
                        <Tooltip label="Edit" placement='bottom'>
                            <Image width={"2rem"} src='https://cdn-icons-png.flaticon.com/512/1160/1160758.png' />
                        </Tooltip>
                    </Box>
                }

                <Avatar src={profile.avatar} width="11rem" height={"11rem"} />
                <Text fontSize={"2xl"} color="gray.500" fontWeight="semibold" pos={"relative"} width="full" className='flex'>
                    {(selectedChat && user._id !== profile._id) ? getSender(selectedChat, user).name : profile.name}
                </Text>

                {
                    (user._id === profile._id || (!(selectedChat?.isGroupchat) || !selectedChat)) &&
                    <Text className='flex' gap={"1rem"} marginTop=".3rem" pos={"relative"} width="full">
                        <Tooltip label="About" placement='top'>
                            <Image width={"1.5rem"} opacity=".9" src='https://cdn-icons-png.flaticon.com/512/6583/6583141.png' />
                        </Tooltip>
                        <i>{profile.about}</i>
                    </Text>
                }

            </Box>
        </Box>
    )
}

export default ProfileDrawer
