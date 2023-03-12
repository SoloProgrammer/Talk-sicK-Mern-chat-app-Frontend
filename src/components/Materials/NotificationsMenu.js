import { Avatar, MenuItem, Text } from '@chakra-ui/react';
import React from 'react'

function NotificationsMenu({ notifications, defaultPic,setNotifications,navigate,chats }) {
    return (
        <>
            {notifications.map(noti => {
                return (
                    <MenuItem
                        key={noti._id}
                        onClick={() => {
                            setNotifications(notifications.filter(not => not._id !== noti._id));
                            navigate(`/chats/chat/${chats.filter(chat => chat._id === noti.chat._id)[0]._id}`)
                        }}

                        className='flex' gap={".6rem"} justifyContent="flex-start">
                        <Text className='flex' gap=".5rem">
                            <Avatar size={'xs'} src={(noti.chat.isGroupchat ? noti.chat.groupAvatar : noti.sender.avatar) || defaultPic} />
                            <Text>
                                {noti.chat.isGroupchat
                                    ?
                                    noti.chat.chatName.length > 13 ? noti.chat.chatName.slice(0, 13) + "..." : noti.chat.chatName
                                    :
                                    noti.sender.name.split(" ")[0]}
                            </Text>
                        </Text>
                        <Text fontSize={".9rem"} fontWeight="medium">
                            {noti.chat.isGroupchat ? "has some new message!" : "has sent new message for you!"}
                        </Text>
                    </MenuItem>
                )
            })}

            {
                notifications.length > 1
                &&
                <Text
                    marginLeft={".9rem"}
                    cursor="pointer"
                    onClick={() => setNotifications([])}
                    fontSize=".8rem"
                    color={"#2365d1"}
                    fontWeight="bold">Mark all read</Text>
            }
        </>
    )
}

export default NotificationsMenu
