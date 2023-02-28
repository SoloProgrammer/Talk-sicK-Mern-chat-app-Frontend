import { Box, Image, Text, useDisclosure } from '@chakra-ui/react';
import React, { useState } from 'react'
import { ChatState } from '../Context/ChatProvider';
import ConfirmBoxModal from './Materials/ConfirmBoxModal';

function DeleteChat() {


    const { isClosable, handleDeleteChat, selectedChat } = ChatState()

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [loading, setLoading] = useState(false);

    return (
        <>
            <ConfirmBoxModal isClosable={isClosable} handleFunc={() => handleDeleteChat(selectedChat, onClose, setLoading)} isOpen={isOpen} onClose={onClose} modalDetail={{ chat: selectedChat, subtext: "Are you Sure You want to Delete Chat with", btnCopy: "Delete" }} loading={loading}>
                <Box
                    _hover={{ bg: "gray.200", boxShadow: "0 0 2px rgba(0,0,0,.2)" }}
                    transition=".4s all"
                    border={"1px solid rgba(0,0,0,.1)"}
                    fontWeight={"medium"}
                    className="flex"
                    alignItems={"start"}
                    gap=".3rem"
                    padding=".4rem"
                    cursor={"pointer"}
                    onClick={onOpen}
                    color={"red.400"}>
                    <>
                        <Image width={"1.2rem"} src='https://cdn-icons-png.flaticon.com/512/5165/5165608.png' />
                        <Text>Delete Chat</Text>
                    </>

                </Box>
            </ConfirmBoxModal>
        </>
    )
}

export default DeleteChat
