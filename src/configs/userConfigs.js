import { Avatar, AvatarBadge, AvatarGroup, Box, Image, Text, Tooltip } from '@chakra-ui/react'
import { ChatState } from '../Context/ChatProvider'
import { defaultPic } from './ImageConfigs'
import { isMobile } from '../pages/Chatpage'

export const getSender = (chat, user) => {
    if (chat?.isGroupchat) return { name: chat.chatName, avatar: chat.groupAvatar, isGrpProfile: true }
    let sender = chat?.users?.filter(u => u._id !== user?._id)[0]
    return sender
}

export const isUserOnline = (User) => {
    const { onlineUsers } = ChatState()
    return onlineUsers.map(u => u.userId).includes(User?._id)
}

export const isAdmin = (chat, user) => {
    return chat?.groupAdmin.map(u => u._id).includes(user._id)
}

export const getChatUsers = (chat) => {
    return chat?.users.filter(u => !isUserRemovedFromChat(chat, u))
}

export const GroupMembers = ({ selectedChat }) => {
    const { profile, user } = ChatState()

    const groupUsers = getChatUsers(selectedChat)

    return (
        <Tooltip isOpen label={`${groupUsers.length} Members`} fontSize={".7rem"} placement={profile ? "left" : 'bottom-end'} pointerEvents={"none"}>
            <AvatarGroup size='sm' max={3} cursor={"pointer"}>
                {
                    groupUsers?.map((u, i) => {
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

export const GroupMemberNames = (groupChat, me) => {
    const members = groupChat.users
    let membersArray = members.filter(m => (m._id !== me?._id && !isUserRemovedFromChat(groupChat, m))).map(m => m.name.split(' ')[0]);
    let names, result;
    !isUserRemovedFromChat(groupChat, me) && membersArray.push('You')
    names = membersArray.join(', ')

    if (window.innerWidth > 1270) {
        result = names.slice(0, 190)
        if (names.length > 190) result = result.concat('...')
    }
    else if (window.innerWidth < 1270 && window.innerWidth > 970) {
        result = names.slice(0, 98)
        if (names.length > 98) result = result.concat('...')
    }
    else if (!isMobile() && window.innerWidth < 970) {
        result = names.slice(0, 54)
        if (names.length > 54) result = result.concat('...')
    }
    else if (isMobile()) {
        result = names.slice(0, 40)
        if (names.length > 40) result = result.concat('...')
    }

    return result;
}

export const getJoinUserNames = (users) => {
    return users.map(u => u.name.split(' ')[0]).join(', ')
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

export const isUserRemovedFromChat = (chat, user) => {
    if (!chat.isGroupchat) return false
    return chat?.leftFromGroup?.map(leftUserObj => leftUserObj.user._id)?.includes(user._id)
}

export const removedFromChatUserLatestMesssage = (chat, user) => {
    return chat.leftFromGroup.filter(leftUserObj => leftUserObj.user._id === user._id)[0].latestMessage
}