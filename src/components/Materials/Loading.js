import { Box, Image, Spinner, Stack, Text } from '@chakra-ui/react'
import React from 'react'
import { Skeleton, SkeletonCircle } from '@chakra-ui/react'
import { ChatState } from '../../Context/ChatProvider'

export const Loading = ({ size, src }) => {
    return (
        <Box display={"flex"} justifyContent="center" alignItems={"center"}>
            <Image width={size} src={src} />
        </Box>
    )
}

export const ChatsSkeleton = () => {

    const { isChatCreating } = ChatState();

    let chatsCount = new Array(15).fill(1)
    return (
        <Box display={"flex"} flexDir="column" gap={".5rem"} padding="0 .3rem" paddingBottom={"5rem"} position="relative" >

            {isChatCreating && <Box
                boxShadow={"0 0 3px rgba(0,0,0,.3)"}
                position={"absolute"}
                top="18px"
                left="50%"
                className='flex transformCenter'
                gap={"1rem"} background={"white"}
                padding=".5rem 1rem"
                zIndex={1}
                minWidth="17rem">
                <Spinner size={"md"} color="#27aea4" />
                <Text>Creating chat with <b> {isChatCreating.createdWith} </b></Text>
            </Box>}

            <Stack display={"flex"} gap=".3rem">
                {
                    chatsCount.map((_, i) => {
                        return (
                            <Box key={i} display={"flex"} gap={".8rem !important"} width={"100%"} alignItems="center" marginTop={"0px !important"} padding={".4rem .2rem"} background="rgb(241,243,244)">
                                <SkeletonCircle size={14} />
                                <Box display={"flex"} flexDir="column" gap={".6rem"} width={`${window.innerWidth < 770 ? "82%" : "90%"}`}>
                                    <Skeleton height='19px' w={"100%"} />
                                    <Skeleton height='15px' w={"100%"} />
                                </Box>
                            </Box>
                        )
                    })
                }
            </Stack>
        </Box>
    )
}
