import { Box, Image, useDisclosure } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { server } from '../../configs/serverURl';
import { HandleLogout } from '../../configs/userConfigs';
// import { server } from '../../configs/serverURl';
// import { HandleLogout } from '../../configs/userConfigs';
import { ChatState } from '../../Context/ChatProvider'
import ConfirmBoxModal from './ConfirmBoxModal';

function ChatMenuBox({ chat, i }) {

    let { user, handlePinOrUnpinChat, hanldeArchiveChatAction, setArchivedChats, archivedChats, chats, setChats, showToast, notifications, setNotifications } = ChatState();

    const navigate = useNavigate();

    const handleChatMenuIconClick = (e, i) => {
        e.stopPropagation();

        let elms = document.querySelectorAll('.chat_menu');
        let elm = document.getElementById(`chatmenu${i}`);

        elms.forEach(item => {
            item.classList.remove('menu_open')
        })

        elm.classList.add('menu_open')
    }

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [loading, setLoading] = useState(false);

    const [isClosable, setIsClosable] = useState(true)

    const handleDeleteChat = async () => {
        try {
            setLoading(true)
            setIsClosable(false)
            let config = {
                method: "PUT",
                headers: {
                    token: localStorage.getItem('token'),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ chatId: chat?._id })
            }

            const res = await fetch(`${server.URL.production}/api/chat/deletechat`, config);

            if (res.status === 401) HandleLogout();

            const json = await res.json();

            setLoading(false);
            setIsClosable(true);
            onClose();

            if (!json.status) return showToast("Error", json.message, "error", 3000);

            setArchivedChats(archivedChats.filter(c => c._id !== chat._id));
            setChats(chats.filter(c => c._id !== chat._id));

            // if user try to delete the chat before reading the new message from that chat than deleting the notification of that chat parallelly..!!
            setNotifications(notifications.filter(noti => noti.chat._id !== chat._id))

            showToast(json.message, '', "success", 3000)

            if (!(archivedChats.map(c => c._id).includes(chat._id)) || archivedChats.filter(c => c._id !== chat._id).length < 1) navigate('/chats');
            else navigate('/chats/archived')

        } catch (error) {
            showToast("Error", error.message, "error", 3000)
            setLoading(false)
            onClose();
        }
    }

    const handleLeaveChat = async () => {
        if (chat?.groupAdmin.map(u => u._id).includes(user._id) && chat?.groupAdmin.length === 1) {
            onClose()
            return showToast("Error", "Plz first add some one as GroupAdmin if you wish to leave this group.!", "error", 3000)
        }

        try {
            setLoading(true)
            setIsClosable(false)
            let config = {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ chatId: chat?._id, userId: user?._id })
            }

            let res = await fetch(`${server.URL.production}/api/chat/groupremove`, config);

            if (res.status === 401) HandleLogout();

            let json = await res.json();

            setLoading(false);
            setIsClosable(true);
            onClose();
            if (!json.status) return showToast("Error", json.message, "error", 3000);

            setArchivedChats(archivedChats.filter(c => c._id !== chat._id))
            setChats(chats.filter(c => c._id !== chat._id));

            // if user try to delete the chat before reading the new message from that chat than deleting the notification of that chat parallelly..!!
            setNotifications(notifications.filter(noti => noti.chat._id !== chat._id))

            showToast("Success", `You left ${chat.chatName}`, "success", 3000)

            if (!(archivedChats.map(c => c._id).includes(chat._id)) || archivedChats.filter(c => c._id !== chat._id).length < 1) navigate('/chats');
            else navigate('/chats/archived')

        } catch (error) {
            showToast("Error", error.message, "error", 3000)
            setLoading(false)
            onClose();
        }
    }

    return (
        <>
            <Box id={`chatMenuIcon${i}`} className='chatMenuIcon arrowIcon' pos={"absolute"} right="6px" bottom={"4px"} cursor="pointer" onClick={(e) => handleChatMenuIconClick(e, i)}>
                <Image width={"1rem"} src='https://cdn-icons-png.flaticon.com/512/137/137519.png' />
                <Box pos={"relative"}>
                    <Box id={`chatmenu${i}`} className='chat_menu flex' flexDir={"column"} width="9.7rem">

                        <ConfirmBoxModal isClosable={isClosable} handleFunc={chat.isGroupchat ? handleLeaveChat : handleDeleteChat} isOpen={isOpen} onClose={onClose} modalDetail={{ chat: chat, index: i }} loading={loading}>
                            <span
                                onClick={onOpen}
                                className='flex'>
                                {!chat.isGroupchat ? "Delete Chat" : "Leave group"}
                                <Image width="1.1rem" src={`${chat.isGroupchat ? "https://cdn-icons-png.flaticon.com/512/8914/8914318.png" : "https://cdn-icons-png.flaticon.com/512/5165/5165608.png"}`} />
                            </span>
                        </ConfirmBoxModal>

                        {!archivedChats.map(c => c._id).includes(chat._id) && <span className='flex' onClick={(e) => {
                            handlePinOrUnpinChat(chat);
                            e.stopPropagation();
                        }}>
                            {chat.pinnedBy?.includes(user?._id) ? "Unpin Chat" : "Pin Chat"}
                            <Image width="1.1rem" src={`${chat.pinnedBy?.includes(user?._id) ? "https://cdn-icons-png.flaticon.com/512/1274/1274749.png" : "https://cdn-icons-png.flaticon.com/512/1274/1274786.png"}`} />
                        </span>}

                        <span className='flex' onClick={(e) => {
                            hanldeArchiveChatAction(chat);
                            e.stopPropagation();
                        }} >
                            {archivedChats.map(c => c._id).includes(chat._id) ? "Unarchive Chat" : "Archive Chat"}

                            {archivedChats.map(c => c._id).includes(chat._id)
                                ?
                                <Image src='https://cdn-icons-png.flaticon.com/512/5774/5774826.png' width="1rem" />
                                :
                                <Image width="1.1rem" src='https://cdn-icons-png.flaticon.com/512/8138/8138776.png' />}
                        </span>

                        {!archivedChats.map(c => c._id).includes(chat._id) && <span className='flex'>
                            Mute notification
                            <Image width="1.1rem" src='https://cdn-icons-png.flaticon.com/512/7233/7233618.png' />
                        </span>}
                    </Box>
                </Box>
            </Box>

        </>
    )
}

export default ChatMenuBox
