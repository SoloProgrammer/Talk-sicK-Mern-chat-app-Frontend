import React, { useState } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
} from '@chakra-ui/react'
import ImageDropZone from '../ImageDropZone'
import { ChatState } from '../../../Context/ChatProvider'

function SendImageModal({ children, isOpen, onClose, }) {

    const { isClosable, setSendPic } = ChatState()

    const [pic, setPic] = useState(null);

    return (
        <>
            {children}
            <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={isClosable}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontFamily={"Roboto"} color="lightslategray" className='flex' gap={".8rem"} justifyContent="start">
                        Select Image n attach to textBox
                    </ModalHeader>
                    <ModalCloseButton disabled={!isClosable} />
                    <ModalBody marginBottom={".4rem"}>
                        <ImageDropZone isOpen={isOpen} pic={pic} setPic={setPic} />
                    </ModalBody>
                    <ModalFooter>
                        {
                            pic
                            &&
                            <Button onClick={() => { setSendPic({ picture: pic.picture, picName: pic.picName }); onClose() }} variant='solid'><i className="fa-solid fa-paperclip mr-3 black-200"></i> Attach to textBox</Button>

                        }
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </>
    )
}

export default SendImageModal
