import { Box, Image, Text, Tooltip } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { useNavigate } from 'react-router-dom'

function MessageImageViewBox({ msgImg, setMsgImg, imageActionBtns, handleImgActionCLick }) {

    const { user, selectedChat } = ChatState();

    let navigate = useNavigate()

    const handleClose = (e) => {
        e.stopPropagation()
        setMsgImg(null)
        navigate(`/chats/chat/${selectedChat._id}`)
    }
    let imageActionBtnsBox = document.querySelector('.imageActionBtnsBox');
    let imageMsgBox = document.querySelector('.imageMsgBox');
    let closeBtn = document.querySelector('.closeBtn');

    const [open, setOpen] = useState(true)

    const handleImageWhiteSpaceClick = () => {
        imageActionBtnsBox?.classList.toggle('translateYdown');
        imageMsgBox?.classList.toggle('translateYup');
        closeBtn?.classList.toggle('translateXFull');
        if (open) {
            setOpen(false)
        }
        else {
            setTimeout(() => {
                setOpen(true)
            }, 300);
        }
    }

    useEffect(() => {
        setTimeout(() => {
            imageActionBtnsBox?.classList.add('translateYdown');
            imageMsgBox?.classList.add('translateYup');
            closeBtn?.classList.remove('translateXFull');
            setOpen(false)
        }, 3000);
        console.log("iysgd");
        // eslint-disable-next-line
    }, [imageActionBtnsBox])


    return (
        <Box onClick={handleImageWhiteSpaceClick} position={"fixed"} width="100%" height="100%" top={0} left="0" className="flex" zIndex={10} background="rgba(0,0,0,.4)" >

            {/* close ImageView Container Btn */}
            <Box borderTopLeftRadius={"1.2rem"} borderBottomLeftRadius="1.2rem" transition={".3s all"} fontSize="1.1rem" fontWeight={"medium"} pos={"absolute"} right="0" padding={".2rem .4rem"} onClick={handleClose} cursor="pointer" _hover={{bg:"gainsboro"}} background="white" color={"black"} top="1rem" className='closeBtn translateXFull flex' justifyContent={"space-between"} gap=".5rem">
                <Image src='https://cdn-icons-png.flaticon.com/512/2938/2938884.png' width={"1.4rem"}/>
                <Text>Close</Text>
            </Box>

            <Box overflow={"hidden"} maxH={window.innerHeight} maxW="99.5%" minW={{ lg: "35rem" }}>
                <Image transform={`translateX(${msgImg.senderId !== user?._id ? "-100%" : "100%"})`} opacity=".3" transition={".4s"} className='messageImage' src={msgImg?.img} maxH={window.innerHeight} maxW="100%" minW={{ lg: "100%" }} objectFit="contain" />
            </Box>
            <Box transition={".3s all"} onClick={(e) => e.stopPropagation()} pos={"absolute"} bottom="0" width={"100%"} minHeight="6rem" background={"blackAlpha.500"} borderTop="1px solid rgba(255,255,255,.4)" className="flex imageActionBtnsBox">
                <Box className='flex' gap={"3rem"}>
                    {
                        imageActionBtns.map((imgItem, i) => {
                            return (
                                <Tooltip key={i} label={imgItem.imgCopy} placement="bottom" fontSize={".8rem"} isOpen={open}>
                                    <Box
                                        _active={{ bg: "whiteAlpha.400 !important" }}
                                        onClick={(e) => {
                                            handleImgActionCLick(imgItem.imgCopy, msgImg.img)
                                            e.stopPropagation()
                                        }
                                        }
                                        boxShadow="0 0 0 1px rgba(0,0,0,.2)"
                                        background="whiteAlpha.400"
                                        padding={".6rem"}
                                        borderRadius=".1rem"
                                        cursor={"pointer"}
                                        _hover={{ bg: "whiteAlpha.300" }}>
                                        <Image filter={"invert(100%)"} src={imgItem.src} width={"1.3rem"} />
                                    </Box>
                                </Tooltip>
                            )
                        })
                    }
                </Box>
            </Box>
            {
                msgImg.msg
                &&
                <Box transition={".3s all"} onClick={(e) => e.stopPropagation()} pos={"absolute"} top="0" width={"100%"} minHeight="4rem" background={"blackAlpha.600"} borderBottom="1px solid rgba(255,255,255,.4)" className='flex imageMsgBox' padding=".5rem">
                    <Text fontSize={{ base: "1rem", md: "1.3rem" }} color="white" fontWeight={"light"} letterSpacing="0.05px">
                        {msgImg.msg}
                    </Text>
                </Box>
            }
        </Box>
    )
}

export default MessageImageViewBox
