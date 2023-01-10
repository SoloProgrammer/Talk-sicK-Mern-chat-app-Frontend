import { Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../Context/ChatProvider';
import ChatsBox from '../components/ChatsBox';
import MessagesBox from '../components/MessagesBox';


function Chatpage() {
  const { getUser, setUser, showToast, isfetchChats, setIsfetchChats, user, selectedChat, setSelectedChat, setProfile, profile } = ChatState()
  const navigate = useNavigate();
  const [chatsLoading, setChatsLoading] = useState(false)

  const GetuserInfo = async () => {
    let res = await getUser();
    if (!res.status) {
      localStorage.removeItem('token')
      navigate('/')
      return showToast("Error", res.message, "error", 4000)
    }
    setUser(res.user)
  }

  useEffect(() => {
    let token = localStorage.getItem('token');
    if (!token) navigate('/')
    else GetuserInfo()

    setTimeout(() => document.querySelector('.mainChatBox')?.classList.remove('hideleft'), 0);
    // eslint-disable-next-line
  }, [navigate])

  useEffect(() => {
    setTimeout(() => document.querySelector('.profileDrawer')?.classList.remove('translateXFull-'), 0);
  }, [profile])

  const [chats, setChats] = useState(null)

  const fetchallchats = async () => {
    setChatsLoading(true)
    try {
      const config = {
        headers: {
          token: localStorage.getItem('token')
        }
      }
      const res = await fetch('/api/chat/allchats', config);
      const json = await res.json();

      if (!json.status) return showToast("Error", json.message, "error", 3000)

      setChats(json.chats);
      setIsfetchChats(false);
      setChatsLoading(false);
      setTimeout(() => document.querySelector('.allchats')?.classList.remove('hidetop'), 10)

    } catch (error) {
      return showToast("Error", error.message, "error", 3000)
    }
  }

  useEffect(() => {
    localStorage.getItem('token') && fetchallchats()
    // eslint-disable-next-line
  }, [isfetchChats])

  return (
    <Box className={`mainChatBox hideleft`} width="100%" display="flex" justifyContent={"center"} alignItems="center" transition={".5s"}>
      <Box width={{ base: "95%", md: "95%" }} height={{ base: "98%", md: "97%" }} background={"white"} display="flex" overflow={"hidden"}>
        <ChatsBox profile={profile} setProfile={setProfile} chats={chats} chatsLoading={chatsLoading} user={user} selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
        <MessagesBox />
      </Box>
    </Box>
  )
}

export default Chatpage
