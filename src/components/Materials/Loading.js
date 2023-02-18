import { Box, Image, Stack } from '@chakra-ui/react'
import React from 'react'
import { Skeleton, SkeletonCircle } from '@chakra-ui/react'

export const Loading = ({ size, src }) => {
    return (
        <Box display={"flex"} justifyContent="center" alignItems={"center"}>
            <Image width={size} src={src} />
        </Box>
    )
}

export const ChatsSkeleton = () => {

    let chatsCount = new Array(10).fill(1)
    return (
        <Box display={"flex"} flexDir="column" gap={".5rem"} padding="0 .3rem" paddingBottom={"5rem"} >
            <Stack display={"flex"} gap=".2rem">
                {
                    chatsCount.map((_, i) => {
                        return (
                            <Box display={"flex"} gap={".8rem !important"} width={"100%"} alignItems="center" boxShadow="inset 0 0 0 1.1px rgba(0,0,0,.1);" padding={".3rem"}>
                                <SkeletonCircle size={14} />
                                <Box display={"flex"} flexDir="column" gap={".6rem"} width={`${window.innerWidth < 770 ? "80%" : "90%"}`}>
                                    <Skeleton height='15px' w={"100%"}/>
                                    <Skeleton height='19px' w={"100%"}/>
                                </Box>
                            </Box>
                        )
                    })
                }
            </Stack>
        </Box>
    )
}
