import React, { useRef } from 'react'
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
  Box,
} from '@chakra-ui/react'
import { ChatState } from '../../../Context/ChatProvider'

function ConfirmBoxModal({ handleFunc, children, isOpen, onClose, modalDetail, loading, showCloseBtn }) {

  const { isClosable } = ChatState();

  const handleFocus = () => {
    let elm = document.querySelector('.actionBtn')
    elm.style.boxShadow = "0 0 0 2px #ff6a6a"
  }

  const initialRef = useRef(null)

  return (
    <>
      {children}
      <Modal onClose={onClose} isOpen={isOpen} isCentered closeOnOverlayClick={isClosable} initialFocusRef={initialRef} motionPreset='scale'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily={"Roboto"} color="lightslategray">
            <Box fontSize={"1rem"} fontWeight={"medium"} marginRight=".5rem" className='flex' gap={".7rem"} alignItems="start" justifyContent={"start"}>
              <Image marginTop={".2rem"} src="https://cdn-icons-png.flaticon.com/512/4842/4842436.png" width="1.2rem" />
              <Text>
                <span>
                  {modalDetail.text}
                </span>
                &nbsp;
                <span style={modalDetail.subtextStyles}>
                  {modalDetail.subtext}
                </span>
              </Text>
            </Box>
          </ModalHeader>
          <ModalCloseButton top={"2px"} right="2px" disabled={!isClosable} />
          <ModalBody>
          </ModalBody>
          <ModalFooter>

            <FormControl width="100%" display={"flex"} justifyContent="end" gap={'.5rem'} flexDir={modalDetail.btn2Copy && 'column'}>
              {showCloseBtn && <Button height={'1.9rem'}
                borderRadius={'3rem'} fontSize={'.9rem'} onClick={onClose} disabled={!isClosable}>Close</Button>}
              {
                modalDetail?.btn1?.copy
                &&
                <Button
                  boxShadow={'0 0 0 1px #ff000063'}
                  fontSize={'.9rem'}
                  height={'1.9rem'}
                  borderRadius={'3rem'}
                  ref={initialRef}
                  className='actionBtn'
                  color={"red"}
                  isLoading={loading.btn1}
                  disabled={loading.btn1 || loading.btn2}
                  data-value={modalDetail.btn1.dataValue}
                  onClick={handleFunc}>
                  {modalDetail.btn1.copy}
                </Button>
              }
              {
                modalDetail?.btn2?.copy
                &&
                <Button
                  boxShadow={'0 0 0 1px #ff000063'}
                  fontSize={'.9rem'}
                  height={'1.9rem'}
                  borderRadius={'3rem'}
                  ref={initialRef}
                  className='actionBtn'
                  color={"red"}
                  data-value={modalDetail.btn2.dataValue}
                  isLoading={loading.btn2}
                  disabled={loading.btn1 || loading.btn2}
                  onClick={handleFunc}>
                  {modalDetail.btn2.copy}
                </Button>
              }
            </FormControl>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ConfirmBoxModal
