import { Avatar, Box, Spinner, Text, Tooltip } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { scrollBottom } from '../configs/scrollConfigs'
import { server } from '../configs/serverURl'
import { HandleLogout } from '../configs/userConfigs'
import { ChatState } from '../Context/ChatProvider'
import ProfileDrawer from './Materials/ProfileDrawer'

function MessageBox({ messages, setMessages }) {

  const { profile, user, selectedChat, setSelectedChat, showToast, setProfile, CreateChat, chats } = ChatState()

  useEffect(() => {
    setTimeout(() => {
      document.querySelector('.profileDrawer')?.classList.remove('translateXFull')
    }, 0);
  }, [profile])

  const [messagesLoading, setMessagesLoading] = useState(false)

  const fetchMessages = async () => {
    try {

      setMessagesLoading(true)
      let config = {
        headers: {
          token: localStorage.getItem('token')
        }
      }
      let res = await fetch(`${server.URL.production}/api/message/fetchmessages/${selectedChat._id}`, config)

      if (res.status === 401) HandleLogout()

      let json = await res.json();

      if (!json.status) return showToast("Error", json.message, "error", 3000)

      // setMessages([{[selectedChat?._id]:[json.allmessages]}])
      setMessages(json.allMessages)
      setMessagesLoading(false)
      // console.log(document.querySelector('.messagesDisplay')?.height)
    } catch (error) {
      showToast("Error", error.message, "error", 3000)
    }

  }

  useEffect(() => {
    scrollBottom("messagesDisplay")
  }, [messages])

  useEffect(() => {
    selectedChat && fetchMessages()
    // eslint-disable-next-line
  }, [selectedChat?._id])

  const handleMessageAvatarClick = (avatarUser) => {
    if (!(selectedChat?.isGroupchat) || avatarUser._id === user?._id) setProfile(avatarUser)
    else {
      let isChat = false
      chats.map((c, i) => {
        if (c.users.map(u => u._id).includes(user?._id) && c.users.map(u => u._id).includes(avatarUser._id) && !c.isGroupchat) {
          setSelectedChat(c);
          setProfile(null)
          isChat = true
        }
        else {
          if (i === (chats.length - 1) && !isChat) {

            // this condition is for showing chatsloading to the user when he tries to start a new chat with a group user!
            if (window.innerWidth < 770) setSelectedChat(null)

            CreateChat(avatarUser._id)
          }
        }
        return 1
      })
    }
  }

  return (
    <Box className='MessagesBox' display={"flex"} flexDir="column" justifyContent={"flex-end"} gap={".3rem"} overflowX="hidden">
      {
        profile && profile._id !== user?._id && // profile?._id is same as profile && profile._id but in some instance we need to check the profile first and then the detauils inside it! it opens this profile drawer with profile?._id condition!
        <ProfileDrawer width="50%" />
      }
      {
        messagesLoading
          ?
          <Box width={"100%"} height="100%" className='flex'>
            <Box zIndex={1} padding={"1rem"} borderRadius="full" className='flex' bg={"white"} boxShadow="0 0 0 rgba(0,0,0,.3)">
              <Spinner color='darkcyan' width={"3rem"} height="3rem" />
            </Box>
          </Box>
          :
          <Box id='messagesDisplay' zIndex={1} display={"flex"} flexDir="column" gap=".6rem" overflowY={"auto"} width="100%" padding={".6rem .4rem"}>
            {
              messages.length > 0 && messages.map((m, i) => {
                return (
                  <Box key={i} className='flex' width={"100%"} justifyContent={m.sender._id === user?._id ? "flex-end" : "flex-start"}>
                    <Box flexDir={m.sender._id === user?._id && "row-reverse"} display={"flex"} gap=".5rem" maxW={"75%"}>

                      {
                        <Box display={"flex"} flexDir="column" justifyContent={m.sender._id === user?._id && "flex-end"}>
                          <Tooltip hasArrow label={selectedChat?.isGroupchat ? (user?._id === m.sender._id ? "My Profile" : "Start a chat") : m.sender.name} placement="top">
                            <Avatar cursor={"pointer"} onClick={() => handleMessageAvatarClick(m.sender)} size={'sm'} name={m.sender.name} src={m.sender.avatar} />
                          </Tooltip>
                        </Box>
                      }

                      <Text
                        padding=".3rem .5rem"
                        fontSize={"1.1rem"}
                        backgroundColor={m.sender._id !== user?._id ? "#56c8c0" : "#f8f8d9"}
                        // #56c8c0
                        // #36c2b7
                        key={i} pos="relative"
                        width={"fit-content"}
                        color={m.sender._id === user?._id ? "black" : "ghostwhite"}
                        fontWeight={'medium'}
                        boxShadow={m.sender._id === user?._id && "0 0 4px rgba(0,0,0,.3)"}
                        borderTopLeftRadius={m.sender._id === user?._id && ".5rem"}
                        borderTopRightRadius=".5rem"
                        borderBottomLeftRadius={".5rem"}
                        borderBottomRightRadius={m.sender._id !== user?._id && ".5rem"}
                        textShadow={m.sender._id !== user?._id && "2px 2px 3px rgba(0,0,0,.3)"}
                      >
                        {m.content.message}
                      </Text>
                    </Box>
                  </Box>
                )
              })
            }
          </Box>
      }
    </Box>
  )
}

export default MessageBox
