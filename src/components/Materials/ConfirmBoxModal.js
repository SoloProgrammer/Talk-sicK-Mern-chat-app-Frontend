import React, { useEffect,useRef } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Image,
  FormControl,
} from '@chakra-ui/react'
import { getSender } from '../../configs/userConfigs'
import { ChatState } from '../../Context/ChatProvider'

function ConfirmBoxModal({ handleFunc, children, isOpen, onClose, modalDetail, loading, isClosable }) {

  const { user } = ChatState();

  useEffect(() => {
    !isOpen && document.body.click()
  }, [isOpen]);

  const handleOnKeyDown = (e) => {
    if (e.key === "Enter") {
      handleFunc();
    }
  }

  const handleFocus =() =>{
    let elm = document.querySelector('.actionBtn')
    elm.style.boxShadow = "0 0 0 2px #ff6a6a"
  }

  const initialRef = useRef(null)

  return (
    <>
      {children}
      <Modal onClose={onClose} isOpen={isOpen} isCentered closeOnOverlayClick={isClosable} initialFocusRef={initialRef}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text fontSize={"1rem"} textTransform="capitalize" fontWeight={"medium"} marginRight=".5rem" className='flex' gap={".7rem"} alignItems="start" justifyContent={"start"}>
              <Image marginTop={".2rem"} src="https://cdn-icons-png.flaticon.com/512/4842/4842436.png" width="1.2rem" />
              <Text>
                {
                  !(modalDetail.chat.isGroupchat)
                    ?
                    <>
                      Are you Sure You want to Delete Chat with  <b>{getSender(modalDetail.chat, user).name}!</b>
                    </>
                    :
                    <>
                      Are you Sure You want to Leave   <b>{modalDetail.chat.chatName}!</b>
                    </>
                }
              </Text>
            </Text>
          </ModalHeader>
          <ModalCloseButton top={"2px"} right="2px" disabled={!isClosable} />
          <ModalBody>
          </ModalBody>
          <ModalFooter>

            <FormControl onKeyDown={handleOnKeyDown} width="100%" display={"flex"} justifyContent="end">
              <Button marginRight={"1rem"} onClick={onClose} disabled={!isClosable}>Close</Button>
              <Button
              ref={initialRef}
              className='actionBtn'
                color={"red"}
                onFocus={handleFocus}
                isLoading={loading}
                onClick={handleFunc}>
                {
                  !(modalDetail.chat.isGroupchat) ? "Delete" : "Leave"
                }
              </Button>
            </FormControl>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ConfirmBoxModal
