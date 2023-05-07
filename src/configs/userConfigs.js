import { Avatar, AvatarBadge, AvatarGroup, Box, Image, Text, Tooltip } from '@chakra-ui/react'
import { ChatState } from '../Context/ChatProvider'
import { defaultPic } from './ImageConfigs'

export const getSender = (chat, user) => {
    if (chat?.isGroupchat) return { name: chat.chatName, avatar: chat.groupAvatar, isGrpProfile: true }
    let sender = chat?.users.filter(u => u._id !== user?._id)[0]
    return sender
}

export const isUserOnline = (User) => {
    const { onlineUsers } = ChatState()
    return onlineUsers.map(u => u.userId).includes(User?._id)
}

export const isAdmin = (chat, user) => {
    return chat?.groupAdmin.map(u => u._id).includes(user._id)
}

export const GroupMembers = ({ selectedChat }) => {
    const { profile, user } = ChatState()

    return (
        <Tooltip isOpen label={`${selectedChat?.users.length} Members`} fontSize={".7rem"} placement={profile ? "left" : 'bottom-end'} pointerEvents={"none"}>
            <AvatarGroup size='sm' max={3} cursor={"pointer"}>
                {
                    selectedChat?.users?.map((u, i) => {
                        return (
                            <Avatar key={i} src={(u._id === user?._id ? user?.avatar : u.avatar) || defaultPic} >
                                {isUserOnline(u) && <AvatarBadge
                                    borderWidth="1.8px"
                                    borderColor='#ffffff'
                                    bg={'#00c200'}
                                    boxSize='.9em' />}
                            </Avatar>
                        )
                    })
                }
            </AvatarGroup>
        </Tooltip>
    )
}

export const GroupMemberNames = (members, me) => {
    let membersArray = members.filter(m => m._id !== me?._id).map(m => m.name.split(' ')[0]);
    let names, result;
    membersArray.push('You')
    names = membersArray.join(', ')

    if (window.innerWidth > 1270) {
        result = names.slice(0, 190)
        if (names.length > 190) result = result.concat('...')
    }
    else if (window.innerWidth < 1270 && window.innerWidth > 970) {
        result = names.slice(0, 98)
        if (names.length > 98) result = result.concat('...')
    }
    else if (window.innerWidth > 770 && window.innerWidth < 970) {
        result = names.slice(0, 54)
        if (names.length > 54) result = result.concat('...')
    }
    else if (window.innerWidth < 770) {
        result = names.slice(0, 47)
        if (names.length > 47) result = result.concat('...')
    }

    return result;
}

export const UserChip = ({ user, handleFunc }) => {

    return (
        <Box
            background={"#f2f2f2"}
            height="fit-content"
            display={"flex"}
            gap=".5rem"
            padding={".2rem .2rem"}
            width="fit-content"
            borderRadius="1rem"
            minW={"fit-content !important"}
            boxShadow={"0 0 2px rgba(0,0,0,.4)"}
            alignItems={"center"}>

            <Avatar size="xs" src={user.avatar || defaultPic} />

            <Text fontWeight={"medium"} fontSize=".86rem" fontFamily={"roboto"}>{user.name}</Text>

            <Tooltip label="Remove" placement='top'>
                <Image
                    cursor={"pointer"}
                    onClick={() => handleFunc(user)}
                    width={"1rem"}
                    height="1rem"
                    borderRadius="full"
                    border="1px solid rgba(0,0,0,.3)"
                    src="https://cdn-icons-png.flaticon.com/512/9351/9351415.png" />
            </Tooltip>
        </Box>
    )
}

export const HandleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(0);
}