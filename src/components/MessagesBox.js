import { Avatar, Box, Image, Spinner, Text, Tooltip } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { downloadImage, imageActionBtns, seenCheckMark, unSeenCheckMark, zoomInImage, zoomOutImage } from '../configs/ImageConfigs'
import { getMessageDay, getMsgTime, isFirstMsgOfTheDay, isLastMsgOfTheDay, isFirstUnseenMessage, islastMsgOfSender } from '../configs/messageConfigs'
import { scrollBottom, scrollTop } from '../configs/scrollConfigs'
import { server } from '../configs/serverURl'
import { HandleLogout } from '../configs/userConfigs'
import { defaultPic } from '../configs/ImageConfigs'
import { ChatState } from '../Context/ChatProvider'
import AvatarBox from './Materials/AvatarBox'
import ProfileDrawer from './Materials/ProfileDrawer'
import MessageImageViewBox from './MessageImageViewBox'

var selectedChatCompare;
var chatMessagesCompare;
var isFirstLoadOfMsgs = true;

function MessageBox({ messages, setMessages }) {

  const { profile, chatMessages, setChatMessages, archivedChats, user, selectedChat, setSelectedChat, showToast, setProfile, CreateChat, chats, socket, seenMessages } = ChatState();
  // setChats, getPinnedChats, getUnPinnedChats

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
        setMessages(chatMsg.messages);
        isFirstLoadOfMsgs = false
        isChatMsg = true
      }
    });

    if (isChatMsg) return

    try {

      setMessagesLoading(true)

      isFirstLoadOfMsgs = true;

      let config = {
        headers: {
          token: localStorage.getItem('token')
        }
      }
      let res = await fetch(`${server.URL.production}/api/message/fetchmessages/${selectedChat._id}`, config)

      if (res.status === 401) HandleLogout()

      let json = await res.json();

      if (!json.status) return showToast("Error", json.message, "error", 3000)

      if (selectedChatCompare?._id === json.allMessages[0].chat._id) setMessages(json.allMessages);
      else setMessagesLoading(false)

      
      setMessagesLoading(false);
      // optimization!!!!!!!!!!!!!!!
      
      // setting fetching messages inside the chatmessages so when next time user click on the previous chat it will not refetch the chat messages instead it will take messages from this chatMessages state! 
      
      let updatedChatMsgs = [...chatMessages, { chatId: selectedChat?._id, messages: json.allMessages }]
      setChatMessages(updatedChatMsgs)
      
      // This logic is very optimized for seening new messages!

      // Here we are checking if latestMessage from all the messages has not seen by the loggedIn user than only hit the seenMessaged API call else if all the messages are seen by the user than ignore the API call!
      if (json.allMessages[json.allMessages.length - 1].chat.unseenMsgsCountBy[user?._id] > 0) {
        seenMessages(selectedChat,updatedChatMsgs);
      }

      scrollBottom("messagesDisplay")

    } catch (error) {
      showToast("Error", error.message, "error", 3000);
      window.alert(`Error Unable to load messages - Please reload the page!`);
      window.location.reload(0)
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
    selectedChatCompare = selectedChat
    // eslint-disable-next-line
  }, [selectedChat?._id])

  useEffect(() => {
    chatMessagesCompare = chatMessages
  }, [chatMessages])

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

  const locaObj = useLocation();

  useEffect(() => {
    if (locaObj.pathname === `/chats/chat/${selectedChat?._id}`) setMsgImg(null);
    if (locaObj.pathname.slice(locaObj.pathname.lastIndexOf('/')) === '/image' && !msgImg) window.history.back()

    // eslint-disable-next-line
  }, [locaObj, msgImg]);

  // socket on for seen messges!
  useEffect(() => {

    // this sockert is only for the user who send the lastestmesssage in the chat not for the user who seen the latestMessage in that chat!
    if (user && user._id) {
      socket?.on('seen messages', (messages, room) => {

        // console.log(user,messages[messages.length - 1].sender,messages[messages.length - 1]);
        let lastMsg = messages[messages.length - 1]

        // console.log(room, selectedChatCompare?._id);

        if ((selectedChatCompare && selectedChatCompare._id === room) && user._id === lastMsg.sender._id) {
          setMessages([...messages]);
        }

        // console.log(chatMessagesCompare);

        // Updating chatmessages with the new messages recieved in the socket whether user is in the chatroom or not in the chatroom! 
        if (user?._id === lastMsg.sender._id) {
          chatMessagesCompare.forEach(chatMsg => {

            // console.log(lastMsg.chat, chatMsg);

            if (chatMsg.chatId === lastMsg.chat?._id) {

              chatMsg = { chatId: lastMsg.chat?._id, messages: [...messages] }

              // console.log("...", chatMsg, selectedChatCompare);

              // updating the chatmessages of the chat id from which all the messages from with the new seen messages!
              setChatMessages([...(chatMessagesCompare.filter(cm => cm.chatId !== lastMsg.chat?._id)), chatMsg]) // cm := ChatMessage
            }
          })
        }
      })
    }
    // eslint-disable-next-line
  }, [user]);

  return (
    <Box pos={"relative"} className='MessagesBox' height={selectedChat?.isGroupchat && window.innerWidth < 770 ? "calc(100% - 11rem) !important;" : "calc(100% - 8.6rem) !important;"} display={"flex"} flexDir="column" justifyContent={"flex-end"} gap={".3rem"} overflowX="hidden" paddingBottom={"2.5rem"}>

      {
        msgImg?.img && window.location.pathname === `/chats/chat/${selectedChat?._id}/view/${msgImg.senderId}/image`
        &&
        <MessageImageViewBox msgImg={msgImg} setMsgImg={setMsgImg} imageActionBtns={imageActionBtns} handleImgActionCLick={handleImgActionCLick} />
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
            <Tooltip label="Loading Conversations....." isOpen placement='top' fontSize={".8rem"}>
              <Box zIndex={1} padding={"1rem"} borderRadius="full" className='flex' bg={"white"} boxShadow="0 0 2px rgba(0,0,0,.4)">
                <Spinner color='darkcyan' width={{ base: "2.2rem", md: "3rem" }} height={{ base: "2.2rem", md: "3rem" }} />
              </Box>
            </Tooltip>
          </Box>
          :
          <Box pos={"relative"} id='messagesDisplay' zIndex={1} display={"flex"} flexDir="column" gap=".6rem" overflowY={"auto"} width="100%" padding={".3rem .4rem"} paddingTop=".6rem">

            {
              messages.length > 12 &&
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
                        isFirstLoadOfMsgs && isFirstUnseenMessage(m, messages, i, user) && m.sender._id !== user?._id
                        &&
                        <Box pos={"relative"} borderBottom={"2px solid red"} margin="1.5rem 0">
                          <Text userSelect={"none"} boxShadow={"0 0 2px rgba(0,0,0,.2)"} pos={"absolute"} borderRadius=".9rem" color={"red.500"} background="white" top="-.8rem" left="-.2rem" fontWeight={"medium"} fontSize=".87rem" padding={".1rem 1rem"} >
                            {m.chat.unseenMsgsCountBy[user?._id]} new
                            {m.chat.unseenMsgsCountBy[user?._id] > 1 ? " messages" : " message"}
                          </Text>
                        </Box>
                      }

                      {
                        isFirstMsgOfTheDay(m.createdAt, messages, i)
                        &&
                        <Box margin={i === 0 ? ".5rem 0" : "1rem 0"} marginBottom="1.5rem" pos={"relative"} borderBottom={`${window.innerWidth > 770 ? "1px" : "1px"} solid #27aea4`} width={"100%"}>
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
                            backgroundColor={m.sender._id !== user?._id ? "#effbff" : "#ffffdd"}
                            key={i} pos="relative"
                            width={"fit-content"}
                            color={m.sender._id === user?._id ? "black" : "black"}
                            minWidth={"3.3rem"}
                            fontWeight={'400'}
                            boxShadow={m.sender._id === user?._id ? "0px 0px 2px rgba(0,0,0,.3)" : "1px 2px 0px rgba(0,0,0,.15)"}
                            borderTopLeftRadius={(m.sender._id === user?._id || (window.innerWidth > 770 && (!islastMsgOfSender(messages, i, m.sender._id) && !isLastMsgOfTheDay(m.createdAt, messages, i)))) && ".5rem"}
                            borderTopRightRadius=".5rem"
                            borderBottomLeftRadius={".5rem"}
                            position="relative"
                            borderBottomRightRadius={(m.sender._id !== user?._id || (!islastMsgOfSender(messages, i, m.sender._id) && !isLastMsgOfTheDay(m.createdAt, messages, i))) && ".5rem"}
                            minW={m.sender._id !== user?._id ? "80px" : "80px"}

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
                            paddingBottom="1rem"
                            paddingLeft={m.content?.message?.length === 1 && ".9rem"}
                          >

                            {
                              !m.content.img
                              &&
                              selectedChat?.isGroupchat && m.sender._id !== user?._id && islastMsgOfSender(messages, i, m.sender._id) &&
                              <Text fontSize={".7rem"} fontWeight="normal"
                                _hover={{ "textDecoration": "underline" }}
                                cursor={"pointer"}
                                onClick={(e) => handleMessageAvatarClick(m.sender._id === user?._id ? user : m.sender, i, e)}>
                                {m.sender.name.split(" ")[0]}
                              </Text>
                            }
                            <Box paddingLeft={(m.sender._id !== user?._id && islastMsgOfSender(messages, i, m.sender._id)) && ".0rem"}>
                              {
                                m.content.img
                                  ?
                                  <>
                                    <Box maxW={"35rem"} >
                                      <Text width={"100%"} backgroundImage={!msgImg && `url(${m.content.img})`} backgroundPosition="center">
                                        <Image
                                          opacity={(msgImg && m.content.img === msgImg.img) && 0}
                                          onClick={() => {
                                            setMsgImg({ img: m.content.img, msg: m.content.message, senderId: m.sender._id });
                                            navigate(`${window.location.pathname}/view/${m.sender._id}/image`)
                                          }}
                                          cursor={"pointer"}
                                          borderRadius={".3rem"}
                                          src={m.content.img}
                                          preload="none"
                                          width="100%" height={"100%"}
                                          objectFit={"contain"}
                                          backdropFilter="blur(24px)"
                                          maxH="25rem" />
                                      </Text>
                                      <Text paddingTop={".6rem"} >{m.content?.message}</Text>
                                    </Box>
                                  </>
                                  :
                                  <Text>{m.content.message}</Text>
                              }
                            </Box>

                            <Text pos={"absolute"} fontSize={".6rem"} right=".4rem" color={"black !important"} textShadow="none !important" display={"flex"} gap=".3rem">
                              {getMsgTime(m.createdAt)}
                              {
                                m.sender._id === user?._id
                                && <Image src={m.seenBy.length !== selectedChat.users.length ? unSeenCheckMark : seenCheckMark} opacity={m.seenBy.length !== selectedChat.users.length && ".5"} width=".95rem" display="inline-block" />
                              }
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
