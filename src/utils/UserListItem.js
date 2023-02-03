import { Avatar, AvatarBadge, Box, Text, Tooltip } from '@chakra-ui/react'
import React from 'react'
import { isUserOnline } from '../configs/userConfigs'

function UserListItem({ user, handleFunc }) {
  return (
    <Box
      display={"flex"}
      gap="1rem"
      padding={".2rem .3rem"}
      cursor={"pointer"}
      bg={"#EDF2F7"}
      borderRadius=".3rem"
      onClick={() => handleFunc(user)}
      _hover={{ bg: "#24baaf", color: "white" }}
      width="full"
      alignItems="center">

      <Avatar name={user.name} src={user.avatar} size="sm" >
        <Tooltip fontSize={".65rem"} label={isUserOnline(user) ? "online" : "offline"} placement="bottom-start">
          <AvatarBadge
            borderWidth="1.8px"
            borderColor='#ffffff'
            bg={isUserOnline(user) ? '#00c200' : "darkgrey"}
            boxSize='.9em' />
        </Tooltip>
      </Avatar>
      <Box>
        <b>{user.name}</b>
        <Text wordBreak={"break-word"} fontSize={"sm"}>Email: {user.email}</Text>
      </Box>
    </Box>

  )
}

export default UserListItem
