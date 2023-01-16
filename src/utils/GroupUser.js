import React, { useState } from 'react'
import { Avatar, Box, Image, Spinner, Text, Tooltip } from '@chakra-ui/react'
import { ChatState } from '../Context/ChatProvider'
import { HandleLogout } from '../configs/userConfigs'
import { server } from '../configs/serverURl'


function GroupUser({ u }) {

    const { user, selectedChat, showToast, setSelectedChat, setChats, setProfile, setIsfetchChats, chats, CreateChat } = ChatState()

    const [addAdminLoading, setAddAdminLoading] = useState(false)
    const [removeAdminLoading, setRemoveAdminLoading] = useState(false)
    const [removeUserLoading, setRemoveUserLoading] = useState(false)

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
                setChats(json.chats)
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

            if (!json.status) return showToast("Error", json.message, "error", 3000)

            if (!json.chats.map(c => c._id).includes(selectedChat._id)) {
                setSelectedChat(null)
                setProfile(null)
            }
            else setSelectedChat(json.chat)

            setIsfetchChats(true)

            showToast("Success", json.message, "success", 3000)
        } catch (error) {
            return showToast("Error", error.message, "error", 3000)
        }
    }

    const handleStartChat = (U) => {
        if (!(selectedChat?.isGroupchat) || U._id === user?._id) {
            setProfile(U)
            if (window.innerWidth < 770) setSelectedChat(null)
        }

        let isChat = false
        if (U._id !== user?._id) {
            chats.map((c, i) => {
                if (c.users.map(u => u._id).includes(user?._id) && c.users.map(u => u._id).includes(U._id) && !c.isGroupchat) {
                    setSelectedChat(c);
                    setProfile(null)
                    isChat = true
                }
                else {
                    if (i === (chats.length - 1) && !isChat) {

                        // this condition is for showing chatsloading to the user when he tries to start a new chat with a group user!
                        if (window.innerWidth < 770) setSelectedChat(null)
                        CreateChat(U._id)
                    }
                }
                return 1
            })
        }
    }

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
                <Avatar onClick={() => handleStartChat(u)} cursor={"pointer"} _hover={{ boxShadow: "0 0 0 2px white" }} name={u.name} src={u.avatar} size="sm" />
            </Tooltip>

            <Box>
                <Box display={"flex"} gap="1rem" alignItems={"center"}>
                    <b style={{ textTransform: "capitalize" }}>{u?.name}</b>
                    {
                        ((selectedChat?.groupAdmin.map(u => u._id).includes(user?._id)) || u?._id === user?._id)
                        &&
                        (!removeUserLoading ?
                            <Tooltip label={u?._id === user._id ? "Left group" : "Remove from group"} placement="top">
                                <Image onClick={() => handleRemoveFromGroup(u?._id)} cursor={"pointer"} width="1.35rem" height={"1.35rem"} src="https://cdn-icons-png.flaticon.com/512/9404/9404050.png" />
                            </Tooltip>
                            :
                            <Spinner color='#3e97bb' size="sm" />)
                    }
                </Box>
                <Text marginTop={".2rem"} wordBreak={"break-word"} fontSize={"sm"}>Email: {u.email}</Text>
            </Box>

            {
                (selectedChat?.isGroupchat) && selectedChat?.groupAdmin.map(u => u._id).includes(u._id) &&
                <Box height=".1.46rem" className='flex Admin' justifyContent={"space-between"} pos={"absolute"} right=".3rem" top={".3rem"} padding=".2rem .4rem" borderRadius={".2rem"} background="#48f2e64a">
                    <Text fontSize={".7rem"} color="darkcyan" fontWeight={"medium"}>Admin</Text>
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
