import { Box, Image, Text, useDisclosure } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import GroupUser from '../utils/GroupUser'
import { ChatState } from '../Context/ChatProvider'
import PopupModal from './Materials/Modals/PopupModal'
import { HandleLogout, getChatUsers, getJoinUserNames, isAdmin } from '../configs/userConfigs'
import { server } from '../configs/serverURl'
import { INFO } from '../configs/messageConfigs'


function GroupMembersBox() {

    const { getPinnedChats, getUnPinnedChats, selectedChat, showToast, user, setChats, setSelectedChat, archivedChats, setArchivedChats, setIsClosable, sendInfoMsg, setProfile } = ChatState()

    const { isOpen, onOpen, onClose } = useDisclosure()

    const [lastInd, setLastInd] = useState(5)

    const [groupUsers, setGroupUsers] = useState(getChatUsers(selectedChat).slice(0, lastInd))

    const hanldeShowMore = () => {
        setGroupUsers(groupUsers.concat(getChatUsers(selectedChat).slice(lastInd, lastInd + 5)))
        setLastInd(lastInd + 5)
    }
    const hanldeShowLess = () => {
        setGroupUsers(groupUsers.slice(0, 5))
        setLastInd(5)
    }

    useEffect(() => {
        setGroupUsers(getChatUsers(selectedChat).slice(0, 5));
        setLastInd(5);

        // in this useEffect we gave selectedChat as the dependency because we are setting lastIndex and the groupusers whenever selected chat updated...!
        // eg selected chat updates when we addusers or removeusers from grp.., Thanks!
        // eslint-disable-next-line
    }, [selectedChat])

    const [loading, setLoading] = useState(false)
    const hanldeAddmember = async (users) => {

        // making array of user Ids...!
        let userNames = getJoinUserNames(users) // joining usernames by comma ,
        users = users.map(u => u._id)

        setLoading(true)
        setIsClosable(false)
        try {
            let config = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ chatId: selectedChat._id, users })
            }
            let res = await fetch(`${server.URL.local}/api/chat/groupadd`, config)

            if (res.status === 401) HandleLogout()

            let json = await res.json();

            setLoading(false)
            setIsClosable(true)
            if (!json.status) return showToast("Error", json.message, "error", 3000)


            showToast("Great!", json.message, "success", 3000)
            setSelectedChat(json.chat)

            setChats([...getPinnedChats(json.chats, user), ...getUnPinnedChats(json.chats, user)]);
            setArchivedChats(archivedChats.filter(c => c.archivedBy.includes(user?._id)));

            const content = { message: `${user?.name.split(' ')[0]} added ${userNames}` }
            sendInfoMsg(INFO, content) // passing msgType and content
            onClose()
            setProfile(null);
        } catch (error) {
            showToast("Error", error.message, "error", 3000)
            setLoading(false)
            setIsClosable(true)
        }
    }

    return (
        <Box width={"100%"} >
            <Box className='flex' justifyContent={"space-between"} marginBottom=".5rem">
                <Text fontSize={{ base: "1.2rem", md: "1.4rem" }} fontWeight="hairline" color="slategrey">Group members</Text>
                {
                    isAdmin(selectedChat, user)
                    &&
                    <PopupModal isOpen={isOpen} onClose={onClose} addMember={true} handleFunc={hanldeAddmember} addmemberLoading={loading}>
                        <Box
                            padding={".2rem .4rem"}
                            onClick={onOpen}
                            background="gray.200"
                            color={"black"}
                            fontWeight="hairline"
                            fontSize={{ base: ".75rem", md: ".85rem" }}
                            width="fit-content"
                            cursor="pointer"
                            className='flex'
                            justifyContent={"space-between"}
                            gap=".3rem"
                            transition={".3s"}
                            _hover={{ bg: "gray.300" }}
                            marginRight=".3rem">

                            <span> Add members </span>
                            <Image width={{ base: ".8rem", md: ".9rem" }} src={"https://cdn-icons-png.flaticon.com/512/9293/9293648.png"} />

                        </Box>
                    </PopupModal>}
            </Box>
            <Box className='GroupUsersBox' maxHeight={'calc(100vh - 28.5rem)'} width="100%" overflowY="auto" >
                {
                    groupUsers.map(u => {
                        return <GroupUser key={u._id} u={u} />
                    })
                }
                {
                    getChatUsers(selectedChat).length > 5 && (
                        (groupUsers.length !== getChatUsers(selectedChat).length || groupUsers.length === 5) ? <Text width={"fit-content"} onClick={hanldeShowMore} cursor={"pointer"} color={"blue.400"} fontSize=".8rem" fontWeight={"medium"}>Show more +</Text>
                            :
                            <Text onClick={hanldeShowLess} width={"fit-content"} cursor={"pointer"} color={"blue.400"} fontSize=".8rem" fontWeight={"medium"}>Show less -</Text>
                    )
                }
            </Box>
        </Box>
    )
}

export default GroupMembersBox
