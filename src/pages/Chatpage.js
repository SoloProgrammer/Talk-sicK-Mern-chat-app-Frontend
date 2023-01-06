import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import {ChatState} from '../Context/ChatProvider';

function Chatpage() {
  const {user,getUser,setUser,showTost} = ChatState()
  const navigate = useNavigate()

  const GetuserInfo = async () =>{
    let res = await getUser();
    if(!res.status){
      localStorage.removeItem('token')
      navigate('/')
      return showTost("Error",res.message,"error",4000)
    }
    setUser(res.user)
  }

  useEffect(() => {
    let token = localStorage.getItem('token');
    if (!token) navigate('/')
    else GetuserInfo()
  }, [navigate])

  useEffect(() =>{
    console.log(user)
  },[user])

  
  return (
    <div>
      Chatpage
    </div>
  )
}

export default Chatpage
