import { Avatar, Box, Image, Spinner, Text, Tooltip } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { downloadImage, imageActionBtns, seenCheckMark, unSeenCheckMark, zoomInImage, zoomOutImage } from '../configs/ImageConfigs'
import { getMessageDay, getMsgTime, isFirstMsgOfTheDay, isLastMsgOfTheDay, isFirstUnseenMessage, islastMsgOfSender, islastRegularMsgOfSender } from '../configs/messageConfigs'
import { scrollBottom, scrollIntoView, scrollTop } from '../configs/scrollConfigs'
import { server } from '../configs/serverURl'
import { HandleLogout } from '../configs/userConfigs'
import { defaultPic } from '../configs/ImageConfigs'
import { ChatState } from '../Context/ChatProvider'
import AvatarBox from './Materials/AvatarBox'
import ProfileDrawer from './Materials/ProfileDrawer'
import MessageImageViewBox from './MessageImageViewBox'
import Linkify from 'react-linkify'
import MessageActions from './MessageActionMenu/MessageActions'
import MessageDeletedText from './Materials/MessageDeletedText'

var selectedChatCompare, isFetchMoreMessages, chatMessagesCompare, skipFromCompare, isObservred, messageBoxPrevScrollHeight, TopMsgDateElm, TopMessageObserver, seenCount = 0;

function MessagesBox({ isFirstLoadOfMsgs, setIsFirstLoadOfMsgs }) {

  const
    { profile, chatMessages, setChatMessages, archivedChats, user, selectedChat, setSelectedChat, showToast, setProfile, CreateChat, chats, socket, seenMessages, messages, setMessages, setChats } = ChatState();

  const navigate = useNavigate();

  const loadMessages = async (chatId, skip, limit) => {
    skip = skip || 0
    // console.log('------------------------', skip, limit);
    let config = {
      headers: {
        token: localStorage.getItem('token')
      }
    }
    let res = await fetch(`${server.URL.local}/api/message/fetchmessages/${chatId}?skip=${skip}&limit=${limit}`, config)

    messagesLimit = 15

    if (res.status === 401) HandleLogout()

    let json = await res.json();

    if (!json.status) return showToast("Error", json.message, "error", 3000)

    return json.allMessages
  }

  useEffect(() => {
    setTimeout(() => {
      document.querySelector('.profileDrawer')?.classList.remove('translateXFull')
    }, 0);
  }, [profile])

  const getSelectedChatDownloadedMsgs = (chatId = selectedChatCompare?._id) => {
    // console.log(chatMessagesCompare, "---");
    // it will return all the already downloaded messages from the server which is cached in the chatMessagesCompare
    return chatMessagesCompare?.filter(ch => ch.chatId === chatId)[0]?.messages
  }

  const getMessagesContainer = () => document.querySelector('#messagesDisplay')

  let messagesLimit = 15
  const [skipFrom, setSkipFrom] = useState()

  // Intersection Observer useEffect....
  useEffect(() => {
    // Creating an observer object only once when the messgesComponent loads first time!
    TopMessageObserver = new IntersectionObserver((entries) => {
      // console.log('hey');
      let TopMsg = entries[0]
      // console.log(TopMsg.target,TopMsg.isIntersecting,isObservred);
      if (TopMsg.isIntersecting && !isObservred) {
        if (getSelectedChatDownloadedMsgs()?.length !== selectedChatCompare?.totalMessages) {
          TopMessageObserver.unobserve(TopMsg.target)
          isObservred = true
          fetchMoreMessages()
        }
      }
    }, { threshold: .9, root: getMessagesContainer() })

    // Removing previously created Obserber object when component unmounted
    return () => TopMessageObserver.disconnect()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    skipFromCompare = skipFrom

    setTimeout(() => {

      if (skipFromCompare > 0
        && selectedChatCompare?.totalMessages >= messagesLimit
        && TopMsgDateElm
        && selectedChatCompare?.totalMessages !== getSelectedChatDownloadedMsgs()?.length) {
        TopMessageObserver.observe(TopMsgDateElm)
      }

    }, 1000);
    // eslint-disable-next-line
  }, [skipFrom, TopMsgDateElm])

  // console.log(selectedChat?.totalMessages);
  const [loading, setLoading] = useState(false)
  const fetchMoreMessages = async () => {
    try {

      let messgesContainer = getMessagesContainer();
      messageBoxPrevScrollHeight = messgesContainer?.scrollHeight

      setIsFirstLoadOfMsgs(false)
      isFetchMoreMessages = true

      let chatMsgs = getSelectedChatDownloadedMsgs()

      if (skipFromCompare === (selectedChatCompare?.totalMessages - chatMsgs.length)) {
        if (skipFromCompare < messagesLimit) {
          skipFromCompare = 0
          setSkipFrom(0)
        }
        else {
          skipFromCompare = skipFromCompare - messagesLimit
          setSkipFrom(skipFromCompare)
        }
      }

      let remainingMessages = selectedChatCompare?.totalMessages - chatMsgs.length

      if (remainingMessages < messagesLimit) messagesLimit = remainingMessages

      setLoading(true)

      const messages = await loadMessages(selectedChatCompare?._id, skipFromCompare, messagesLimit)

      // This line fixes the unexpected bug/error which says:- loadMessages is not a function()--which is really wired bcz by adding this line of code that error vanishes!
      messages && console.log();
      // if (selectedChat?._id === json.allMessages[0].chat._id) ;
      (!skipFromCompare || skipFromCompare > 0) && setSkipFrom(skipFromCompare >= messagesLimit ? (skipFromCompare - messagesLimit) : 0)

      setLoading(false)

      let updatedChatMsgs = chatMessagesCompare.map(chatMsg => {
        if (chatMsg.chatId === selectedChatCompare?._id) {
          chatMsg.messages = [...messages, ...chatMsg.messages]
          setMessages(chatMsg.messages)
        }
        return chatMsg
      })

      setChatMessages(updatedChatMsgs)

      isObservred = skipFromCompare > 0 ? false : true

      setTimeout(() => {
        // && selectedChatCompare?.totalMessages !== chatMsgs.length removing this condition check for now as it is not needed for now 
        if (!isObservred && TopMsgDateElm) {
          // console.log("uiyff");
          isObservred = false
          TopMsgDateElm = document.querySelector('.messagesDay')
          TopMessageObserver.observe(TopMsgDateElm)
        }
      }, 1000);
    } catch (error) {
      setLoading(false)
      console.log(error);
    }

  }

  const [messagesLoading, setMessagesLoading] = useState(false);
  const fetchMessages = async () => {

    isObservred = false

    if (!(selectedChat?.totalMessages)) return setMessages([])
    // setMessagesLoading(true)
    let isChatMsg = false
    chatMessages.forEach((chatMsg, _) => {
      // console.log(Object.keys(chatMsg),selectedChat?._id);
      if (chatMsg.chatId === selectedChat?._id) {
        setMessages(chatMsg.messages);
        setIsFirstLoadOfMsgs(false)
        isChatMsg = true
        setSkipFrom(selectedChatCompare?.totalMessages - (chatMsg.messages.length))
      }
    });

    if (isChatMsg) return

    try {

      setMessagesLoading(true)

      setIsFirstLoadOfMsgs(true)

      let config = {
        headers: {
          token: localStorage.getItem('token')
        }
      }
      // let res = await fetch(`${server.URL.local}/api/message/fetchmessages/${selectedChat._id}`, config)

      // here we are not directly subtracting messageslimit from totolmessages as if totalmessages is less than messagesLimit like 8 < 15 then skipFrom value will be in negative which will throw error, so instead we checking that if totalmessages is greater or equal to messages limit than subtract the messageslimit or else subtract the totalmessages itself so skipfrom value will be 0 so all the messages will be fetch  
      let skipFrom = selectedChat?.totalMessages - (selectedChat.totalMessages >= messagesLimit ? messagesLimit : selectedChat?.totalMessages)

      let res = await fetch(`${server.URL.local}/api/message/fetchmessages/${selectedChat._id}?skip=${skipFrom}&limit=${messagesLimit}`, config)

      if (res.status === 401) HandleLogout()

      let json = await res.json();

      if (!json.status) return showToast("Error", json.message, "error", 3000);

      if (selectedChatCompare?._id === json.allMessages[0].chat._id) setMessages(json.allMessages);
      else setMessagesLoading(false)

      selectedChat.totalMessages > messagesLimit && setSkipFrom(selectedChat?.totalMessages - json.allMessages.length)

      setMessagesLoading(false);

      // optimization code..!

      // setting fetching messages inside the chatmessages so when next time user click on the previous chat it will not refetch the chat messages instead it will take messages from this chatMessages state! 

      // here we are using chatMessagesCompare bcz the below setChatMessages function doesn't update the state immediately and the below logic will consider empty when selected chat changed frquently by user so to store the previously loaded messages in the cached state i.e chatMessages state!

      let updatedChatMsgs = [...chatMessagesCompare, { chatId: selectedChat?._id, messages: json.allMessages }]

      setChatMessages(updatedChatMsgs)

      // This logic is very optimized for seening new messages!

      // Here we are checking if latestMessage from all the messages has not seen by the loggedIn user than only hit the seenMessage API call else if all the messages are seen by the user than ignore the API call!
      if (json.allMessages[json.allMessages.length - 1].chat.unseenMsgsCountBy[user?._id] > 0) {
        seenMessages(selectedChat);
      }

      scrollBottom("messagesDisplay")

    } catch (error) {
      console.log(error);
      showToast("Error", error.message, "error", 3000);
      window.alert(`Error Unable to load messages - Please reload the page!`);
      // window.location.reload(0)
    }

  }
  // console.log(chatMessages,chatMessagesCompare);
  useEffect(() => {
    // console.log(messages);

    let messagesContainer = getMessagesContainer()

    // Getting current scroll height of messagesContainer after new messges are loaded...!
    let messgeBoxCurrScrollHeight = messagesContainer?.scrollHeight

    // Substracting the prevScrollHeight from currScrollHeight 
    let toScrollVal = messgeBoxCurrScrollHeight - messageBoxPrevScrollHeight

    // console.log(toScrollVal, currentMessgeBoxScrollHeight, messageBoxPrevScrollHeight);

    setTimeout(() => {
      if (isFirstLoadOfMsgs || skipFromCompare === (selectedChatCompare?.totalMessages - messagesLimit) || !isFetchMoreMessages) setTimeout(() => scrollBottom("messagesDisplay"), 20);
      else scrollIntoView(messagesContainer, toScrollVal)
      isFetchMoreMessages = false
    }, 0);

    TopMsgDateElm = document.querySelector('.messagesDay')
    // eslint-disable-next-line
  }, [messages])

  useEffect(() => {
    isFetchMoreMessages = false
    selectedChatCompare = selectedChat

    if (getSelectedChatDownloadedMsgs()?.length === selectedChat?.totalMessages) isObservred = true

    selectedChat && fetchMessages()
    socket?.emit('join chat', selectedChat?._id)

    setTimeout(() => {
      scrollBottom("messagesDisplay")
    }, 30);

    // eslint-disable-next-line
  }, [selectedChat?._id])

  useEffect(() => {
    if (selectedChatCompare || selectedChat) {
      setSelectedChat(chats?.filter(ch => ch._id === selectedChatCompare?._id)[0])
      selectedChatCompare = chats?.filter(ch => ch._id === selectedChatCompare?._id)[0]
    }
    // eslint-disable-next-line
  }, [chats])

  useEffect(() => {
    chatMessagesCompare = chatMessages
    // eslint-disable-next-line
  }, [chatMessages])

  let avatarBoxs = document.querySelectorAll('.avatarBox');

  function hideAvatarBoxs() {
    if (!avatarBoxLoading) {
      setAvatarBoxLoading(true)
      avatarBoxs.forEach(elm => elm.style.display = 'none')
    }
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

  let messagesContainer = getMessagesContainer()

  let lastScrollvalue = 0

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
    // setLastScrollvalue(currScroll);
    lastScrollvalue = currScroll

  });

  const [msgImg, setMsgImg] = useState(null);

  function handleImgActionCLick(action, src) {
    if (action === "Download") downloadImage(src)

    let img = document.querySelector('.messageImage')
    if (action === "Zoom-in") zoomInImage(img)
    if (action === "Zoom-out") zoomOutImage(img)

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
  // console.log(messages, skipFromCompare);
  // console.log(chatMessages, chatMessagesCompare);

  useEffect(() => {
    // this socket is only for the user who send the lastestmesssage in the chat not for the user who seen the latestMessage in that chat!
    if (user && user._id) {
      socket?.on('seen messages', async (room, totalMessages, updatedChat) => {

        if (seenCount < 1) {

          !seenCount && seenCount++

          // console.log(updatedChat, 'updatedChat');
          // console.log(updatedChat, chats.map(ch => {
          //   if (ch._id === updatedChat._id) ch = updatedChat
          //   return ch
          // })); 

          setChats(chats.map(chat => {
            if (chat._id === updatedChat._id) chat = updatedChat
            return chat
          }))
          // console.log(user,messages[messages.length - 1].sender,messages[messages.length - 1]);
          const limit = getSelectedChatDownloadedMsgs(room)?.length

          // console.log('=============================', limit, totalMessages);

          let skip = totalMessages - limit

          const messages = await loadMessages(room, skip, limit + 1)
          messages && console.log()

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

          setTimeout(() => {
            seenCount = 0
          }, 300);
        }

      })
    }
    // eslint-disable-next-line
  }, [user]);
  // console.log(skipFromCompare, selectedChatCompare?.totalMessages);

  // console.log(chatMessagesCompare);
  const getProperInfoMsg = (message) => {
    const seperatedMsg = message.split(' ')
    return (seperatedMsg[0] === user?.name?.split(' ')[0]
      ?
      'you ' : seperatedMsg[0] + " ")
      +
      seperatedMsg.slice(1, seperatedMsg.length - 1).join(' ') + " "
      +
      (seperatedMsg[seperatedMsg.length - 1] === user?.name.split(" ")[0]
        ?
        'you ' : seperatedMsg[seperatedMsg.length - 1])
  }

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
              loading
              &&
              <Box position={'absolute'} zIndex={"99"} textColor={"blackAlpha.700"} display={"flex"} gap={".2rem"} boxShadow="0 0 3px rgba(0,0,0,.3)" width={"fit-content"} bg={"white"} left={"50%"} transform={'translate(-50%,0)'} top={"3px"} borderRadius={"1rem"} padding={".2rem 1rem"} fontSize={'.8rem'} alignItems={"center"}>
                <i>Loading History...</i>
                <img src="https://www.oceaneering.com/wp-content/plugins/bbpowerpack/assets/images/spinner.gif" style={{ width: "17px", height: "17px" }} alt="" />
              </Box>
            }
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
                    <Box key={i} className='singleMessageBar'>
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
                            fontSize={'.75rem'}
                          >{getMessageDay(m.createdAt)}</Text>
                        </Box>
                      }
                      {
                        !m.msgType || m.msgType === 'regular'
                          ?
                          <Box
                            key={i}
                            className='flex messageStrip'
                            width={"100%"}
                            justifyContent={m.sender._id === user?._id ? "flex-end" : "flex-start"}
                          >
                            <Box
                              flexDir={m.sender._id === user?._id && "row-reverse"}
                              pos={'relative'}
                              display={"flex"}
                              gap=".5rem"
                              maxW={m.sender._id !== user?._id && window.innerWidth < 770 ? "85%" : "75%"}>

                              {
                                ((!m?.deleted?.value) || (m?.deleted.value && m?.deleted.for === 'myself') && m.sender._id !== user._id)
                                &&
                                <MessageActions message={m} user={user} />
                              }


                              {(window.innerWidth > 770 ? m.sender : m.sender._id !== user?._id) &&
                                (window.innerWidth < 770
                                  || (islastMsgOfSender(messages, i, m.sender._id)
                                    || isLastMsgOfTheDay(m.createdAt, messages, i)
                                    || islastRegularMsgOfSender(messages, i, m.sender._id))) &&
                                <Box
                                  display={"flex"}
                                  flexDir="column"
                                  justifyContent={m.sender._id === user?._id && "flex-end"}>
                                  <Tooltip isDisabled={isHoverDisable} hasArrow label={selectedChat?.isGroupchat ? (user?._id === m.sender._id ? "My Profile" : m.sender.name) : (user?._id === m.sender._id ? "My Profile" : m.sender.name)} placement="top">
                                    <Avatar
                                      loading='lazy'
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
                                fontSize={".95rem"}
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
                                  (!islastMsgOfSender(messages, i, m.sender._id) && !isLastMsgOfTheDay(m.createdAt, messages, i) && !islastRegularMsgOfSender(messages, i, m.sender._id))
                                  &&
                                  (m.sender._id !== user?._id)
                                  &&
                                  "2.5rem"}

                                marginRight={window.innerWidth > 770
                                  &&
                                  (!islastMsgOfSender(messages, i, m.sender._id) && !isLastMsgOfTheDay(m.createdAt, messages, i) && !islastRegularMsgOfSender(messages, i, m.sender._id))
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
                                  <Text
                                    fontSize={".7rem"}
                                    fontWeight="normal"
                                    _hover={{ "textDecoration": "underline" }}
                                    w={'fit-content'}
                                    cursor={"pointer"}
                                    onClick={(e) => handleMessageAvatarClick(m.sender._id === user?._id ? user : m.sender, i, e)}>
                                    {m.sender.name.split(" ")[0]}
                                  </Text>
                                }
                                <Box paddingLeft={(m.sender._id !== user?._id && islastMsgOfSender(messages, i, m.sender._id)) && ".0rem"}>
                                  {
                                    (m?.deleted?.value && m?.deleted?.for === 'everyone') || (m?.deleted?.value && m?.deleted?.for === 'myself' && m.sender._id === user?._id)
                                      ?
                                      <MessageDeletedText flexDir={m.sender._id === user?._id ? 'row-reverse' : 'row'} iconSize={4} message={m} />
                                      :
                                      m.content.img
                                        ?
                                        <>
                                          <Box maxW={"35rem"} >
                                            <Box width={"100%"} backgroundImage={!msgImg && `url(${m.content.img})`} backgroundPosition="center">
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
                                            </Box>
                                            <Linkify options={{ target: 'blank' }}><Text paddingTop={".6rem"} >{m.content?.message}</Text></Linkify>
                                          </Box>
                                        </>
                                        :
                                        <Linkify options={{ target: 'blank', style: { color: 'red', fontWeight: 'bold' } }} className="linkify"><Text>{m.content.message}</Text></Linkify>
                                  }

                                </Box>

                                <Text pos={"absolute"} fontSize={".6rem"} right=".4rem" color={"black !important"} textShadow="none !important" display={"flex"} gap=".3rem">
                                  {getMsgTime(m.createdAt)}
                                  {
                                    m.sender._id === user?._id && !m?.deleted?.value
                                    &&
                                    <Image filter={`${m?.seenBy.length === selectedChat?.users?.length && 'hue-rotate(90deg)'}`} src={m.seenBy.length !== selectedChat.users.length ? unSeenCheckMark : seenCheckMark} opacity={m.seenBy.length !== selectedChat.users.length && ".5"} width=".95rem" display="inline-block" />
                                  }
                                </Text>

                              </Box>
                            </Box>
                          </Box>
                          :
                          m.msgType === 'info'
                          &&
                          <Box display={"flex"} justifyContent={"center"}>
                            <Text
                              textAlign={"center"}
                              bg={"rgba(0,0,0,.1)"}
                              boxShadow={"1px 1px 2px rgba(0,0,0,.1)"}
                              padding={".15rem 1.5rem"}
                              borderRadius={".5rem"}
                              fontSize={".75rem"}
                              fontWeight={"medium"}
                              margin={"0rem 0 .5rem 0"}
                            >
                              {
                                getProperInfoMsg(m.content.message)
                              }
                            </Text>
                          </Box>

                      }
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

export default MessagesBox
