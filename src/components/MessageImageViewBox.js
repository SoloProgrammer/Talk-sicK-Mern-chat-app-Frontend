import { Box, Image, Text, Tooltip } from '@chakra-ui/react'
import React from 'react'
import { ChatState } from '../Context/ChatProvider'

function MessageImageViewBox({ msgImg, setMsgImg, imageActionBtns, handleImgActionCLick }) {

    const { user } = ChatState();

    return (
        <Box onClick={() => setMsgImg(null)} position={"fixed"} width="100%" height="100%" top={0} left="0" className="flex" zIndex={10} background="rgba(0,0,0,.6)" >
            <Box overflow={"hidden"} maxH={window.innerHeight} maxW="99.5%" minW={{ lg: "35rem" }}>
                <Image transform={`translateX(${msgImg.senderId !== user?._id ? "-100%" : "100%"})`} opacity=".3" transition={".4s"} className='messageImage' src={msgImg?.img} maxH={window.innerHeight} maxW="100%" minW={{ lg: "100%" }} objectFit="contain" />
            </Box>
            <Box onClick={(e) => e.stopPropagation()} pos={"absolute"} bottom="0" width={"100%"} minHeight="6rem" background={"blackAlpha.500"} borderTop="1px solid rgba(255,255,255,.4)" className="flex">
                <Box className='flex' gap={"3rem"}>
                    {
                        imageActionBtns.map((imgItem, i) => {
                            return (
                                <Tooltip key={i} label={imgItem.imgCopy} placement="bottom" fontSize={".8rem"} isOpen>
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
                <Box onClick={(e) => e.stopPropagation()} pos={"absolute"} top="0" width={"100%"} minHeight="4rem" background={"blackAlpha.600"} borderBottom="1px solid rgba(255,255,255,.4)" className='flex' padding=".5rem">
                    <Text fontSize={{ base: "1rem", md: "1.3rem" }} color="white" fontWeight={"light"} letterSpacing="0.05px">
                        {msgImg.msg}
                    </Text>
                </Box>
            }
        </Box>
    )
}

export default MessageImageViewBox
