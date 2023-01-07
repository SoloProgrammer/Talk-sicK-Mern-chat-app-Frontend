import { Avatar, Box, Text } from '@chakra-ui/react'
import React from 'react'

function UserListItem({ user, handleFunc }) {
  return (
    <Box
      display={"flex"}
      gap="1rem"
      padding={".2rem .3rem"}
      cursor={"pointer"}
      bg={"#EDF2F7"}
      borderRadius=".3rem"
      onClick={()=> handleFunc(user)}
      _hover={{ bg: "#24baaf", color: "white" }}
      alignItems="center">
      <Avatar name={user.name} src={user.avatar} size="sm" />{' '}
      <Box>
        <b>{user.name}</b>
        <Text wordBreak={"break-word"} fontSize={"sm"}>Email: {user.email}</Text>
      </Box>
    </Box>

  )
}

export default UserListItem
