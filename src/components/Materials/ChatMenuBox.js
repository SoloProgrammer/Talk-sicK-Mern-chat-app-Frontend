import { Box, Image, useDisclosure } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import { server } from '../../configs/serverURl';
import { HandleLogout } from '../../configs/userConfigs';
import { ChatState } from '../../Context/ChatProvider'
import ConfirmBoxModal from './Modals/ConfirmBoxModal';
import { archiveImg, downArrowCyan, unArchiveImg, leaveGrpImg, trashCanIcon, pinFilledIcon, pinOutlineIcon, bellIcon, bellDividedIcon } from '../../configs/ImageConfigs';

function ChatMenuBox({ chat, i }) {

    let { getPinnedChats, getUnPinnedChats, handleLeaveGrp, handleDeleteChat, user, setChats, showToast, handlePinOrUnpinChat, hanldeArchiveChatAction, archivedChats, chats } = ChatState();

    let elms = document.querySelectorAll('.chat_menu');

    function hideChatMenuBoxs() {
        elms.forEach(item => {
            item.classList.remove('menu_open')
        })
    }

    const handleChatMenuIconClick = (e, i) => {
        e.stopPropagation();

        let elm = document.getElementById(`chatmenu${i}`);

        hideChatMenuBoxs();

        elm.classList.add('menu_open')
    }

    useEffect(() => {
        hideChatMenuBoxs();
        // eslint-disable-next-line
    }, [window.location.href])

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [loading, setLoading] = useState(false);

    const handleNotificationAction = async (chat) => {

        setTimeout(() => {
            document.body.click()
        }, 250);

        let updatedChats = chats.map(c => {
            if (c._id === chat._id) {
                if (!(c.mutedNotificationBy.includes(user?._id))) {
                    c.mutedNotificationBy.push(user?._id)
                    showToast("Notification muted", "", "info", 2000)
                }
                else {
                    c.mutedNotificationBy = c.mutedNotificationBy.filter(uId => uId !== user?._id)
                    showToast("Notification Unmuted", "", "info", 2000)
                }
            }
            return c
        });

        setChats([...getPinnedChats(updatedChats, user), ...getUnPinnedChats(updatedChats, user)]);

        try {
            let config = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ chatId: chat._id })
            }

            let res = await fetch(`${server.URL.production}/api/chat/muteOrUnmuteNotification`, config);

            if (res.status === "401") HandleLogout()

            let json = await res.json();

            if (!json.status) return showToast("Error", json.message, "error", 3000);

        } catch (error) {
            setTimeout(() => {
                window.location.reload(0)
            }, 2000);
            return showToast("Error", error.message, "error", 3000)
        }
    }

    return (
        <>
            <Box id={`chatMenuIcon${i}`} className='chatMenuIcon arrowIcon' pos={"absolute"} right="6px" bottom={"4px"} cursor="pointer" onClick={(e) => handleChatMenuIconClick(e, i)}>
                <Image width={"1rem"} src={downArrowCyan} />
                <Box pos={"relative"}>
                    <Box id={`chatmenu${i}`} className='chat_menu flex' flexDir={"column"} width={"10.8rem"}>

                        <ConfirmBoxModal
                            handleFunc={() => chat.isGroupchat ? handleLeaveGrp(chat, onClose, setLoading) : handleDeleteChat(chat, onClose, setLoading)}
                            isOpen={isOpen}
                            onClose={onClose}
                            modalDetail={
                                {
                                    chat: chat,
                                    subtext: !chat.isGroupchat ? "Are you Sure You want to Delete Chat with" : "Are you Sure You want to Leave",
                                    btnCopy: !chat.isGroupchat ? "Delete" : "Leave"
                                }
                            }
                            loading={loading}>
                            <span
                                onClick={onOpen}
                                className='flex'>
                                {!chat.isGroupchat ? "Delete Chat" : "Leave group"}
                                <Image width="1.1rem" src={`${chat.isGroupchat ? leaveGrpImg : trashCanIcon}`} />
                            </span>
                        </ConfirmBoxModal>

                        {!archivedChats.map(c => c._id).includes(chat._id) && <span className='flex' onClick={(e) => {
                            handlePinOrUnpinChat(chat);
                            e.stopPropagation();
                        }}>
                            {chat.pinnedBy?.includes(user?._id) ? "Unpin Chat" : "Pin Chat"}
                            <Image width="1.1rem" src={`${chat.pinnedBy?.includes(user?._id) ? pinFilledIcon : pinOutlineIcon}`} />
                        </span>}

                        <span className='flex' onClick={(e) => {
                            hanldeArchiveChatAction(chat);
                            e.stopPropagation();
                        }} >
                            {archivedChats.map(c => c._id).includes(chat._id) ? "Unarchive Chat" : "Archive Chat"}

                            {archivedChats.map(c => c._id).includes(chat._id)
                                ?
                                <Image src={unArchiveImg} width="1rem" />
                                :
                                <Image width="1.1rem" src={archiveImg} />}
                        </span>

                        {!archivedChats.map(c => c._id).includes(chat._id)
                            &&
                            <span onClick={() => handleNotificationAction(chat)} className='flex'>
                                {chat.mutedNotificationBy?.includes(user?._id) ? 'Unmute notification' : "Mute notification"}
                                <Image width={`${chat.mutedNotificationBy?.includes(user?._id) ? "1.16rem" : "1.08rem"}`} src={`${chat.mutedNotificationBy?.includes(user?._id) ? bellDividedIcon : bellIcon} `} />
                            </span>}
                    </Box>
                </Box>
            </Box>

        </>
    )
}

export default ChatMenuBox
