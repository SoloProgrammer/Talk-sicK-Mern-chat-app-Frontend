import { Avatar, Box, Image, Spinner, Text, Tooltip } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { downloadImage, imageActionBtns, zoomInImage, zoomOutImage } from '../configs/ImageConfigs'
import { getMessageDay, getMsgTime, isFirstMsgOfTheDay, isLastMsgOfTheDay } from '../configs/messageConfigs'
import { scrollBottom, scrollTop } from '../configs/scrollConfigs'
import { server } from '../configs/serverURl'
import { defaultPic, HandleLogout, islastMsgOfSender } from '../configs/userConfigs'
import { ChatState } from '../Context/ChatProvider'
import AvatarBox from './Materials/AvatarBox'
import ProfileDrawer from './Materials/ProfileDrawer'

function MessageBox({ messages, setMessages }) {


  const { profile, chatMessages, setChatMessages, archivedChats, user, selectedChat, setSelectedChat, showToast, setProfile, CreateChat, chats, socket } = ChatState();

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      document.querySelector('.profileDrawer')?.classList.remove('translateXFull')
    }, 0);
  }, [profile])

  const [messagesLoading, setMessagesLoading] = useState(false);

  const fetchMessages = async () => {

    if (!(selectedChat?.latestMessage)) {
      setMessages([])
      return
    }
    // setMessagesLoading(true)
    let isChatMsg = false
    chatMessages.forEach((chatMsg, _) => {
      // console.log(Object.keys(chatMsg),selectedChat?._id);
      if (chatMsg.chatId === selectedChat?._id) {
        setMessages(chatMsg.messages)
        isChatMsg = true
      }
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

      scrollBottom("messagesDisplay")


    } catch (error) {
      showToast("Error", error.message, "error", 3000)
    }

  }

  useEffect(() => {
    setTimeout(() => {

      scrollBottom("messagesDisplay")
    }, 20);
    // eslint-disable-next-line
  }, [messages])

  useEffect(() => {
    selectedChat && fetchMessages()
    socket?.emit('join chat', selectedChat?._id)
    // eslint-disable-next-line
  }, [selectedChat?._id])

  let avatarBoxs = document.querySelectorAll('.avatarBox');

  function hideAvatarBoxs() {
    avatarBoxs.forEach(elm => elm.style.display = 'none')
    setAvatarBoxLoading(true)
  }

  function startaChat(avatarUser) {
    // this else part will only run for the Group chat because in Group chat after click onto user avatar a chat will start with him other wise in personal chat we will se profile of the user avatar click
    setSelectedChat(null)
    let isChat = false

    archivedChats.forEach((c, i) => {
      if (!c.isGroupchat && (c.users.map(u => u._id).includes(user?._id) && c.users.map(u => u._id).includes(avatarUser._id))) {
        navigate(`/chats/chat/${c._id}`);
        setProfile(null);
        isChat = true
      }
    })

    if (!isChat) {
      chats.forEach((c, i) => {
        if (!c.isGroupchat && (c.users.map(u => u._id).includes(user?._id) && c.users.map(u => u._id).includes(avatarUser._id))) {
          navigate(`/chats/chat/${c._id}`);
          setProfile(null);
          isChat = true
        }
        else {
          if (i === (chats.length - 1) && !isChat) {

            // this condition is for showing chatsloading to the user when he tries to start a new chat with a group user!
            if (window.innerWidth < 770) setSelectedChat(null)
            CreateChat(avatarUser._id, avatarUser.name)
          }
        }
      })
    }
  }

  window.addEventListener('click', hideAvatarBoxs);

  const handleMessageAvatarClick = (avatarUser, i, e) => {

    // if user click on his own avatar and if the chat is not a group chat then display his or that user avatar click profile other then else start a chat with that user avatar click!
    if (!(selectedChat?.isGroupchat) || avatarUser._id === user?._id) {
      setProfile(avatarUser)
      if (window.innerWidth < 770 && avatarUser._id === user._id) setSelectedChat(null)
    }
    else {
      let avatarBox = document.getElementById(`avatarBox${i}`)
      if (avatarBox.style.display === "flex") return

      // this function will hide all the visible avatar boxs open by users and setting avatarBoxloading to true..!
      hideAvatarBoxs();

      setTimeout(() => {
        setAvatarBoxLoading(false)
      }, Math.floor(Math.random(10) * 1000));

      // and then only that avatar box will be visible on which user has clicked..!
      avatarBox.style.display = "flex"
      e.stopPropagation()
      // startaChat(avatarUser)
    }
  }

  const [isHoverDisable, setIsHoverDisable] = useState(false);
  const [avatarBoxLoading, setAvatarBoxLoading] = useState(true);

  const [scrollToTop, setScrollToTop] = useState(false);

  let messagesContainer = document.querySelector('#messagesDisplay')
  let [lastScrollvalue, setLastScrollvalue] = useState(0);

  messagesContainer?.addEventListener('scroll', () => {
    const currScroll = messagesContainer?.scrollTop;

    // if the user is at the top of messagesContainer then set scrolltotop to false as now user will able to scroll down!
    if (currScroll === 0) return setScrollToTop(false)

    // else if the user is at the extreme bottom of messagesContainer then set scrolltotop to true as now user will able to scroll up!
    else if (currScroll >= messagesContainer?.scrollHeight - 800) return setScrollToTop(true)

    //  user scrolls up show up arrow!
    if (lastScrollvalue < currScroll) {
      setScrollToTop(false)
    }
    // else if show down arrow to go down!
    else setScrollToTop(true)
    setLastScrollvalue(currScroll);

  });

  const [msgImg, setMsgImg] = useState(null);

  function handleImgActionCLick(action, src) {

    if (action === "Download") downloadImage(src)
    if (action === "Zoom-in") zoomInImage()
    if (action === "Zoom-out") zoomOutImage()

  }

  useEffect(() => {
    let img = document.querySelector('.messageImage')
    setTimeout(() => {
      if (img) {
        img.style.transform = "translateX(0)"
        setTimeout(() => {
          img.style.opacity = 1
        }, 150);
      }
    }, 50);
  }, [msgImg])

  return (
    <Box pos={"relative"} className='MessagesBox' height={selectedChat?.isGroupchat && window.innerWidth < 770 ? "calc(100% - 11rem) !important;" : "calc(100% - 8.6rem) !important;"} display={"flex"} flexDir="column" justifyContent={"flex-end"} gap={".3rem"} overflowX="hidden" paddingBottom={"2.5rem"}>

      {
        msgImg?.img
        &&
        <Box onClick={() => setMsgImg(null)} position={"fixed"} width="100%" height="100%" top={0} left="0" className="flex" zIndex={10} background="rgba(0,0,0,.6)" >
          <Box overflow={"hidden"} maxH={window.innerHeight} maxW="99.5%" minW={{ lg: "35rem" }}>
            <Image transform={`translateX(${msgImg.senderId !== user?._id ? "-100%" : "100%"})`} opacity=".3" transition={".4s"} className='messageImage' src={msgImg?.img} maxH={window.innerHeight} maxW="100%" minW={{ lg: "100%" }} objectFit="contain"/>
          </Box>
          <Box onClick={(e) => e.stopPropagation()} pos={"absolute"} bottom="0" width={"100%"} minHeight="6rem" background={"blackAlpha.500"} borderTop="1px solid rgba(255,255,255,.4)" className="flex">
            <Box className='flex' gap={"3rem"}>
              {
                imageActionBtns.map((imgItem, i) => {
                  return (
                    <Tooltip key={i} label={imgItem.imgCopy} placement="bottom" fontSize={".8rem"} isOpen>
                      <Box
                        _active={{ bg: "whiteAlpha.400 !important" }}
                        onClick={(e) => {
                          handleImgActionCLick(imgItem.imgCopy, msgImg.img)
                          e.stopPropagation()
                        }
                        }
                        boxShadow="0 0 0 1px rgba(0,0,0,.2)"
                        background="whiteAlpha.400"
                        padding={".6rem"}
                        borderRadius=".1rem"
                        cursor={"pointer"}
                        _hover={{ bg: "whiteAlpha.300" }}>
                        <Image filter={"invert(100%)"} src={imgItem.src} width={"1.3rem"} />
                      </Box>
                    </Tooltip>
                  )
                })
              }
            </Box>
          </Box>
          {
            msgImg.msg
            &&
            <Box onClick={(e) => e.stopPropagation()} pos={"absolute"} top="0" width={"100%"} minHeight="4rem" background={"blackAlpha.600"} borderBottom="1px solid rgba(255,255,255,.4)" className='flex' padding=".5rem">
              <Text fontSize={{ base: "1rem", md: "1.3rem" }} color="white" fontWeight={"light"} letterSpacing="0.05px">
                {msgImg.msg}
              </Text>
            </Box>
          }
        </Box>
      }

      {
        // profile?._id is same as profile && profile._id but in some instance we need to check the profile first and then the details inside it! it opens this profile drawer with profile?._id condition!
        profile && profile._id !== user?._id &&
        <ProfileDrawer width={"50%"} />
      }

      {
        messagesLoading
          ?
          <Box width={"100%"} height="100%" className='flex'>
            <Tooltip label="Loading Conversations....." isOpen placement='top'>
              <Box zIndex={1} padding={"1rem"} borderRadius="full" className='flex' bg={"white"} boxShadow="0 0 0 rgba(0,0,0,.3)">
                <Spinner color='darkcyan' width={"3rem"} height="3rem" />
              </Box>
            </Tooltip>
          </Box>
          :
          <Box pos={"relative"} id='messagesDisplay' zIndex={1} display={"flex"} flexDir="column" gap=".6rem" overflowY={"auto"} width="100%" padding={".3rem .4rem"} paddingTop=".6rem">

            {
              messages.length > 10 &&
              <Box position={'sticky'} boxShadow="0 0 3px rgba(0,0,0,.3)" cursor={"pointer"} top="0px" right={"20px"} zIndex="1" padding={".7rem"} background="white" borderRadius={"50%"} w="fit-content">
                <Image width={"1.1rem"} onClick={() => {
                  if (scrollToTop) {
                    scrollTop('messagesDisplay', 'smooth')
                  }
                  else {
                    scrollBottom('messagesDisplay', 'auto')
                  }
                }}
                  transition=".2s"
                  transform={`rotate(${scrollToTop ? "180deg" : "0deg"})`}
                  src="https://cdn-icons-png.flaticon.com/512/1621/1621216.png" />
              </Box>
            }
            {
              messages.length > 0
                ?
                messages.map((m, i) => {
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
                              <Tooltip isDisabled={isHoverDisable} hasArrow label={selectedChat?.isGroupchat ? (user?._id === m.sender._id ? "My Profile" : m.sender.name) : (user?._id === m.sender._id ? "My Profile" : m.sender.name)} placement="top">
                                <Avatar
                                  onClick={(e) => handleMessageAvatarClick(m.sender._id === user?._id ? user : m.sender, i, e)}
                                  pos="relative" cursor={"pointer"} size={'sm'} src={m.sender._id === user?._id ? user?.avatar : m.sender.avatar || defaultPic} >
                                  {
                                    m.sender._id !== user?._id
                                    &&
                                    <AvatarBox m={m} startaChat={startaChat} setIsHoverDisable={setIsHoverDisable} i={i} avatarBoxLoading={avatarBoxLoading} />
                                  }
                                </Avatar>
                              </Tooltip>
                            </Box>
                          }

                          <Box
                            padding={m.content.img ? ".3rem" : ".5rem"}
                            fontSize={"1rem"}
                            backgroundColor={m.sender._id !== user?._id ? "#56c8c0" : "#f8f8d9"}
                            key={i} pos="relative"
                            width={"fit-content"}
                            color={m.sender._id === user?._id ? "black" : "ghostwhite"}
                            minWidth={"3.3rem"}
                            fontWeight={'medium'}
                            boxShadow={m.sender._id === user?._id && "0 0 4px rgba(0,0,0,.3)"}
                            borderTopLeftRadius={(m.sender._id === user?._id || (window.innerWidth > 770 && (!islastMsgOfSender(messages, i, m.sender._id) && !isLastMsgOfTheDay(m.createdAt, messages, i)))) && ".5rem"}
                            borderTopRightRadius=".5rem"
                            borderBottomLeftRadius={".5rem"}
                            position="relative"
                            borderBottomRightRadius={(m.sender._id !== user?._id || (!islastMsgOfSender(messages, i, m.sender._id) && !isLastMsgOfTheDay(m.createdAt, messages, i))) && ".5rem"}
                            minW={m.sender._id !== user?._id ? "80px" : "54px"}

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
                            paddingLeft={m.content?.message?.length === 1 && ".9rem"}
                          >

                            {
                              selectedChat?.isGroupchat && m.sender._id !== user?._id && islastMsgOfSender(messages, i, m.sender._id) &&
                              <Text fontSize={".7rem"} fontWeight="normal">
                                {m.sender.name.split(" ")[0]}
                              </Text>
                            }
                            <Box paddingLeft={(m.sender._id !== user?._id && islastMsgOfSender(messages, i, m.sender._id)) && ".0rem"}>
                              {
                                m.content.img
                                  ?
                                  <>
                                    <Box maxW={"35rem"} >
                                      <Text width={"100%"} paddingBottom={".6rem"} >
                                        <Image opacity={(msgImg && m.content.img === msgImg.img) && 0} onClick={() => setMsgImg({ img: m.content.img, msg: m.content.message, senderId: m.sender._id })} cursor={"pointer"} borderRadius={".3rem"} src={m.content.img} preload="none" width="100%" height={"100%"} objectFit={"cover"} maxH="30rem" />
                                      </Text>
                                      <Text>{m.content?.message}</Text>
                                    </Box>
                                  </>
                                  :
                                  m.content.message
                              }
                            </Box>

                            <Text pos={"absolute"} fontSize={".6rem"} right=".4rem" color={"black !important"} textShadow="none !important">
                              {getMsgTime(m.createdAt)}
                            </Text>

                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )
                })
                :
                <Box width={"100%"} height="100%" className='flex'>
                  <Box zIndex={1} border="1px solid rgba(0,0,0,.2)" padding={".8rem 1.5rem"} borderRadius="full" className='flex' gap={"1rem"} bg={"white"} boxShadow="0 0 0 rgba(0,0,0,.3)">
                    <Image width={{ base: "2.2rem", md: "3rem" }} src="https://cdn-icons-png.flaticon.com/512/5809/5809335.png" />
                    <Text fontWeight={"medium"} fontSize="1rem">No Convertions Yet!</Text>
                  </Box>
                </Box>
            }
          </Box>
      }

    </Box >
  )
}

export default MessageBox
