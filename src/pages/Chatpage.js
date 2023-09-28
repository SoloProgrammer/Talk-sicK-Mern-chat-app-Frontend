import { Box } from '@chakra-ui/react';
import React, { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChatState } from '../Context/ChatProvider';
import ChatsBox from '../components/ChatsBox';
import MessageBox from '../components/MessageBox';
import { server } from '../configs/serverURl';
import { HandleLogout } from '../configs/userConfigs';
import ProfilePhotoView from '../components/ProfilePhotoView/ProfilePhotoView';

export const isMobile = () => {
  return window.innerWidth < 770
}

function Chatpage() {
  const { getPinnedChats, getUnPinnedChats, getUser, setUser, archivedChats, setArchivedChats, setViewArchivedChats, showToast, setChatsLoading, setChats, chats, setProfile, isfetchChats, setIsfetchChats, profile, profilePhoto, user, setNotifications, setSelectedChat, setSendPic } = ChatState();

  const navigate = useNavigate();
  const locaObj = useLocation();

  let params = useParams();
  let { chatId } = params
  if (Object.keys(params).length < 1) params = null;

  const fetchallchats = async () => {
    if (user) {
      setChatsLoading(true)
      try {
        const config = {
          headers: {
            token: localStorage.getItem('token')
          }
        }
        const res = await fetch(`${server.URL.local}/api/chat/allchats`, config);

        if (res.status === 401) HandleLogout()

        const json = await res.json();

        if (!json.status) return showToast("Error", json.message, "error", 3000)

        let chatsFromServer = json.chats;

        setChats([...getPinnedChats(chatsFromServer, user), ...getUnPinnedChats(chatsFromServer, user)]);
        setArchivedChats(chatsFromServer.filter(c => c.archivedBy.includes(user?._id)))
        setChatsLoading(false);
        isfetchChats && setIsfetchChats(false)

        // Filled notificatons array with all the new messges from chats on first load of chatspage 
        if (chatsFromServer) {
          let UnseenMsgnotifications = []
          chatsFromServer.forEach(chat => {
            if (user
              && chat.latestMessage
              && !chat.archivedBy.includes(user._id)
              && !chat.mutedNotificationBy.includes(user?._id)
              && !(chat.latestMessage?.seenBy.includes(user?._id))
              && chat.latestMessage.msgType !== 'reaction') {
              UnseenMsgnotifications.push(chat.latestMessage)
            }
          })
          setNotifications(UnseenMsgnotifications)
        }

        setTimeout(() => document.querySelector('.allchats')?.classList.remove('hidetop'), 10)

        // Using the below variables because as we know the state will not be updating immediately and so for avoiding the initail bugs we user the chats coming from server directly instaed of the chats state as it cannot be updated immedidtely!

        let chats = [...getPinnedChats(chatsFromServer, user), ...getUnPinnedChats(chatsFromServer, user)]
        let archivedChats = chatsFromServer.filter(c => c.archivedBy.includes(user?._id))


        // The below logic is for checking the url of the app if the url conatins any of the chatId that he is the part of will be redirected to that chat directly i.e opening the chat without clicking on the chat directly from the url itself! 

        if (params && chatId) { // checking for chatId params or any of the params are there in the url or not if not we will redirect the user to chats page! 
          if (chats?.map(c => c._id).includes(chatId)) {
            setViewArchivedChats(false)
            setSelectedChat(chats.filter(c => c._id === chatId)[0])
          }
          else if (archivedChats?.map(c => c._id).includes(chatId)) {
            setSelectedChat(archivedChats.filter(c => c._id === chatId)[0])
            setViewArchivedChats(true)
          }
          else navigate('/chats')
        }
        else if (locaObj.pathname === '/chats/archived') setViewArchivedChats(true)

        else {
          navigate('/chats');
        }

      } catch (error) {
        return showToast("Error", error.message, "error", 3000)
      }
    }
  }

  useEffect(() => {

    if (locaObj.pathname === "/chats" || chats?.map(c => c._id).includes(chatId)) {
      setViewArchivedChats(false)
    }
    else if ((locaObj.pathname === "/chats/archived" || archivedChats.map(c => c._id).includes(chatId)) && archivedChats.length > 0) setViewArchivedChats(true)

    // else if (archivedChats.length < 1) navigate('/chats')

    if (params && !(chats?.map(chat => chat._id).includes(chatId)) && !archivedChats?.map(c => c._id).includes(chatId)) {
      // If params are there and the chatId aslo there in the params so we will first fetch the user and after fetching the user we will be fetching the chats and then after fetching the chats we will select/open the chat based on the chatId provided in the paramaters!
      GetuserInfo()
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
    else if (!user) {
      GetuserInfo()
    }

    setSendPic(null)
    setTimeout(() => document.querySelector('.mainChatBox')?.classList.remove('hideleft'), 0);
    // eslint-disable-next-line
  }, [navigate])

  useEffect(() => {
    setTimeout(() => document.querySelector('.profileDrawer')?.classList.remove('translateXFull-'), 0);
  }, [profile])

  useEffect(() => {
    !chats && setChatsLoading(true) // just showing the loading until user and then chat has been fully !loaded

    if ((isfetchChats === null || isfetchChats) && user && !chats) {
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

        {/* Position absolute */}
        {profilePhoto && <ProfilePhotoView />}
        {/* {<ProfilePhotoView />} */}
      </Box>
    </Box>
  )
}

export default Chatpage
