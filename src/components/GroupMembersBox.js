import { Box, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import GroupUser from '../utils/GroupUser'
import { ChatState } from '../Context/ChatProvider'


function GroupMembersBox() {

    const { selectedChat } = ChatState()

    const [lastInd, setLastInd] = useState(5)
    const [groupUsers, setGroupUsers] = useState(selectedChat?.users.slice(0, lastInd))

    const hanldeShowMore = () => {
        setGroupUsers(groupUsers.concat(selectedChat?.users.slice(lastInd)))
        setLastInd(lastInd + 5)
    }
    const hanldeShowLess = () => {
        setGroupUsers(groupUsers.slice(0, lastInd - 5))
        setLastInd(lastInd - 5)
    }

    return (
        <Box width={"90%"} marginLeft=".8rem">
            <Box className='flex' justifyContent={"space-between"} marginBottom=".5rem">
                <Text fontSize={{ base: "1.2rem", md: "1.4rem" }} fontWeight="hairline" color="slategrey">Group members</Text>

            </Box>
            <Box className='GroupUsersBox' height={{ base: 'calc(100vh - 30.5rem)', md: 'calc(100vh - 29rem)' }} width="100%" overflowY="auto" >
                {
                    groupUsers.map(u => {
                        return <GroupUser key={u._id} user={u} />
                    })
                }
                {groupUsers.length !== selectedChat?.users.length ? <Text onClick={hanldeShowMore} cursor={"pointer"} color={"blue.400"} fontSize=".8rem" fontWeight={"medium"}>Show more +</Text>
                    :
                    <Text onClick={hanldeShowLess} cursor={"pointer"} color={"blue.400"} fontSize=".8rem" fontWeight={"medium"}>Show less -</Text>
                }
            </Box>
        </Box>
    )
}

export default GroupMembersBox
