import { Box } from '@chakra-ui/react';
import React, { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChatState } from '../Context/ChatProvider';
import ChatsBox from '../components/ChatsBox';
import MessageBox from '../components/MessageBox';
import { server } from '../configs/serverURl';
import { HandleLogout } from '../configs/userConfigs';


function Chatpage() {
  const { getPinnedChats, getUnPinnedChats, getUser, setUser, archivedChats, setArchivedChats, setViewArchivedChats, showToast, setChatsLoading, setChats, chats, setProfile, isfetchChats, setIsfetchChats, profile, user, setNotifications, setSelectedChat, setSendPic } = ChatState();

  const navigate = useNavigate();
  const locaObj = useLocation();

  let params = useParams();
  let { chatId } = params
  if (Object.keys(params).length < 1) params = null;

  useEffect(() => {

    if (locaObj.pathname === "/chats" || chats?.map(c => c._id).includes(chatId)) {
      setViewArchivedChats(false)
    }
    else if ((locaObj.pathname === "/chats/archived" || archivedChats.map(c => c._id).includes(chatId)) && archivedChats.length > 0) setViewArchivedChats(true)

    else if (archivedChats.length < 1) navigate('/chats')

    if (params && !(chats?.map(chat => chat._id).includes(chatId)) && !archivedChats?.map(c => c._id).includes(chatId)) {
      navigate('/chats')
      setSelectedChat(null)
    }
    else {

      if (archivedChats?.map(c => c._id).includes(chatId)) {
        setSelectedChat(archivedChats?.filter(chat => chat._id === chatId)[0])
      }
      else {
        setSelectedChat(chats?.filter(chat => chat._id === chatId)[0])
      }
      setProfile(null);
    }

    chats && setTimeout(() => document.querySelector('.allchats')?.classList.remove('hidetop'), 10)

    // eslint-disable-next-line
  }, [locaObj])

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

    setSendPic(null)
    setTimeout(() => document.querySelector('.mainChatBox')?.classList.remove('hideleft'), 0);
    // setTimeout(() => document.querySelector('.allchats')?.classList.remove('hidetop'), 10);
    // eslint-disable-next-line
  }, [navigate])

  useEffect(() => {
    setTimeout(() => document.querySelector('.profileDrawer')?.classList.remove('translateXFull-'), 0);
  }, [profile])

  const fetchallchats = async () => {
    if (user) {
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

        setChats([...getPinnedChats(json.chats, user), ...getUnPinnedChats(json.chats, user)]);
        setArchivedChats(json.chats.filter(c => c.archivedBy.includes(user?._id)))
        setChatsLoading(false);
        isfetchChats && setIsfetchChats(false)

        // Filled notificatons array with all the new messges from chats on first load of chatspage 
        if (json.chats) {
          let UnseenMsgnotifications = []
          json.chats.forEach(chat => {
            if (user && chat.latestMessage && !chat.archivedBy.includes(user._id) && !chat.mutedNotificationBy.includes(user?._id) && !(chat.latestMessage?.seenBy.includes(user?._id))) {
              UnseenMsgnotifications.push(chat.latestMessage)
            }
          })
          setNotifications(UnseenMsgnotifications)
        }

        setTimeout(() => document.querySelector('.allchats')?.classList.remove('hidetop'), 10)

      } catch (error) {
        return showToast("Error", error.message, "error", 3000)
      }
    }
  }

  useEffect(() => {
    !params && !chats && setChatsLoading(true) // just showing the loading until user and then chat has been fully !loaded

    if ((isfetchChats === null || isfetchChats) && user && !params && !chats) {
      localStorage.getItem('token') && fetchallchats()
    }
    // eslint-disable-next-line
  }, [isfetchChats, user]);

  let elms = document.querySelectorAll('.chat_menu');
  document.addEventListener('click', () => {
    elms.forEach(item => {
      item.classList.remove('menu_open');
    })
  })

  return (
    <Box className={`mainChatBox hideleft`} width="100%" display="flex" justifyContent={"center"} alignItems="center" transition={".5s"}>
      <Box width={"95%"} height={{ base: "98vh", md: "97vh" }} background={"white"} display="flex" overflow={"hidden"}>
        <ChatsBox />
        <MessageBox />
      </Box>
    </Box>
  )
}

export default Chatpage
