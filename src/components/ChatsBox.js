import { Avatar, Box, Image, Text } from '@chakra-ui/react'
import { getSender } from '../configs/userConfigs'
import ChatsTopBar from './Materials/ChatsTopBar'
import ProfileDrawer from './Materials/ProfileDrawer'

function ChatsBox({ chats, chatsLoading, user, selectedChat, setSelectedChat, setProfile, profile }) {

  const Trimlastestmsg = (msg) => {
    let trimInd = window.innerWidth > 770 ? 55 : 30
    return msg.slice(0, trimInd).concat(".....")
  }

  return (
    <Box display={{ base: selectedChat ? "none" : "block", md: "block" }} className='chatsBox' height={"100%"} width={{ base: "100%", md: "40%", lg: "36%" }} boxShadow="0 0 0 2px rgba(0,0,0,.3)">
      <ChatsTopBar />
      <Box overflow={"hidden"} pos={"relative"} transition={".6s"} height={"calc(100% - 7rem)"} className='allchats hidetop'>
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
            <Box height={"100%"} display="flex" flexDir={"column"} gap=".4rem" margin=".5rem 0" >
              {
                chats?.map((chat, i) => {
                  return (
                    <Box
                      key={i}
                      onClick={() => { setSelectedChat(chat); setProfile(null) }}
                      display={"flex"}
                      width="100%"
                      bg={selectedChat && selectedChat._id === chat._id ? "#2da89f61" : "#e2e2e29e"}
                      padding={"0.7rem 0.5rem"}
                      gap="1rem"
                      alignItems={"center"}
                      cursor="pointer"
                      _hover={{ bg: "#2da89f61" }}
                    >
                      <Box maxWidth={"67px"} marginLeft=".6rem">
                        {getSender(chat, user)?.avatar === "" ?
                          <Avatar boxShadow={"0 0 0 3px #27aea4"} name={getSender(chat, user)?.name} />
                          : <Avatar boxShadow={"0 0 0 3px #27aea4"} src={getSender(chat, user)?.avatar} />
                        }
                      </Box>
                      <Box width={{ base: "calc(100% - 15%)", md: "calc(100% - 12%)" }}>
                        <Box display={"flex"} justifyContent="space-between" width={"100%"}>
                          <Text fontSize={"1rem"} fontWeight="semibold">{getSender(chat, user)?.name}</Text>
                          {/* <Text fontSize={".8rem"} fontWeight="normal"><i>{chat.latestMessage?.createdAt}</i></Text> */}
                          <Text fontSize={".8rem"} fontWeight="normal"><i>yesterday</i></Text>
                        </Box>
                        {/* latestmessage */}
                        <Text>{Trimlastestmsg("Hey hii how are you igidgsidg sdgyf sdfsd fs duydf idgfi dfg fydf yfd??")}</Text>
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
