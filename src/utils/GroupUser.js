import React from 'react'
import { Avatar, Box, Text } from '@chakra-ui/react'


function GroupUser({ user }) {
    return (
        <Box
            margin={".4rem 0"}
            display={"flex"}
            gap="1rem"
            padding={".2rem .3rem"}
            bg={"#EDF2F7"}
            borderRadius=".3rem"
            _hover={{ bg: "#8fa4b9", color: "white" }}
            width="99%"
            alignItems="center">

            {/* <Avatar name={user.name} src={user.avatar !== "" ? user.avatar : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} size="sm" />{' '} */}
            <Avatar  name={user.name} src={user.avatar} size="sm" />{' '}
            <Box>
                <b style={{textTransform:"capitalize"}}>{user.name}</b>
                <Text wordBreak={"break-word"} fontSize={"sm"}>Email: {user.email}</Text>
            </Box>
        </Box>
    )
}

export default GroupUser
