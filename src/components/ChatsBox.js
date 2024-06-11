import {
  Avatar,
  AvatarBadge,
  Box,
  Image,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import {
  getFormmatedDate,
  getFormmatedTime,
  weekDays,
} from "../configs/dateConfigs";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getSender,
  isUserOnline,
  isUserRemovedFromChat,
  removedFromChatUserLatestMesssage,
} from "../configs/userConfigs";
import ChatsTopBar from "./Materials/ChatsTopBar";
import ProfileDrawer from "./Materials/ProfileDrawer";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import ChatMenuBox from "./Materials/ChatMenuBox";
import ChatFooter from "./ChatFooter";
import { ChatsSkeleton } from "./Materials/Loading";
import {
  defaultGrpPic,
  defaultPic,
  seenCheckMark,
  unSeenCheckMark,
} from "../configs/ImageConfigs";
import MessageDeletedText from "./Materials/MessageDeletedText";
import { REACTION, INFO } from "../configs/messageConfigs";
import { isMobile } from "../pages/Chatpage";
import { getProperInfoMsg, isMsgDeletedBySender } from "./MessagesBox";
import { EVERYONE, MYSELF } from "./MessageActionMenu/MessageActions";
// import { useRipple } from 'react-use-ripple'

export function isMessageSeenByAll(msg) {
  let users = msg.chat.users;
  let seenUsers = msg.seenBy;
  let isSeen = true;
  users.forEach((u) => {
    if (!seenUsers.includes(u) && isSeen) isSeen = false;
  });
  return isSeen;
}

function ChatsBox() {
  const {
    chats,
    archivedChats,
    viewArchivedChats,
    setChats,
    chatsLoading,
    user,
    selectedChat,
    setProfile,
    profile,
    notifications,
    setNotifications,
    setAlertInfo,
  } = ChatState();

  const navigate = useNavigate();
  const location = useLocation();

  const getDateTime = (timeStamps) => {
    let date = new Date(timeStamps);
    let DateTime;

    let FormattedTime = getFormmatedTime(date);
    let FormattedDate = getFormmatedDate(date);

    let currdate = new Date();

    let dayDiff = currdate.getDate() - date.getDate();

    if (
      date.getYear() === currdate.getYear() &&
      date.getMonth() === currdate.getMonth()
    ) {
      if (dayDiff === 0) {
        DateTime = FormattedTime;
      } else if (dayDiff === 1) DateTime = "Yesterday";
      else if (dayDiff < 7) return weekDays[date.getDay()];
      else DateTime = FormattedDate;
    } else {
      DateTime = FormattedDate;
    }

    return DateTime;
  };

  const handleChatClick = (chat) => {
    const chatPath = `/chats/chat/${chat._id}`;
    if (location.pathname !== chatPath) {
      navigate(chatPath);
      setProfile(null);
    }
  };

  function isReactedToMsgDeleted(reactedMsg) {
    const reactedToMsg = reactedMsg?.content?.reactedToMsg;
    return isMsgDeletedBySender(reactedToMsg, user);
  }

  useEffect(() => {
    // This logic will instantely remove green color from datetime of latestMessage of selectedChat to indicate user that new message in this chat has been seen
    let elem = document.getElementById(`DateTime${selectedChat?._id}`);
    if (elem && elem.classList.contains("unSeen")) {
      elem.classList.remove("unSeen");
    }

    let elm = document.getElementById(`unseenMsgsCount${selectedChat?._id}`);
    if (elm && elm.style.display !== "none") elm.style.display = "none";

    let updatedChats = chats?.map((c) => {
      if (c._id === selectedChat?._id) {
        if (c.unseenMsgsCountBy) c.unseenMsgsCountBy[user?._id] = 0;
        if (c.latestMessage && !c.latestMessage.seenBy.includes(user?._id))
          c.latestMessage.seenBy.push(user?._id);
      }
      return c;
    });

    setChats(updatedChats);

    notifications.length &&
      setNotifications(
        notifications.filter((noti) => noti.chat._id !== selectedChat?._id)
      );

    // eslint-disable-next-line
  }, [selectedChat?._id]);

  function showAlert(msg) {
    setAlertInfo({ active: true, copy: msg });
    setTimeout(() => {
      setAlertInfo({ active: false, copy: "" });
    }, 3000);
  }

  console.log();

  return (
    <Box
      pos={"relative"}
      display={{
        base: selectedChat ? "none" : "block",
        md: selectedChat ? "none" : "block",
        lg: "block",
      }}
      className="chatsBox"
      height={"100%"}
      width={{ base: "100%", md: "100%", lg: "36%" }}
      boxShadow="0 0 0 2px rgba(0,0,0,.3)"
    >
      <ChatsTopBar />
      <Box
        pos={"relative"}
        height={"calc(100% - 10.2rem)"}
        className="allchatsBox"
        paddingBottom={{ base: ".7rem", md: ".2rem" }}
      >
        {profile && profile._id === user._id && (
          <ProfileDrawer width="full" align="left" />
        )}
        {!chatsLoading &&
          !viewArchivedChats &&
          archivedChats.length > 0 &&
          chats.length < 1 && (
            <Box textAlign={"center"} marginTop="7rem">
              <Text fontSize={"1.4rem"}>
                {"You have " + archivedChats.length + " Archived chat"}
              </Text>
              <br />
              <Text padding={"0 .3rem"}>
                Click on the <b>Archived</b> button to the top left corner to
                view them
              </Text>
            </Box>
          )}
        {!chatsLoading && chats?.length === 0 && archivedChats.length === 0 ? (
          <Box
            height={"100%"}
            display="flex"
            flexDir={"column"}
            justifyContent="center"
            alignItems={"center"}
            className="allchats hidetop"
            transition={".6s"}
          >
            <Image
              marginBottom={"4rem"}
              opacity=".3"
              width={{ base: "6rem", md: "10rem" }}
              src="https://cdn-icons-png.flaticon.com/512/3073/3073428.png"
            />
            <Text fontWeight={"medium"}>
              Haven't Created your first Chat Yet?
            </Text>
            <Text>No Problem!</Text>
            <br />
            <Text textAlign={"center"} fontWeight={"hairline"}>
              Let's go ahead and Search Users to Start your First Chat with them
            </Text>
          </Box>
        ) : (
          !chatsLoading &&
          (chats?.length > 0 || archivedChats.length > 0) && (
            <Box
              overflowY={"auto"}
              height={"100%"}
              display="flex"
              flexDir={"column"}
              gap=".2rem"
              margin=".2rem"
              className="allchats"
              transition={".6s"}
            >
              {
                // if we have something in the archivedChats and viewArchivedChats is sets to true then display ArchivedChats else unArchivedchats/chats
                (archivedChats.length && viewArchivedChats
                  ? archivedChats
                  : chats
                )?.map((chat, i) => {
                  let { latestMessage } = chat;
                  latestMessage =
                    (isUserRemovedFromChat(chat, user) &&
                      removedFromChatUserLatestMesssage(chat, user)) ||
                    (latestMessage?.msgType === "reaction" &&
                    isReactedToMsgDeleted(latestMessage)
                      ? latestMessage.content.lastregularMsg
                      : latestMessage);
                  return (
                    <SingleChatBox
                      key={i}
                      latestMessage={latestMessage}
                      i={i}
                      chat={chat}
                      selectedChat={selectedChat}
                      user={user}
                      showAlert={showAlert}
                      handleChatClick={handleChatClick}
                      getDateTime={getDateTime}
                    />
                  );
                })
              }
            </Box>
          )
        )}
        {chatsLoading && (
          <Box
            marginTop=".4em"
            overflowY={"auto"}
            className="ChatsSkeletonBox"
            height={"100%"}
          >
            <ChatsSkeleton />
          </Box>
        )}
      </Box>
      <ChatFooter />
    </Box>
  );
}

export default ChatsBox;

function SingleChatBox({
  latestMessage,
  i,
  chat,
  selectedChat,
  user,
  showAlert,
  handleChatClick,
  getDateTime,
}) {
  const { setProfilePhoto, isTyping, typingInfo } = ChatState();
  return (
    <Box
      onClick={() => {
        handleChatClick(chat, i);
      }}
      display={"flex"}
      width="100%"
      bg={selectedChat?._id === chat?._id ? "#2da89f4a" : "rgb(241,243,244)"}
      boxShadow={
        selectedChat?._id === chat?._id && "inset 0 0 0 1.1px #2baca1;"
      }
      padding={"0.7rem 0.5rem"}
      // minHeight={"70px !important"}
      gap="1rem"
      alignItems={"center"}
      className="singleChatBox"
      cursor="pointer"
      pos={"relative"}
      _hover={{ base: { bg: "transperent" }, md: { bg: "#2da89f4a" } }}
    >
      <Box maxWidth={"67px"}>
        <Avatar
          onClick={(e) => {
            e.stopPropagation();
            getSender(chat, user)?.avatar !== defaultPic &&
            getSender(chat, user)?.avatar !== defaultGrpPic
              ? setProfilePhoto(getSender(chat, user)?.avatar)
              : showAlert("No profile photo!");
          }}
          boxShadow={"0 0 0 2px #27aea4"}
          src={getSender(chat, user)?.avatar || defaultPic}
        >
          {!chat.isGroupchat && (
            <Tooltip
              fontSize={".7rem"}
              label={isUserOnline(getSender(chat, user)) ? "online" : "offline"}
              placement="bottom-start"
            >
              <AvatarBadge
                borderWidth="2px"
                borderColor="#ffffff"
                bg={
                  isUserOnline(getSender(chat, user)) ? "#00c200" : "darkgrey"
                }
                boxSize=".8em"
              />
            </Tooltip>
          )}
        </Avatar>
      </Box>

      <Box width={{ base: "calc(100% - 3.8rem)", md: "calc(100% - 4rem)" }}>
        <Box
          display={"flex"}
          justifyContent="space-between"
          width={"100%"}
          marginBottom={".4rem"}
        >
          <Box
            fontSize={"1rem"}
            fontWeight="semibold"
            className="flex"
            gap={".4rem"}
            w={"100%"}
            justifyContent={"space-between"}
          >
            <Box
              className="flex"
              justifyContent={"flex-start"}
              gap={".7rem"}
              maxW={"calc(100% - 7rem)"}
            >
              <Text className="textEllipsis">
                {(isMobile() && getSender(chat, user)?.name.length) > 24
                  ? `${getSender(chat, user)?.name.slice(0, 23)}...`
                  : getSender(chat, user)?.name}
              </Text>
              {chat?.mutedNotificationBy?.includes(user?._id) && (
                <Tooltip
                  label="Notification muted"
                  placement="top"
                  fontSize={".7rem"}
                >
                  <Image
                    width={"1rem"}
                    src="https://cdn-icons-png.flaticon.com/512/4175/4175297.png"
                  />
                </Tooltip>
              )}
            </Box>
            {latestMessage && (
              <Box className="flex" gap={".3rem"} translateX={"5px"}>
                <Text
                  whiteSpace={"nowrap"}
                  fontSize={".75rem"}
                  fontWeight="normal"
                  id={`DateTime${chat._id}`}
                  padding={".0 .3rem"}
                  className={`
                    transformPaddingPlu 
                    flex 
                    ${
                      !latestMessage?.seenBy.includes(user?._id) &&
                      selectedChat?._id !== chat._id &&
                      (latestMessage.msgType !== REACTION ||
                        chat.unseenMsgsCountBy[user?._id] > 0) &&
                      "unSeen"
                    }`}
                >
                  <>{getDateTime(latestMessage.createdAt)}</>
                </Text>
                {chat.unseenMsgsCountBy &&
                  chat.unseenMsgsCountBy[user?._id] > 0 &&
                  selectedChat?._id !== chat._id && (
                    <Box
                      fontSize={".6rem"}
                      marginRight={{ base: ".2rem", md: "0" }}
                      boxShadow="0 0 1px rgba(0,0,0,.5)"
                      fontWeight="semibold"
                      minW={"1.2rem"}
                      padding={".08rem .26rem"}
                      paddingTop=".18rem"
                      id={`unseenMsgsCount${chat._id}`}
                      className="flex transformPaddingPlu"
                      background={"#0dcc74"}
                      borderRadius="50%"
                    >
                      <Text whiteSpace={"nowrap"} color={"white"}>
                        {chat.unseenMsgsCountBy[user?._id] > 99
                          ? "99+"
                          : chat.unseenMsgsCountBy[user?._id]}
                      </Text>
                    </Box>
                  )}
              </Box>
            )}
          </Box>
        </Box>

        {/* latestmessage & Typing.. */}
        {isTyping &&
        !isUserRemovedFromChat(chat, user) &&
        typingInfo.length > 0 &&
        typingInfo?.map((tyInfo) => tyInfo.chatId).includes(chat?._id) ? (
          <Text
            marginTop={"-.05rem"}
            fontSize={".9rem"}
            fontWeight={"500"}
            color={"#00d30d"}
            letterSpacing={".02rem"}
            textTransform={"lowercase"}
          >
            {!chat?.isGroupchat
              ? "typing....."
              : typingInfo
                  .filter((tyInfo) => tyInfo.chatId === chat._id)[0]
                  .user.name.split(" ")[0] + " is typing....."}
          </Text>
        ) : (
          <Box
            marginTop=".18rem"
            fontSize={".8rem"}
            fontWeight="black"
            display="flex"
            gap=".3rem"
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            {/* This will show who sended the latestMessage - like this you: OR AnyXYz:  */}
            {(!latestMessage?.deleted?.value ||
              (latestMessage.deleted.for === EVERYONE &&
                latestMessage.sender?._id !== user?._id) ||
              latestMessage.deleted.for === MYSELF) &&
              latestMessage &&
              (latestMessage?.sender._id === user?._id
                ? "You"
                : latestMessage.sender.name.split(" ")[0]) + ": "}
            {/* The below logic is for showing the checkMark that represents message is seen/delivered */}
            {latestMessage &&
              !latestMessage?.deleted?.value &&
              latestMessage?.sender._id === user?._id &&
              latestMessage.msgType !== REACTION &&
              latestMessage.msgType !== INFO && (
                <Tooltip
                  label={`${
                    latestMessage.seenBy.length === chat.users.length
                      ? "seen"
                      : "dilivered"
                  }`}
                  fontSize={".7rem"}
                  placement="top"
                >
                  <Image
                    filter={`${
                      isMessageSeenByAll(latestMessage) && "hue-rotate(75deg)"
                    }`}
                    src={
                      !isMessageSeenByAll(latestMessage)
                        ? unSeenCheckMark
                        : seenCheckMark
                    }
                    opacity={!isMessageSeenByAll(latestMessage) && ".5"}
                    width=".95rem"
                    display="inline-block"
                  />
                </Tooltip>
              )}

            <Text
              width={{ base: "calc(100% - 12%)", md: "calc(100% - 8%)" }}
              display={"inline-block"}
              fontWeight="normal"
              fontSize={".87rem"}
              whiteSpace={"nowrap"}
              textOverflow={"ellipsis"}
              overflowX={"hidden"}
              paddingRight={".4rem"}
            >
              {latestMessage ? (
                latestMessage.deleted.value &&
                (latestMessage.deleted.for === EVERYONE ||
                  (latestMessage.deleted.for === MYSELF &&
                    latestMessage.sender._id === user?._id)) ? (
                  <MessageDeletedText iconSize={4} message={latestMessage} />
                ) : latestMessage.msgType &&
                  latestMessage.msgType === "info" ? (
                  // here we have to split the formmated message and slice and then join the sliced message from second index because in 1st index it has the sender name but we are showing the sender's name already to the left of the message like this - Pratham: created group "test" E.T.C
                  <>
                    {getProperInfoMsg(latestMessage?.content.message, user)
                      .split(" ")
                      .slice(1)
                      .join(" ")}
                  </>
                ) : (
                  <>
                    {latestMessage.content.img ? (
                      <>
                        <i className="fa-regular fa-image" />
                        &nbsp;
                        {latestMessage.content.img.substring(
                          latestMessage.content.img.lastIndexOf(".") + 1
                        ) === "gif"
                          ? "gif"
                          : "image"}
                      </>
                    ) : (
                      latestMessage?.content.message
                    )}
                  </>
                )
              ) : (
                "No message yet!"
              )}
            </Text>

            <Box
              w={"fit-content"}
              display={"flex"}
              marginBottom={"-15px"}
              marginRight={{ base: "-5px", md: "-10px" }}
            >
              {chat.pinnedBy?.includes(user?._id) && (
                <Tooltip label="pinned" fontSize={".7rem"} placement="top">
                  <Box pos={""} width={"1.5rem"}>
                    <Image
                      w=".8rem"
                      src="https://cdn-icons-png.flaticon.com/512/1274/1274749.png"
                    />
                  </Box>
                </Tooltip>
              )}

              <ChatMenuBox chat={chat} i={i} />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
