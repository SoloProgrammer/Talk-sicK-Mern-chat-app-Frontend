import { Box, Image } from '@chakra-ui/react'
import React from 'react'
import { server } from '../../configs/serverURl';
import { HandleLogout } from '../../configs/userConfigs';
import { ChatState } from '../../Context/ChatProvider'

function ChatMenuBox({ chat, i }) {

    let { user, showToast, chats, setChats } = ChatState();

    const handleChatMenuIconClick = (e, i) => {
        e.stopPropagation();

        let elms = document.querySelectorAll('.chat_menu');
        let elm = document.getElementById(`chatmenu${i}`);

        elms.forEach(item => {
            item.classList.remove('menu_open')
        })

        elm.classList.add('menu_open')
    }

    const handlePinOrUnpinChat = async () => {
        setTimeout(() => {
            document.body.click()
        },250);
        let updatedChats = chats.map(c => {
            if (c._id === chat._id) {
                if (!c.pinnedBy.includes(user?._id)) {
                    c.pinnedBy.push(user._id)
                }
                else {
                    c.pinnedBy =  c.pinnedBy.filter(UId => UId !== user._id)
                }
            }
            return c;
        });

        setChats(updatedChats)
        try {
            let config = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ chatId: chat._id })
            }

            let res = await fetch(`${server.URL.production}/api/chat/pinORunpinchat`, config);

            if (res.status === "401") HandleLogout()

            let json = await res.json();

            if (!json.status) return showToast("Error", json.message, "error", 3000);

        } catch (error) {

        }
    }

    return (
        <>
            <Box id={`chatMenuIcon${i}`} className='chatMenuIcon arrowIcon' pos={"absolute"} right="6px" bottom={"4px"} cursor="pointer" onClick={(e) => handleChatMenuIconClick(e, i)}>
                <Image width={"1rem"} src='https://cdn-icons-png.flaticon.com/512/137/137519.png' />
                <Box pos={"relative"}>
                    <Box id={`chatmenu${i}`} className='chat_menu flex' flexDir={"column"}>
                        <span className='flex'>
                            {!chat.isGroupchat ? "Delete Chat" : "Leave group"}
                            <Image width="1.1rem" src={`${chat.isGroupchat ? "https://cdn-icons-png.flaticon.com/512/8914/8914318.png" : "https://cdn-icons-png.flaticon.com/512/5165/5165608.png"}`} />
                        </span>
                        <span className='flex' onClick={(e) => {
                            handlePinOrUnpinChat();
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
