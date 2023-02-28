import { Box, Image, useDisclosure } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider'
import ConfirmBoxModal from './ConfirmBoxModal';

function ChatMenuBox({ chat, i }) {

    let { handleLeaveGrp, handleDeleteChat, user, handlePinOrUnpinChat, hanldeArchiveChatAction, archivedChats } = ChatState();

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

    return (
        <>
            <Box id={`chatMenuIcon${i}`} className='chatMenuIcon arrowIcon' pos={"absolute"} right="6px" bottom={"4px"} cursor="pointer" onClick={(e) => handleChatMenuIconClick(e, i)}>
                <Image width={"1rem"} src='https://cdn-icons-png.flaticon.com/512/137/137519.png' />
                <Box pos={"relative"}>
                    <Box id={`chatmenu${i}`} className='chat_menu flex' flexDir={"column"} width="9.7rem">

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
