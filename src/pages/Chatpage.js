import { Box } from '@chakra-ui/react';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../Context/ChatProvider';
import ChatsBox from '../components/ChatsBox';
import MessagesBox from '../components/MessagesBox';


function Chatpage() {
  const { getUser, setUser, showToast } = ChatState()
  const navigate = useNavigate()

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

    setTimeout(() => {
      document.querySelector('.mainChatBox').classList.remove('hideleft')
      setTimeout(() => document.querySelector('.allchats').classList.remove('hidetop'), 10)
    }
      , 0);
    // eslint-disable-next-line
  }, [navigate])


  return (
    <Box className='mainChatBox hideleft' width="100%" display="flex" justifyContent={"center"} alignItems="center" transition={".5s"}>
      <Box width={{ base: "95%", md: "95%" }} height={{ base: "98%", md: "97%" }} background={"white"} display="flex" overflow={"hidden"}>
        <ChatsBox />
        <MessagesBox />
      </Box>
    </Box>
  )
}

export default Chatpage
