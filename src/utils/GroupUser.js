import React, { useState } from 'react'
import { Avatar, Box, Image, Text, Tooltip } from '@chakra-ui/react'
import { ChatState } from '../Context/ChatProvider'
import Loading from '../components/Materials/Loading'
import { HandleLogout } from '../configs/userConfigs'
import { server } from '../configs/serverURl'


function GroupUser({ u }) {

    const { user, selectedChat, showToast, setSelectedChat } = ChatState()

    const [addAdminLoading, setAddAdminLoading] = useState(false)
    const [removeAdminLoading, setRemoveAdminLoading] = useState(false)

    const handleFunc = async (userId,action) => {

        if(action === "removegroupAdmin"){
            if(selectedChat?.groupAdmin.length === 1){
                return showToast("Error","Plz First Add Some One as GroupAdmin in your Replacement","error",3000)
            }
        }

        action === "addgroupAdmin" ? setAddAdminLoading(true) : setRemoveAdminLoading(true);

        if (!userId) return showToast("Error", "UserId not there", "Error", 3000)
        try {
            let config = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ userId, chatId: selectedChat?._id })
            }

            let res = await fetch(`${server.URL.production}/api/chat/${action}`, config)

            if (res.status === 401) HandleLogout()

            let json = await res.json();

            if (!json.status) return showToast("Erorr", json.message, "error", 3000)

            if(json.chat){
                setSelectedChat(json.chat)
                if(action === "removegroupAdmin"){
                    if(!(json.chat?.groupAdmin.map(u => u._id).includes(user?._id))){
                        return showToast("Success","You are removed from the groupAdmin","success",3000)
                    }
                }
                showToast("Success",json.message,"success",3000)
            }
            action === "addgroupAdmin" ? setAddAdminLoading(false) : setRemoveAdminLoading(false)
        } catch (error) {
            showToast("Error",error.message,"error",3000)
        }
    }

    return (
        <Box
            margin={".4rem 0"}
            display={"flex"}
            gap="1rem"
            padding={".3rem .3rem"}
            bg={"#EDF2F7"}
            pos="relative"
            className='GroupUser'
            borderRadius=".3rem"
            _hover={{ bg: "#a3bad0", color: "white" }}
            width="99%"
            alignItems="center">

            <Avatar name={u.name} src={u.avatar} size="sm" />{' '}
            <Box>
                <b style={{ textTransform: "capitalize" }}>{u.name}</b>
                <Text wordBreak={"break-word"} fontSize={"sm"}>Email: {u.email}</Text>
            </Box>

            {
                (selectedChat?.isGroupchat) && selectedChat?.groupAdmin.map(u => u._id).includes(u._id) &&
                <Box className='flex Admin' justifyContent={"space-between"} pos={"absolute"} right=".3rem" top={".3rem"} padding=".2rem .4rem" borderRadius={".2rem"} background="#48f2e64a">
                    <Text fontSize={".7rem"} color="darkcyan" fontWeight={"medium"}>Admin</Text>
                    {
                        (selectedChat?.groupAdmin.map(u => u._id).includes(user?._id)) &&
                           ( !removeAdminLoading ?
                            <Tooltip label="Remove as Admin" placement='top'>
                                <Image
                                    cursor={ "pointer" }
                                    onClick={() => handleFunc(u._id,"removegroupAdmin")}
                                    width={".8rem"}
                                    marginLeft=".4rem"
                                    borderRadius="full"
                                    src="https://cdn-icons-png.flaticon.com/512/9351/9351415.png" />
                            </Tooltip>
                            :
                            <Box marginLeft={".3rem"}>
                                <Loading size={".9rem"} src={"https://bbmptax.karnataka.gov.in/images/loader.gif"} />
                            </Box>)
                    }
                </Box>

            }
            {
                (selectedChat?.isGroupchat) && !(selectedChat?.groupAdmin.map(u => u._id).includes(u._id)) &&
                <Box pos={"absolute"} right=".3rem" top={".3rem"} padding=".2rem .4rem">
                    {
                    (selectedChat?.groupAdmin.map(u => u._id).includes(user?._id)) &&
                        (!addAdminLoading ?
                        <Tooltip label="Make as Admin" placement='top'>
                            <Image
                                cursor={"pointer"}
                                onClick={() => handleFunc(u._id,"addgroupAdmin")}
                                width={{base:"1.3rem",md:"1.5rem"}}
                                borderRadius="full"
                                src="https://cdn-icons-png.flaticon.com/512/1301/1301464.png" />
                        </Tooltip>
                        :
                        <Loading size={"1.5rem"} src={"https://bbmptax.karnataka.gov.in/images/loader.gif"} />)
                    }
                </Box>

            }
        </Box>
    )
}

export default GroupUser
