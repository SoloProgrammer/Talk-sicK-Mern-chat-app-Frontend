import { Box, Text } from '@chakra-ui/react'
import React from 'react'

function RemoveAvatarConfirmModal(
    { profile,
        user,
        handleConfirm,
        handleRemoveProfileAvatar,
        confirm }) {
    return (
        <Box className={`confirmBox center ${!confirm && "translateYFull"}`} transition={".4s"} minWidth={"96%"} pos="absolute" background={"white"} zIndex="21" boxShadow={"0 0 3px rgba(0,0,0,.2)"} padding="1rem 0" borderRadius={".2rem"}
            top={{ base: profile._id === user?._id ? "1.15%" : ".9%", md: profile._id === user?._id ? "1.9%" : "1.5%" }}
        >
            <Box className='padding-1LR flex' marginBottom={"1rem"} justifyContent="space-between">
                <Text fontWeight={"medium"}>
                    Remove Avatar?
                </Text>
                <Text fontSize={"1.1rem"} onClick={handleConfirm} transition={".3s"} className="fa-solid fa-xmark" padding={".3rem .5rem"} cursor="pointer" borderRadius=".2rem" _hover={{ bg: "#0a0c0f0f" }} bg={{ base: "#0a0c0f0f", md: "#fff" }} />
            </Box>
            <Text fontSize={".92rem"} fontWeight="normal" letterSpacing={".04rem"} className='padding-1LR' >
                Are you sure you want to remove avatar?
            </Text>
            <Text borderBottom={"1px solid rgb(194, 201, 214)"} margin="1.4rem 0"></Text>
            <Box className='padding-1LR flex' justifyContent={"end"} marginTop="-.37rem">
                <Box color={"white"} className="flex" gap={".6rem"} fontSize=".92rem">
                    <Text onClick={handleConfirm} className='padding3T8LR pointer' borderRadius={".2rem"} background={"rgb(209, 214, 224)"} fontWeight="normal" color={"black"} _hover={{ bg: "rgb(197, 201, 211)" }}>
                        Cancel
                    </Text>
                    <Text onClick={handleRemoveProfileAvatar} className='padding3T8LR pointer' borderRadius={".2rem"} background={"rgb(206, 25, 13)"} fontWeight="medium" _hover={{ bg: "rgb(208, 4, 5)" }}>
                        Remove
                    </Text>
                </Box>
            </Box>
        </Box>
    )
}

export default RemoveAvatarConfirmModal
