import { Box, Image, Tooltip, useDisclosure } from '@chakra-ui/react'
import PopupModal from './Modals/PopupModal';
import React from 'react'

function CreateGroupChat() {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <PopupModal isOpen={isOpen} onClose={onClose}>
            <Tooltip label="New Group Chat" placement='bottom-end' borderRadius={".2rem"}>
                <Box width={"2.3rem"}
                    cursor="pointer"
                    onClick={onOpen}
                    position={"absolute"}
                    borderRadius="full"
                    padding={".5rem"}
                    background="aliceblue"
                    bottom={"-1rem"}
                    border={"1px solid rgba(0,0,0,.2)"}
                    right={{ base: "5rem", md: "7rem" }}>
                    <Image width={"100%"} src="https://cdn-icons-png.flaticon.com/512/33/33308.png" ></Image>
                </Box>
            </Tooltip>
        </PopupModal>
    )
}

export default CreateGroupChat
