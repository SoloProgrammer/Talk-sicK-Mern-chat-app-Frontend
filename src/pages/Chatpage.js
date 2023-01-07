import { Box } from '@chakra-ui/react';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import {ChatState} from '../Context/ChatProvider';
import ChatsBox from '../components/ChatsBox';
import MessagesBox from '../components/MessagesBox';


function Chatpage() {
  const {getUser,setUser,showToast} = ChatState()
  const navigate = useNavigate()

  const GetuserInfo = async () =>{
    let res = await getUser();
    if(!res.status){
      localStorage.removeItem('token')
      navigate('/')
      return showToast("Error",res.message,"error",4000)
    }
    setUser(res.user)
  }

  useEffect(() => {
    let token = localStorage.getItem('token');
    if (!token) navigate('/')
    else GetuserInfo()
    // eslint-disable-next-line
  }, [navigate])

  // useEffect(() =>{
  //   console.log()
    // eslint-disable-next-line
    // https://cdn-icons-png.flaticon.com/512/3814/3814331.png
    // https://cdn-icons-png.flaticon.com/512/811/811476.png
  // },[user])

  
  return (
    <Box width="100%" display="flex" justifyContent={"center"} alignItems="center">
      <Box width={{base:"95%", md:"95%"}} height={{base:"98%"  ,md:"97%"}} background={"white"} display="flex" overflow={"hidden"}>
          <ChatsBox/>
          <MessagesBox/>
      </Box>
    </Box>
  )
}

export default Chatpage
