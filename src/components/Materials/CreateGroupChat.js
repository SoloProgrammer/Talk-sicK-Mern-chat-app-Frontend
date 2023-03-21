import { Box, Image, Tooltip, useDisclosure } from '@chakra-ui/react'
import PopupModal from './Modals/PopupModal';
import React from 'react'

function CreateGroupChat() {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <PopupModal isOpen={isOpen} onClose={onClose}>
            <Tooltip label="New Group" placement='bottom-end' borderRadius={".2rem"}>
                <Box 
                    cursor="pointer"
                    onClick={onOpen}
                    position={"absolute"}
                    borderRadius="full"
                    padding={".5rem"}
                    background="aliceblue"
                    bottom={"-1rem"}
                    border={"1px solid rgba(0,0,0,.2)"}
                    right={{ base: "5rem", md: "7rem" }}>
                    <Image opacity={".9"} width={"1.25rem"} src="https://cdn-icons-png.flaticon.com/512/33/33308.png" />
                </Box>
            </Tooltip>
        </PopupModal>
    )
}

export default CreateGroupChat
