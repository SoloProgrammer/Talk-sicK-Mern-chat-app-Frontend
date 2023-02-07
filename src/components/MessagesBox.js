import { Avatar, Box, Spinner, Text, Tooltip } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { getMessageDay, getMsgTime, isFirstMsgOfTheDay, isLastMsgOfTheDay } from '../configs/messageConfigs'
import { scrollBottom } from '../configs/scrollConfigs'
import { server } from '../configs/serverURl'
import { HandleLogout, islastMsgOfSender } from '../configs/userConfigs'
import { ChatState } from '../Context/ChatProvider'
import ProfileDrawer from './Materials/ProfileDrawer'

function MessageBox({ messages, setMessages }) {


  const { profile, chatMessages, setChatMessages, user, selectedChat, setSelectedChat, showToast, setProfile, CreateChat, chats, socket } = ChatState();

  useEffect(() => {
    setTimeout(() => {
      document.querySelector('.profileDrawer')?.classList.remove('translateXFull')
    }, 0);
  }, [profile])

  const [messagesLoading, setMessagesLoading] = useState(false);

  const fetchMessages = async () => {

    // setMessagesLoading(true)
    let isChatMsg = false
    chatMessages.map((chatMsg, i) => {
      // console.log(Object.keys(chatMsg),selectedChat?._id);
      if (chatMsg.chatId === selectedChat?._id) {
        setMessages(chatMsg.messages)
        isChatMsg = true
      }
      return 1
    });

    if (isChatMsg) return

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

      setMessages(json.allMessages)

      setMessagesLoading(false);
      // optimization!!!!!!!!!!!!!!!

      // setting fetching messages inside the chatmessages so when next time user click on the previous chat it will not refetch the chat messages instead it will take messages from this chatMessages state! 

      setChatMessages([...chatMessages, { chatId: selectedChat?._id, messages: json.allMessages }])

    } catch (error) {
      showToast("Error", error.message, "error", 3000)
    }

  }

  useEffect(() => {
    scrollBottom("messagesDisplay")
    // eslint-disable-next-line
  }, [messages])

  useEffect(() => {
    selectedChat && fetchMessages()
    socket?.emit('join chat', selectedChat?._id)
    // eslint-disable-next-line
  }, [selectedChat?._id])

  const handleMessageAvatarClick = (avatarUser) => {
    if (!(selectedChat?.isGroupchat) || avatarUser._id === user?._id) {
      setProfile(avatarUser)
      if (window.innerWidth < 770 && avatarUser._id === user._id) setSelectedChat(null)

    }
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
    <Box pos={"relative"} className='MessagesBox' height={selectedChat?.isGroupchat && window.innerWidth < 770 ? "calc(100% - 11rem) !important;" : "calc(100% - 8.6rem) !important;"} display={"flex"} flexDir="column" justifyContent={"flex-end"} gap={".3rem"} overflowX="hidden">
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
          <Box id='messagesDisplay' zIndex={1} display={"flex"} flexDir="column" gap=".6rem" overflowY={"auto"} width="100%" padding={".3rem .4rem"} paddingTop=".6rem">
            {
              messages.length > 0 && messages.map((m, i) => {
                return (
                  <Box key={i}>
                    {
                      isFirstMsgOfTheDay(m.createdAt, messages, i)
                      &&
                      <Box margin={i === 0 ? ".5rem 0" : "1rem 0"} marginBottom="1.5rem" pos={"relative"} borderBottom={`${window.innerWidth > 770 ? "2px" : "1.5px"} solid #15dfd0`} width={"100%"}>
                        <Text
                          userSelect={"none"}
                          pos={"absolute"}
                          className="messagesDay"
                        >{getMessageDay(m.createdAt)}</Text>
                      </Box>
                    }
                    <Box key={i} className='flex' width={"100%"} justifyContent={m.sender._id === user?._id ? "flex-end" : "flex-start"}>
                      <Box flexDir={m.sender._id === user?._id && "row-reverse"} display={"flex"} gap=".5rem" maxW={m.sender._id !== user?._id && window.innerWidth < 770 ? "85%" : "75%"}>

                        {(window.innerWidth > 770 ? m.sender : m.sender._id !== user?._id) &&
                          (window.innerWidth < 770 || (islastMsgOfSender(messages, i, m.sender._id) || isLastMsgOfTheDay(m.createdAt, messages, i))) &&
                          <Box display={"flex"} flexDir="column" justifyContent={m.sender._id === user?._id && "flex-end"}>
                            <Tooltip hasArrow label={selectedChat?.isGroupchat ? (user?._id === m.sender._id ? "My Profile" : "Start a chat") : (user?._id === m.sender._id ? "My Profile" : m.sender.name)} placement="top">
                              <Avatar cursor={"pointer"} onClick={() => handleMessageAvatarClick(m.sender._id === user?._id ? user : m.sender)} size={'sm'} name={m.sender.name} src={m.sender._id === user?._id ? user?.avatar : m.sender.avatar} />
                            </Tooltip>
                          </Box>
                        }

                        <Text
                          padding=".3rem .5rem"
                          fontSize={"1rem"}
                          backgroundColor={m.sender._id !== user?._id ? "#56c8c0" : "#f8f8d9"}
                          key={i} pos="relative"
                          width={"fit-content"}
                          color={m.sender._id === user?._id ? "black" : "ghostwhite"}
                          minWidth={"3.3rem"}
                          fontWeight={'medium'}
                          boxShadow={m.sender._id === user?._id && "0 0 4px rgba(0,0,0,.3)"}
                          borderTopLeftRadius={(m.sender._id === user?._id || (window.innerWidth > 770 && !islastMsgOfSender(messages, i, m.sender._id))) && ".5rem"}
                          borderTopRightRadius=".5rem"
                          borderBottomLeftRadius={".5rem"}
                          position="relative"
                          borderBottomRightRadius={(m.sender._id !== user?._id || !islastMsgOfSender(messages, i, m.sender._id)) && ".5rem"}

                          marginLeft=
                          {window.innerWidth > 770
                            &&
                            (!islastMsgOfSender(messages, i, m.sender._id) && !isLastMsgOfTheDay(m.createdAt, messages, i))
                            &&
                            (m.sender._id !== user?._id)
                            &&
                            "2.5rem"}

                          marginRight={window.innerWidth > 770
                            &&
                            (!islastMsgOfSender(messages, i, m.sender._id) && !isLastMsgOfTheDay(m.createdAt, messages, i))
                            &&
                            (m.sender._id === user?._id)
                            && "2.5rem"}

                          textShadow={m.sender._id !== user?._id && "2px 2px 3px rgba(0,0,0,.3)"}
                          paddingBottom="1rem"
                          paddingRight={"1rem"}
                          paddingLeft={m.content.message.length === 1 && ".9rem"}
                        >
                          {m.content.message}

                          <Text pos={"absolute"} fontSize={".6rem"} right=".4rem" color={"black !important"} textShadow="none !important">
                            {getMsgTime(m.createdAt)}
                          </Text>

                        </Text>
                      </Box>
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
