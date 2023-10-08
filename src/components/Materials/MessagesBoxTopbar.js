import { Avatar, Box, Image, Text, Tooltip } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom';
import { getSender, GroupMemberNames, GroupMembers, isUserOnline } from '../../configs/userConfigs';
import { ChatState } from '../../Context/ChatProvider'
import { defaultPic } from '../../configs/ImageConfigs';
import { isMobile } from '../../pages/Chatpage';

function MessagesBoxTopbar() {

    const { selectedChat, user, setSelectedChat, setProfile, isTyping, typingInfo } = ChatState();

    let navigate = useNavigate()
    const handleBack = () => {
        setSelectedChat(null);
        navigate('/chats')
    }

    let sender = useMemo(() => {
        return getSender(selectedChat, user)
        // eslint-disable-next-line
    }, [selectedChat])

    return (
        <>

            <Box
                pos={"relative"}
                height={"5rem"}
                maxWidth="100%"
                background={"#27aea4"}
                marginLeft=".1rem"
                boxShadow="0 0 3px rgba(0,0,0,.9)"
                display={"flex"}
                zIndex="3"
                justifyContent="space-between"
                alignItems={"center"}
                onClick={() => setProfile(sender)}
                cursor={"pointer"}
                padding="0 .9rem">

                <Box display={"flex"} color="white" gap="1.2rem" className='msgleftTop' alignItems={"center"} >
                    <Avatar cursor={"pointer"} onClick={() => setProfile(sender)} boxShadow={"0 0 0 2px #fff"} src={sender?.avatar || defaultPic} />
                    <Box display={"flex"} flexDir={"column"} gap=".1rem">
                        <Box display={"flex"} alignItems={"center"} gap={".7rem"}>
                            <Text fontSize={{ base: "1.3rem", md: "1.4rem" }} fontWeight="normal" onClick={() => setProfile(sender)} cursor={"pointer"}>
                                {
                                    (isMobile() && sender?.name.length > 16) ? sender?.name.slice(0, 15) + "..." : sender?.name
                                }
                            </Text>
                            {selectedChat?.pinnedBy.includes(user?._id)
                                &&
                                <Tooltip label="pinned" placement='top' fontSize={".7rem"}>
                                    <Box background={"white"} padding=".3rem" borderRadius={"50%"} boxShadow="inset 0 0 1.5px rgba(0,0,0,1)" >
                                        <Image width={".7rem"} src="https://cdn-icons-png.flaticon.com/512/1274/1274749.png" />
                                    </Box>
                                </Tooltip>}
                        </Box>

                        <Text bottom=".3rem" fontSize={".77rem"} color="#ffffffe0" letterSpacing=".01rem" left={"5rem"} fontWeight={"400"}>
                            {isTyping
                                &&
                                typingInfo.length > 0
                                &&
                                typingInfo?.map(tyInfo => tyInfo.chatId).includes(selectedChat?._id) // This condition shows the typing indicator only in the chat where actually the typing is typing 
                                &&
                                !typingInfo?.map(tyInfo => tyInfo.user._id).includes(user?._id) // This condition checks if the user who is typing in the chat should not seen the typing indicator for this own typing..
                                ?
                                selectedChat.isGroupchat
                                    ?
                                    (typingInfo.filter(tyInfo => tyInfo.chatId === selectedChat?._id)[0].user.name.split(" ")[0] + " is typing.....")
                                    :
                                    "typing....."
                                :
                                !selectedChat?.isGroupchat
                                    ?
                                    isUserOnline(sender) && "online"
                                    :
                                    GroupMemberNames(selectedChat, user)
                            }
                        </Text>
                    </Box>
                </Box>
                <Box className='msgrightTop'>
                    {
                        !isMobile() && selectedChat?.isGroupchat &&
                        <GroupMembers selectedChat={selectedChat} />
                    }
                    {
                        isMobile() && !(selectedChat?.isGroupchat) &&
                        <Tooltip label="Back" isOpen placement='bottom'>
                            <Box onClick={handleBack} padding={".3rem"} borderRadius=".3rem" background={"white"}>
                                <Image maxWidth="1.5rem" src="https://cdn-icons-png.flaticon.com/512/7792/7792362.png"></Image>
                            </Box>
                        </Tooltip>
                    }
                </Box>
            </Box>
            {
                isMobile() && selectedChat?.isGroupchat &&
                <Box
                    zIndex={1}
                    pos={"relative"}
                    height={"2.5rem"}
                    maxWidth="100%"
                    background={"#27aea4"}
                    boxShadow="0 0 3px rgba(0,0,0,.5)"
                    display={"flex"}
                    justifyContent="space-between"
                    alignItems={"center"}
                    marginLeft=".08rem"
                    padding="0 .2rem"
                >
                    <Box
                        borderRadius={".3rem"}
                        display="flex"
                        justifyContent={"space-between"}
                        width="100%"
                        className='backTochatsBtn'>

                        <Box onClick={handleBack}
                            className='flex'
                            gap={".5rem"}
                            width={"fit-content"}
                            padding={"0 .3rem"}
                            borderRadius=".3rem "
                            background="white">
                            <Image maxWidth="1rem" src="https://cdn-icons-png.flaticon.com/512/7792/7792362.png"></Image>
                            <Text color={"black"} fontWeight="medium">Back</Text>
                        </Box>
                        <Box>
                            <GroupMembers selectedChat={selectedChat} />
                        </Box>
                    </Box>
                </Box>
            }
        </>

    )
}

export default MessagesBoxTopbar
