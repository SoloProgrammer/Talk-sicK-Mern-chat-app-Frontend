import { Box } from '@chakra-ui/react';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../Context/ChatProvider';
import ChatsBox from '../components/ChatsBox';
import MessageBox from '../components/MessageBox';
import { server } from '../configs/serverURl';
import { HandleLogout } from '../configs/userConfigs';


function Chatpage() {
  const { getUser, setUser, showToast, setChatsLoading, setChats, isfetchChats, setIsfetchChats, profile } = ChatState()
  const navigate = useNavigate();

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


  const fetchallchats = async () => {
    setChatsLoading(true)
    try {
      const config = {
        headers: {
          token: localStorage.getItem('token')
        }
      }
      const res = await fetch(`${server.URL.production}/api/chat/allchats`, config);

      if (res.status === 401) HandleLogout()

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
      <Box width={{ base: "95%", md: "95%" }} height={{ base: "98vh", md: "97vh" }} background={"white"} display="flex" overflow={"hidden"}>
        <ChatsBox />
        <MessageBox />
      </Box>
    </Box>
  )
}

export default Chatpage
