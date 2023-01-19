import { Avatar, Box, Image, Text } from '@chakra-ui/react'
import { getFormmatedDate, getFormmatedTime } from '../configs/dateConfigs'
import { server } from '../configs/serverURl'
import React, { useEffect } from 'react'
import { getSender, HandleLogout } from '../configs/userConfigs'
import ChatsTopBar from './Materials/ChatsTopBar'
import ProfileDrawer from './Materials/ProfileDrawer'

function ChatsBox({ chats, chatsLoading, user, selectedChat, setSelectedChat, setProfile, profile, showToast }) {

  const Trimlastestmsg = (msg) => {
    let trimInd = window.innerWidth > 1300 ? 50 : 30

    if (window.innerWidth > 500 && window.innerWidth < 770) {
      trimInd = 40
    } else if (window.innerWidth > 770 && window.innerWidth < 1000) {
      trimInd = 25
    } else if (window.innerWidth > 1000 && window.innerWidth < 1300) {
      trimInd = 30
    } else if (window.innerWidth <= 500) trimInd = 30

    return msg.slice(0, trimInd).length !== trimInd ? msg.slice(0, trimInd) : msg.slice(0, trimInd).concat(".....")
  }

  const getDateTime = (timeStamps) => {
    let date = new Date(timeStamps)
    let DateTime;

    let FormattedTime = getFormmatedTime(date)

    let currdate = new Date();

    let FormattedDate = getFormmatedDate(date)

    if (date.getYear() === currdate.getYear() && date.getMonth() === currdate.getMonth()) {
      if (currdate.getDate() - date.getDate() === 0) {
        DateTime = FormattedTime
      } else if (currdate.getDate() - date.getDate() === 1) DateTime = "Yesterday"
      else DateTime = FormattedDate
    }
    else {
      DateTime = FormattedDate
    }

    return DateTime
  }

  const seenMessage = async (msgId) => {

    try {

      let config = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem('token')
        },
        body: JSON.stringify({ msgId })
      }

      let res = await fetch(`${server.URL.production}/api/message/seenMessage`, config);

      if (res.status === 401) return HandleLogout();

      let json = await res.json();

      // ToDo gave an appropiatiate msg for the bad res[ponse from the server!
      if (!json.status) return

    } catch (error) {
      setSelectedChat(null)
      setProfile(null)
      showToast("Error", error.message, "error", 3000)
      return
    }

  }

  const handleChatClick = async (chat, i) => {
    setSelectedChat(chat);
  }

  useEffect(() => {

    let elem = document.getElementById(`DateTime${selectedChat?._id}`)
    elem?.classList.contains('unSeen') && elem.classList.remove('unSeen');

    selectedChat?.latestMessage && seenMessage(selectedChat.latestMessage._id)
    setProfile(null);
     // eslint-disable-next-line
  }, [selectedChat])

  return (
    <Box display={{ base: selectedChat ? "none" : "block", md: "block" }} className='chatsBox' height={"100%"} width={{ base: "100%", md: "40%", lg: "36%" }} boxShadow="0 0 0 2px rgba(0,0,0,.3)">
      <ChatsTopBar />
      <Box overflowY={"auto"} pos={"relative"} transition={".6s"} height={"calc(100vh - 7.3rem)"} className='allchats hidetop'>
        {
          profile && profile._id === user._id &&
          <ProfileDrawer width="full" align="left" />
        }
        {
          chats?.length === 0 ?
            <Box height={"100%"} display="flex" flexDir={"column"} justifyContent="center" alignItems={"center"}>
              <Image marginBottom={"4rem"} opacity=".3" width={{ base: "6rem", md: "10rem" }} src="https://cdn-icons-png.flaticon.com/512/3073/3073428.png"></Image>
              <Text fontWeight={"medium"} >Haven't Created your first Chat Yet?</Text>
              <Text>No Problem!</Text>
              <br />
              <Text textAlign={"center"} fontWeight={"hairline"} >Let's go ahead and Search Users to Start your First Chat with them</Text>
            </Box>
            :
            !chatsLoading &&
            <Box display="flex" flexDir={"column"} gap=".2rem" margin=".2rem" paddingBottom={"1.3rem"} >
              {
                chats?.map((chat, i) => {
                  return (
                    <Box
                      key={i}
                      onClick={() => { handleChatClick(chat, i) }}
                      display={"flex"}
                      width="100%"
                      bg={selectedChat?._id === chat?._id ? "#2da89f61" : "#e2e2e29e"}
                      boxShadow={selectedChat?._id === chat?._id && "inset 0 0 0 1.1px #2baca1;"}
                      padding={"0.7rem 0.5rem"}
                      gap="1rem"
                      alignItems={"center"}
                      className="singleChatBox"
                      cursor="pointer"
                      _hover={{ bg: "#2da89f61" }}
                    >
                      <Box maxWidth={"67px"} >
                        {getSender(chat, user)?.avatar === "" ?
                          <Avatar boxShadow={"0 0 0 3px #27aea4"} name={getSender(chat, user)?.name} />
                          : <Avatar boxShadow={"0 0 0 3px #27aea4"} src={getSender(chat, user)?.avatar} />
                        }
                      </Box>
                      <Box width={{ base: "calc(100% - 15%)", md: "calc(100% - 12%)" }}>
                        <Box display={"flex"} justifyContent="space-between" width={"100%"}>
                          <Text fontSize={"1rem"} fontWeight="semibold">{getSender(chat, user)?.name}</Text>
                          {chat.latestMessage &&
                            <Text
                              fontSize={".7rem"}
                              fontWeight="normal"
                              id={`DateTime${chat._id}`}
                              padding={".0 .3rem"}
                              className={`latestMessageDateTime flex ${!(chat.latestMessage.seenBy.includes(user?._id)) && "unSeen"}`}>
                              <>{getDateTime(chat.latestMessage.createdAt)}</>
                            </Text>}
                          {/* color="#35c697" */}
                        </Box>
                        {/* latestmessage */}
                        <Text fontSize={".9rem"} marginTop=".1rem">
                          <Text fontSize={".8rem"} fontWeight="black" display={"inline"}>
                            {chat.latestMessage
                              &&
                              (chat.latestMessage.sender._id === user?._id ? "You" : chat.latestMessage.sender.name.split(" ")[0]) + ": "}
                          </Text>
                          {Trimlastestmsg(chat.latestMessage ? chat.latestMessage.content.message : "No message yet!")}
                        </Text>
                      </Box>
                    </Box>
                  )
                })
              }
            </Box>
        }
        {
          chatsLoading &&
          <Box display={"flex"} justifyContent="center" alignItems={"center"} height={"100%"}>
            <Image width={"12rem"} src='https://miro.medium.com/max/600/1*beQRWt1uWdnQM_nqCwhJnA.gif'></Image>
          </Box>
        }
      </Box>
    </Box>
  )
}

export default ChatsBox
