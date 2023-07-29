import { Avatar, AvatarBadge, Box, Image, Text, Tooltip } from '@chakra-ui/react'
import { getFormmatedDate, getFormmatedTime, weekDays } from '../configs/dateConfigs'
import React, { useEffect } from 'react'
import { getSender, isUserOnline } from '../configs/userConfigs'
import ChatsTopBar from './Materials/ChatsTopBar'
import ProfileDrawer from './Materials/ProfileDrawer'
import { ChatState } from '../Context/ChatProvider'
import { useNavigate } from 'react-router-dom'
import ChatMenuBox from './Materials/ChatMenuBox'
import ChatFooter from './ChatFooter'
import { ChatsSkeleton } from './Materials/Loading'
import { defaultPic } from '../configs/ImageConfigs'


function ChatsBox() {

  const { chats, archivedChats, viewArchivedChats, setChats, chatsLoading, user, selectedChat, setProfile, profile, notifications, setNotifications } = ChatState()

  const navigate = useNavigate();

  const getDateTime = (timeStamps) => {
    let date = new Date(timeStamps)
    let DateTime;

    let FormattedTime = getFormmatedTime(date)
    let FormattedDate = getFormmatedDate(date);

    let currdate = new Date();

    let dayDiff = currdate.getDate() - date.getDate()

    if (date.getYear() === currdate.getYear() && date.getMonth() === currdate.getMonth()) {
      if (dayDiff === 0) {
        DateTime = FormattedTime
      } else if (dayDiff === 1) DateTime = "Yesterday"
      else if (dayDiff < 7) return weekDays[date.getDay()]
      else DateTime = FormattedDate
    }
    else {
      DateTime = FormattedDate
    }

    return DateTime
  }

  const handleChatClick = (chat) => {
    navigate(`/chats/chat/${chat._id}`);
    setProfile(null);
  }

  useEffect(() => {

    // This logic will instantely remove green color from datetime of latestMessage of selectedChat to indicate user that new message in this chat has been seen
    let elem = document.getElementById(`DateTime${selectedChat?._id}`)
    if (elem && elem.classList.contains('unSeen')) {
      elem.classList.remove('unSeen');
    }

    let elm = document.getElementById(`unseenMsgsCount${selectedChat?._id}`);
    if (elm && elm.style.display !== "none") elm.style.display = "none"

    let updatedChats = chats?.map(c => {
      if (c._id === selectedChat?._id) {
        if (c.unseenMsgsCountBy) c.unseenMsgsCountBy[user?._id] = 0
        if (c.latestMessage) c.latestMessage.seenBy.push(user?._id)
      }
      return c;
    });

    setChats(updatedChats);

    notifications.length && setNotifications(notifications.filter(noti => noti.chat._id !== selectedChat?._id))

    // eslint-disable-next-line
  }, [selectedChat?._id]);

  const getFormmatedInfoMsg = (latestMessage) => {

    const seperatedMsg = latestMessage?.content.message.split(' ')

    return (seperatedMsg.slice(1, seperatedMsg.length - 1).join(' ')
      +
      " " + (seperatedMsg[seperatedMsg.length - 1] === user?.name.split(' ')[0]
        ?
        "you"
        :
        seperatedMsg[seperatedMsg.length - 1]))
  }

  return (
    <Box pos={"relative"} display={{ base: selectedChat ? "none" : "block", md: selectedChat ? "none" : "block", lg: "block" }} className='chatsBox' height={"100%"} width={{ base: "100%", md: "100%", lg: "36%" }} boxShadow="0 0 0 2px rgba(0,0,0,.3)">
      <ChatsTopBar />
      <Box pos={"relative"} height={"calc(100% - 10.2rem)"} className="allchatsBox" paddingBottom={{ base: ".7rem", md: ".2rem" }}>
        {
          profile && profile._id === user._id &&
          <ProfileDrawer width="full" align="left" />
        }
        {
          (!chatsLoading && !viewArchivedChats && (archivedChats.length > 0 && chats.length < 1)) &&
          <Box textAlign={"center"} marginTop="7rem">
            <Text fontSize={'1.4rem'}>
              {"You have " + archivedChats.length + " Archived chat"}
            </Text>
            <br />
            <Text padding={"0 .3rem"}>
              Click  on  the  <b>Archived</b>  button  to the top left  corner  to  view  them
            </Text>
          </Box>
        }
        {
          (!chatsLoading && chats?.length === 0 && archivedChats.length === 0)
            ?
            <Box height={"100%"} display="flex" flexDir={"column"} justifyContent="center" alignItems={"center"} className='allchats hidetop' transition={".6s"}>
              <Image marginBottom={"4rem"} opacity=".3" width={{ base: "6rem", md: "10rem" }} src="https://cdn-icons-png.flaticon.com/512/3073/3073428.png" />
              <Text fontWeight={"medium"} >Haven't Created your first Chat Yet?</Text>
              <Text>No Problem!</Text>
              <br />
              <Text textAlign={"center"} fontWeight={"hairline"} >Let's go ahead and Search Users to Start your First Chat with them</Text>
            </Box>
            :
            (
              !chatsLoading && ((chats?.length > 0) || (archivedChats.length > 0))
            )
            &&
            <Box overflowY={"auto"} height={"100%"} display="flex" flexDir={"column"} gap=".2rem" margin=".2rem" className='allchats' transition={".6s"}>
              {
                // if we have something in the archivedChats and viewArchivedChats is sets to true then display ArchivedChats else unArchivedchats/chats
                (archivedChats.length && viewArchivedChats ? archivedChats : chats)?.map((chat, i) => {
                  return (
                    <Box
                      key={i}
                      onClick={() => { handleChatClick(chat, i) }}
                      display={"flex"}
                      width="100%"
                      bg={selectedChat?._id === chat?._id ? "#2da89f61" : "rgb(241,243,244)"}
                      boxShadow={selectedChat?._id === chat?._id && "inset 0 0 0 1.1px #2baca1;"}
                      padding={"0.7rem 0.5rem"}
                      gap="1rem"
                      alignItems={"center"}
                      className="singleChatBox"
                      cursor="pointer"
                      pos={"relative"}
                      _hover={{ base: { bg: "transperent" }, md: { bg: "#2da89f61" } }}
                    >
                      <Box maxWidth={"67px"} >
                        <Avatar boxShadow={"0 0 0 3px #27aea4"} src={getSender(chat, user)?.avatar || defaultPic} >
                          {
                            !(chat.isGroupchat)
                            &&
                            <Tooltip fontSize={".75rem"} label={isUserOnline(getSender(chat, user)) ? "online" : "offline"} placement="bottom-start">
                              <AvatarBadge
                                borderWidth="2px"
                                borderColor='#ffffff'
                                bg={isUserOnline(getSender(chat, user)) ? '#00c200' : "darkgrey"}
                                boxSize='.8em' />
                            </Tooltip>
                          }

                        </Avatar>
                      </Box>

                      <Box width={{ base: "calc(100% - 3.8rem)", md: "calc(100% - 4rem)" }}>
                        <Box display={"flex"} justifyContent="space-between" width={"100%"} marginBottom={".4rem"}>
                          <Box fontSize={"1rem"} fontWeight="semibold" className='flex' gap={".4rem"} w={"100%"} justifyContent={"space-between"}>
                            <Box className='flex' justifyContent={"flex-start"} gap={".7rem"}  maxW={"calc(100% - 7rem)"}>
                              <Text className='textEllipsis'>
                                {
                                  (window.innerWidth < 770 && getSender(chat, user)?.name.length) > 24
                                    ?
                                    `${getSender(chat, user)?.name.slice(0, 23)}...`
                                    :
                                    getSender(chat, user)?.name
                                }
                              </Text>
                              {chat?.mutedNotificationBy?.includes(user?._id)
                                &&
                                <Tooltip label="Notification muted" placement='top' fontSize={".8rem"}>
                                  <Image width={"1rem"} src='https://cdn-icons-png.flaticon.com/512/4175/4175297.png' />
                                </Tooltip>
                              }
                            </Box>
                            {chat.latestMessage &&
                              <Box className='flex' gap={".3rem"} translateX={"5px"}>
                                <Text 
                                  whiteSpace={"nowrap"}
                                  fontSize={".75rem"}
                                  fontWeight="normal"
                                  id={`DateTime${chat._id}`}
                                  padding={".0 .3rem"}
                                  className={`transformPaddingPlu flex ${(!(chat.latestMessage?.seenBy.includes(user?._id)) && selectedChat?._id !== chat._id) && "unSeen"}`}>
                                  <>{getDateTime(chat.latestMessage.createdAt)}</>
                                </Text>
                                {chat.unseenMsgsCountBy && ((chat.unseenMsgsCountBy[user?._id] > 0) && selectedChat?._id !== chat._id)
                                  &&
                                  <Box fontSize={".6rem"}
                                    marginRight={{ base: ".2rem", md: "0" }}
                                    boxShadow="0 0 1px rgba(0,0,0,.5)"
                                    fontWeight="semibold" minW={"1.2rem"} padding={".08rem .26rem"} paddingTop=".18rem" id={`unseenMsgsCount${chat._id}`} className='flex transformPaddingPlu' background={"#0dcc74"} borderRadius="50%" >
                                    <Text whiteSpace={"nowrap"} color={"white"}>{chat.unseenMsgsCountBy[user?._id] > 99 ? "99+" : chat.unseenMsgsCountBy[user?._id]}</Text>
                                  </Box>
                                }
                              </Box>
                            }
                          </Box>
                        </Box>

                        {/* latestmessage */}
                        <Box marginTop=".18rem" fontSize={".8rem"} fontWeight="black" display="flex" gap=".3rem" alignItems={'center'}>
                          <span>
                            {
                              chat.latestMessage
                                ?
                                (chat.latestMessage.sender._id === user?._id ? "You" : chat.latestMessage.sender.name.split(" ")[0]) + ": "
                                :
                                "Bot: "
                            }
                          </span>

                          <Text width={{ base: "calc(100% - 12%)", md: "calc(100% - 8%)" }} display={"inline-block"} fontWeight="normal" fontSize={".87rem"} whiteSpace={"nowrap"} textOverflow={'ellipsis'} overflowX={"hidden"} paddingRight={".4rem"}>
                            {chat.latestMessage
                              ?
                              chat.latestMessage.msgType && chat.latestMessage.msgType === 'info'
                                ?
                                <>{getFormmatedInfoMsg(chat?.latestMessage)}</>
                                :
                                <>{
                                  (chat.latestMessage.content.img ? <><i className="fa-regular fa-image" />&nbsp;{chat.latestMessage.content.img.substring(chat.latestMessage.content.img.lastIndexOf('.') + 1) === "gif" ? "gif" : "image"}</> : chat.latestMessage?.content.message)
                                }</>
                              :
                              "No message yet!"}
                          </Text>

                          <Box w={"fit-content"} display={"flex"} marginBottom={"-15px"} marginRight={{ base: "-5px", md: "-10px" }}>
                            {
                              chat.pinnedBy?.includes(user?._id)
                              &&
                              <Tooltip label="pinned" fontSize={".7rem"} placement="top">
                                <Box pos={""} width={"1.5rem"}>
                                  <Image w=".8rem" src="https://cdn-icons-png.flaticon.com/512/1274/1274749.png" />
                                </Box>
                              </Tooltip>
                            }

                            <ChatMenuBox chat={chat} i={i} />
                          </Box>
                        </Box>
                      </Box>

                    </Box>
                  )
                })
              }
            </Box>
        }
        {
          chatsLoading &&
          <Box marginTop=".4em" overflowY={"auto"} className='ChatsSkeletonBox' height={"100%"}>
            <ChatsSkeleton />
          </Box>
        }
      </Box>
      <ChatFooter />
    </Box>
  )
}

export default ChatsBox
