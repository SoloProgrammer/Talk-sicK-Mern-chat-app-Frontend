import { Box, useDisclosure } from '@chakra-ui/react'
import React, { useState } from 'react'
import './style.css'
import ActionItem from './ActionItem'
import ConfirmBoxModal from '../Materials/Modals/ConfirmBoxModal'
import { ChatState } from '../../Context/ChatProvider'
import { server } from '../../configs/serverURl'
import { HandleLogout } from '../../configs/userConfigs'

const MessageActions = ({ message, user }) => {
    const { selectedChat, setIsClosable, chatMessages, messages, setMessages, setChatMessages, showToast, chats, setChats } = ChatState()

    const initailLoading = {
        btn1: false,
        btn2: false
    }
    const [loading, setLoading] = useState(initailLoading)

    const { isOpen, onOpen, onClose } = useDisclosure();

    const EVERYONE = 'everyone', MYSELF = 'myself'

    const deleteMessage = async (e) => {

        setLoading({
            btn1: e.target.dataset.value === EVERYONE,
            btn2: e.target.dataset.value === MYSELF
        })
        setIsClosable(false)

        try {
            let config = {
                method: 'PUT',
                headers: {
                    token: localStorage.getItem('token')
                }
            }
            const res = await fetch(`${server.URL.local}/api/message/${message._id}/delete?for=${e.target.dataset.value}`, config);

            if (res.status === 401) HandleLogout();

            const { msg } = await res.json();

            let updatedmessages = messages.map(m => {
                if (m._id === msg._id) m = msg
                return m
            })

            setMessages(updatedmessages)

            setChatMessages(chatMessages.map(chm => {
                if (chm.chatId === msg.chat._id) {
                    chm.messages = updatedmessages
                }
                return chm
            }))

            chats?.map(chat => chat?.latestMessage?._id).includes(msg._id) && setChats(chats.map(c => {
                if (c?.latestMessage && c?._id === msg.chat._id && c?.latestMessage?._id === msg._id) {
                    c.latestMessage = msg
                }
                return c
            }))

            console.log(msg);
            setLoading(initailLoading)
            setIsClosable(true)
            onClose()

        } catch (error) {
            showToast('Error', error.message, 'error', 3000)
            setLoading(initailLoading)
            setIsClosable(true)
        }

    }

    return (
        <Box
            opacity={0}
            className='messageActionBox'
            transition={'.15s ease-in'}
            pos={'absolute'}
            display={'flex'}
            gap={'.5rem'}
            left={message.sender._id === user?._id ? '-5rem' : 'auto'}
            right={message.sender._id !== user?._id ? '-2.8rem' : 'auto'}
            top={'0%'}
            zIndex={'1'}>
            {
                message.sender._id === user?._id
                &&
                <ConfirmBoxModal
                    isOpen={isOpen}
                    onClose={onClose}
                    modalDetail={
                        {
                            chat: selectedChat,
                            text: "Are you Sure You want to Delete the message - ",
                            subtext: message.content.message,
                            subtextStyles: { 'fontSize': '.9rem', 'fontStyle': 'italic', 'fontWeight': 400 },
                            btn1: { dataValue: EVERYONE, copy: 'delete for everyone' },
                            btn2: { dataValue: MYSELF, copy: 'delete for me' }
                        }
                    }
                    showCloseBtn={false}
                    handleFunc={deleteMessage}
                    loading={loading}>
                    <ActionItem onOpen={onOpen} classNames={'delMsgIcon'} itemImgSrc={'https://cdn-icons-png.flaticon.com/512/3096/3096673.png'} />
                </ConfirmBoxModal>
            }

            <ActionItem classNames={'reactMsgIcon'} itemImgSrc={'https://cdn-icons-png.flaticon.com/512/1023/1023656.png'} />
        </Box >
    )
}

export default MessageActions
