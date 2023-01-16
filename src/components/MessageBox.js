import { Avatar, Box, Spinner, Text, Tooltip } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { server } from '../configs/serverURl'
import { HandleLogout } from '../configs/userConfigs'
import { ChatState } from '../Context/ChatProvider'
import ProfileDrawer from './Materials/ProfileDrawer'
// import ScrollableFeed from 'react-scrollable-feed'

function MessageBox() {

  const { profile, user, selectedChat, showToast, setProfile } = ChatState()

  const [messages, setMessages] = useState([])

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
      console.log(json)
      setMessagesLoading(false)
    } catch (error) {
      showToast("Error", error.message, "error", 3000)
    }

  }

  useEffect(() => {
    selectedChat && fetchMessages()
  }, [selectedChat])


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
          <Box zIndex={1} display={"flex"} flexDir="column" gap=".6rem" overflowY={"auto"} width="100%" padding={"0 .4rem"} paddingBottom=".6rem">
            {
              messages.length > 0 && messages.map((m, i) => {
                return (
                  <Box className='flex' width={"100%"} justifyContent={m.sender._id === user?._id ? "flex-end" : "flex-start"}>
                    <Box flexDir={m.sender._id === user?._id && "row-reverse"} display={"flex"} gap=".5rem" maxW={"75%"}>

                      {
                        <Box display={"flex"} flexDir="column" justifyContent={m.sender._id === user?._id && "flex-end"}>
                          <Tooltip hasArrow label={m.sender.name} placement="top">
                            <Avatar cursor={"pointer"} onClick={() => setProfile(m.sender)} size={'sm'} name={m.sender.name} src={m.sender.avatar} />
                          </Tooltip>
                        </Box>
                      }

                      <Text
                        padding=".3rem .5rem"
                        fontSize={"1.1rem"}
                        backgroundColor={m.sender._id !== user?._id ? "#6ad0c8" : "beige"}
                        key={i} pos="relative"
                        width={"fit-content"}
                        color={m.sender._id === user?._id ? "black" : "ghostwhite"}
                        fontWeight={'medium'}
                        boxShadow={m.sender._id === user?._id && "0 0 4px rgba(0,0,0,.3)"}
                        borderTopLeftRadius={m.sender._id === user?._id && ".5rem"}
                        borderTopRightRadius=".5rem"
                        borderBottomLeftRadius={".5rem"}
                        borderBottomRightRadius={m.sender._id !== user?._id && ".5rem"}
                        textShadow={m.sender._id !== user?._id && "2px 2px 3px rgba(0,0,0,.4)"}
                      >
                        {m.content.message}
                      </Text>
                    </Box>
                  </Box>
                )
              })
            }
            {/* <ScrollableFeed>
        </ScrollableFeed> */}
          </Box>
      }
    </Box>
  )
}

export default MessageBox
