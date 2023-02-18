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

    let { user, handlePinOrUnpinChat, chats, setChats, showToast, setSelectedChat } = ChatState();

    const navigate = useNavigate()

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

    const [isClosable,setIsClosable] = useState(true)

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

            const res = await fetch(`${server.URL.local}/api/chat/deletechat`, config);

            if (res.status === 401) HandleLogout();

            const json = await res.json();

            setLoading(false);
            setIsClosable(true);
            onClose();

            if (!json.status) return showToast("Error", json.message, "error", 3000);

            setChats(chats.filter(c => c._id !== chat._id));

            navigate('/chats');

            showToast(json.message, '', "success", 3000)
        } catch (error) {
            showToast("Error", error.message, "error", 3000)
            setLoading(false)
            onClose();
        }
    }

    const handleLeaveChat = async () => {
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

            let res = await fetch(`${server.URL.local}/api/chat/groupremove`, config);

            if (res.status === 401) HandleLogout();

            let json = await res.json();

            setLoading(false);
            setIsClosable(true);
            onClose();
            if (!json.status) return showToast("Error", json.message, "error", 3000);

            setChats(chats.filter(c => c._id !== chat._id));

            showToast("Success", `You left ${chat.chatName}`, "success", 3000)
            
            setSelectedChat(null)

            navigate('/chats');
            
        } catch (error) {

        }
    }

    return (
        <>
            <Box id={`chatMenuIcon${i}`} className='chatMenuIcon arrowIcon' pos={"absolute"} right="6px" bottom={"4px"} cursor="pointer" onClick={(e) => handleChatMenuIconClick(e, i)}>
                <Image width={"1rem"} src='https://cdn-icons-png.flaticon.com/512/137/137519.png' />
                <Box pos={"relative"}>
                    <Box id={`chatmenu${i}`} className='chat_menu flex' flexDir={"column"}>

                        <ConfirmBoxModal isClosable={isClosable} handleFunc={chat.isGroupchat ? handleLeaveChat : handleDeleteChat} isOpen={isOpen} onClose={onClose} modalDetail={{ chat: chat, index: i }} loading={loading}>
                            <span
                                onClick={onOpen}
                                className='flex'>
                                {!chat.isGroupchat ? "Delete Chat" : "Leave group"}
                                <Image width="1.1rem" src={`${chat.isGroupchat ? "https://cdn-icons-png.flaticon.com/512/8914/8914318.png" : "https://cdn-icons-png.flaticon.com/512/5165/5165608.png"}`} />
                            </span>
                        </ConfirmBoxModal>

                        <span className='flex' onClick={(e) => {
                            handlePinOrUnpinChat(chat);
                            e.stopPropagation();
                        }}>
                            {chat.pinnedBy?.includes(user?._id) ? "Unpin Chat" : "Pin Chat"}
                            <Image width="1.1rem" src={`${chat.pinnedBy?.includes(user?._id) ? "https://cdn-icons-png.flaticon.com/512/1274/1274749.png" : "https://cdn-icons-png.flaticon.com/512/1274/1274786.png"}`} />
                        </span>

                        <span className='flex'>
                            Archive Chat
                            <Image width="1.1rem" src='https://cdn-icons-png.flaticon.com/512/8138/8138776.png' />
                        </span>
                    </Box>
                </Box>
            </Box>

        </>
    )
}

export default ChatMenuBox
