import { Avatar, AvatarBadge, AvatarGroup, Box, Image, Text, Tooltip } from '@chakra-ui/react'
import { ChatState } from '../Context/ChatProvider'

export const defaultPic = "https://res.cloudinary.com/dvzjzf36i/image/upload/v1674153497/cudidy3gsv1e5zztsq38.png"

export const getSender = (chat, user) => {
    if (chat?.isGroupchat) return { name: chat.chatName, avatar: chat.groupAvatar, isGrpProfile: true }
    let sender = chat?.users.filter(u => u._id !== user?._id)[0]
    return sender
}

export const isUserOnline = (User) => {
    const { onlineUsers } = ChatState()
    return onlineUsers.map(u => u.userId).includes(User._id)
}

export const isAdmin = () => {
    const { selectedChat, user } = ChatState()
    return selectedChat?.groupAdmin.map(u => u._id).includes(user._id)
}

export const GroupMembers = ({ selectedChat }) => {
    const { profile, user } = ChatState()

    return (
        <Tooltip isOpen label="Group members" placement={profile ? "left" : 'bottom-end'} pointerEvents={"none"}>
            <AvatarGroup size='sm' max={3}>
                {
                    selectedChat?.users?.map((u, i) => {
                        return (
                            <Avatar key={i} src={u._id === user?._id ? user?.avatar : u.avatar || defaultPic} >
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

export const UserChip = ({ user, handleFunc }) => {

    return (
        <Box
            background={"#92929245"}
            height="fit-content"
            display={"flex"}
            gap=".5rem"
            padding={".2rem .2rem"}
            width="fit-content"
            borderRadius="1rem"
            minW={"fit-content !important"}
            alignItems={"center"}>

            <Avatar size="xs" src={user.avatar || "https://res.cloudinary.com/dvzjzf36i/image/upload/v1674153497/cudidy3gsv1e5zztsq38.png"} />

            <Text fontWeight={"medium"} fontSize=".9rem">{user.name}</Text>

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

export const islastMsgOfSender = (messages, i, senderId) => {

    return (messages[i + 1] === undefined || messages[i + 1].sender._id !== senderId)

}