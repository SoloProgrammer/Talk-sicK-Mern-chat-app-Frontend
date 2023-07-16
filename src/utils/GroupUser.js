import React, { useState } from 'react'
import { Avatar, AvatarBadge, Box, Image, Spinner, Text, Tooltip, useDisclosure } from '@chakra-ui/react'
import { ChatState } from '../Context/ChatProvider'
import { HandleLogout, isUserOnline } from '../configs/userConfigs'
import { defaultPic } from '../configs/ImageConfigs'
import { server } from '../configs/serverURl'
import { useNavigate } from 'react-router-dom'
import ConfirmBoxModal from '../components/Materials/Modals/ConfirmBoxModal'


function GroupUser({ u }) {

    const { getPinnedChats, getUnPinnedChats, user, selectedChat, setIsClosable, showToast, setSelectedChat, archivedChats, setArchivedChats, setViewArchivedChats, setChats, setProfile, chats, CreateChat, sendInfoMsg } = ChatState()

    const [addAdminLoading, setAddAdminLoading] = useState(false)
    const [removeAdminLoading, setRemoveAdminLoading] = useState(false)
    const [removeUserLoading, setRemoveUserLoading] = useState(false)

    const navigate = useNavigate()
    const handleFunc = async (userId, action) => {

        if (action === "removegroupAdmin") {
            if (selectedChat?.groupAdmin.length === 1) {
                return showToast("Error", "Plz First Add Some One as GroupAdmin in your Replacement", "error", 3000)
            }
        }

        action === "addgroupAdmin" ? setAddAdminLoading(true) : setRemoveAdminLoading(true);

        if (!userId) return showToast("Error", "UserId not there", "Error", 3000)
        try {
            let config = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ userId, chatId: selectedChat?._id })
            }

            let res = await fetch(`${server.URL.production}/api/chat/${action}`, config)

            if (res.status === 401) HandleLogout()

            let json = await res.json();

            if (!json.status) return showToast("Erorr", json.message, "error", 3000)

            if (json.chat && json.chats) {
                setSelectedChat(json.chat)

                setChats([...getPinnedChats(json.chats, user), ...getUnPinnedChats(json.chats, user)]);
                setArchivedChats(json.chats.filter(c => c.archivedBy.includes(user?._id)))

                if (action === "removegroupAdmin") {
                    if (!(json.chat?.groupAdmin.map(u => u._id).includes(user?._id))) {
                        return showToast("Success", "You are removed from the groupAdmin", "success", 3000)
                    }
                }
                showToast("Success", json.message, "success", 3000)
            }
            action === "addgroupAdmin" ? setAddAdminLoading(false) : setRemoveAdminLoading(false)
        } catch (error) {
            showToast("Error", error.message, "error", 3000)
        }
    }

    const handleRemoveFromGroup = async (userId) => {

        setRemoveUserLoading(true)
        setIsClosable(false)

        try {
            let config = {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ chatId: selectedChat?._id, userId })
            }

            let res = await fetch(`${server.URL.production}/api/chat/groupremove`, config);

            if (res.status === 401) HandleLogout();

            let json = await res.json();

            setRemoveUserLoading(false)
            setIsClosable(true)

            if (!json.status) return showToast("Error", json.message, "error", 3000)

            sendInfoMsg("info", { message: `${user?.name.split(' ')[0]} removed ${selectedChat?.users.filter(u => u._id === userId)[0].name.split(' ')[0]}` })

            setSelectedChat(json.chat);

            setChats([...getPinnedChats(json.chats, user), ...getUnPinnedChats(json.chats, user)]);
            setArchivedChats(archivedChats.filter(c => c.archivedBy.includes(user?._id)))
            showToast("Success", json.message, "success", 3000)
            onClose()

        } catch (error) {
            setRemoveUserLoading(false)
            onClose()
            setIsClosable(true)
            return showToast("Error", error.message, "error", 3000)
        }
    }

    const handleGroupUserAvatarClick = (U) => {

        // if user click on his own avatar then display his profile other then else start a chat with that user avatar click!
        if (!(selectedChat?.isGroupchat) || U._id === user?._id) {
            setProfile(U)
            if (window.innerWidth < 770 && U._id === user._id) setSelectedChat(null)
        }
        else {
            setSelectedChat(null)
            let isChat = false

            // this logic is used for checking if the chat is present in the archived chats of user with the user on which he clicks 
            archivedChats.forEach((c, i) => {
                if (c.users.map(u => u._id).includes(user?._id) && c.users.map(u => u._id).includes(U._id)) {
                    navigate(`/chats/chat/${c._id}`);
                    setProfile(null);
                    setViewArchivedChats(true)
                    isChat = true
                }
            })

            // if not then check in the mychats array of users
            if (!isChat) {
                chats.forEach((c, i) => {
                    if (c.users.map(u => u._id).includes(user?._id) && c.users.map(u => u._id).includes(U._id) && !c.isGroupchat) {
                        navigate(`/chats/chat/${c._id}`);
                        setProfile(null);
                        isChat = true
                    }
                    else {
                        if (i === (chats.length - 1) && !isChat) {

                            // this condition is for showing chatsloading to the user when he tries to start a new chat with a group user!
                            if (window.innerWidth < 770) setSelectedChat(null)
                            CreateChat(U._id, U.name)
                        }
                    }
                })
            }

        }
    }

    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Box
            margin={".4rem 0"}
            display={"flex"}
            gap="1rem"
            padding={".3rem .3rem"}
            bg={"#EDF2F7"}
            pos="relative"
            className='GroupUser'
            borderRadius=".3rem"
            _hover={{ bg: "#a3bad0", color: "white" }}
            width="99%"
            alignItems="center">

            <Tooltip hasArrow label={user?._id === u._id ? "My Profile" : "Start a chat"} placement='left'>
                <Avatar onClick={() => handleGroupUserAvatarClick(u._id === user?._id ? user : u)} cursor={"pointer"} _hover={{ boxShadow: "0 0 0 2px white" }} src={u._id === user?._id ? user?.avatar : u.avatar || defaultPic} size="sm">
                    <Tooltip fontSize={".65rem"} label={isUserOnline(u) ? "online" : "offline"} placement="bottom-start">
                        <AvatarBadge
                            borderWidth="1.8px"
                            borderColor='#ffffff'
                            bg={isUserOnline(u) ? '#00c200' : "darkgrey"}
                            boxSize='.9em' />
                    </Tooltip>
                </Avatar>
            </Tooltip>

            <Box>
                <Box display={"flex"} gap="1rem" alignItems={"center"}>
                    <b style={{ textTransform: "capitalize" }}>{u?._id === user?._id ? user.name : u?.name}</b>
                    {
                        u?._id !== user?._id && selectedChat.groupAdmin.map(u => u._id).includes(user?._id)
                        &&
                        <ConfirmBoxModal handleFunc={() => handleRemoveFromGroup(u?._id)} isOpen={isOpen} onClose={onClose}
                            modalDetail={{ chat: selectedChat, subtext: `Are you sure you want to remove (${u.name}) from `, btnCopy: "Remove" }} loading={removeUserLoading}>
                            <Tooltip label={"Remove from group"} placement="top">
                                <Image onClick={onOpen} cursor={"pointer"} width="1.35rem" height={"1.35rem"} src="https://cdn-icons-png.flaticon.com/512/9404/9404050.png" />
                            </Tooltip>
                        </ConfirmBoxModal>
                    }
                </Box>
                <Text marginTop={".2rem"} wordBreak={"break-word"} fontSize={"sm"}>Email: {u.email}</Text>
            </Box>

            {
                (selectedChat?.isGroupchat) && selectedChat?.groupAdmin.map(u => u._id).includes(u._id) &&
                <Box height=".1.46rem" className='flex Admin' justifyContent={"space-between"} pos={"absolute"} right=".3rem" top={".3rem"} padding=".2rem .4rem" borderRadius={".2rem"} background="#dae6e6">
                    <Text fontSize={".7rem"} color="#39b7ad" fontWeight={"medium"} userSelect="none">Admin</Text>
                    {
                        (selectedChat?.groupAdmin.map(u => u._id).includes(user?._id)) &&
                        (!removeAdminLoading ?
                            <Tooltip label="Remove as Admin" placement='top'>
                                <Image
                                    cursor={"pointer"}
                                    onClick={() => handleFunc(u._id, "removegroupAdmin")}
                                    width={".8rem"}
                                    marginLeft=".4rem"
                                    borderRadius="full"
                                    src="https://cdn-icons-png.flaticon.com/512/9351/9351415.png" />
                            </Tooltip>
                            :
                            <Spinner color='#3e97bb' size="xs" marginLeft=".45rem" />
                        )
                    }
                </Box>

            }
            {
                (selectedChat?.isGroupchat) && !(selectedChat?.groupAdmin.map(u => u._id).includes(u._id)) &&
                <Box pos={"absolute"} right=".3rem" top={".3rem"} padding=".2rem .4rem">
                    {
                        (selectedChat?.groupAdmin.map(u => u._id).includes(user?._id)) &&
                        (!addAdminLoading ?
                            <Tooltip label="Make as Admin" placement='top'>
                                <Image
                                    cursor={"pointer"}
                                    onClick={() => handleFunc(u._id, "addgroupAdmin")}
                                    width={{ base: "1.3rem", md: "1.5rem" }}
                                    borderRadius="full"
                                    src="https://cdn-icons-png.flaticon.com/512/1301/1301464.png" />
                            </Tooltip>
                            :
                            <Spinner color='#3e97bb' />
                        )
                    }
                </Box>

            }
        </Box>
    )
}

export default GroupUser
