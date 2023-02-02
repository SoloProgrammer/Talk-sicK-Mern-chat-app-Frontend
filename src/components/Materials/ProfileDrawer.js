import { Avatar, Box, Button, Image, Text, Tooltip } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import { getSender, HandleLogout } from '../../configs/userConfigs'
import { ChatState } from '../../Context/ChatProvider'
import GroupMembersBox from '../GroupMembersBox'


function ProfileDrawer({ width, align = "right" }) {
    const { selectedChat, user, profile, setProfile, onlineUsers, showToast } = ChatState();

    const [userDetail, setUserDetail] = useState({
        name: (selectedChat && user?._id !== profile?._id) ? getSender(selectedChat, user)?.name : profile?.name,
        about: profile?.about,
        email: profile?.email,
        phone: profile?.phone || ""
    });

    const [save, setSave] = useState({
        name: false,
        about: false,
        email: false,
        phone: false,
    })

    const HandleDetailChange = (e) => {
        setSave({ ...save, [e.target.name]: true })
        if (!e.target.value.length) setSave({ ...save, [e.target.name]: false })
        e.target.width = e.target.value + "ch"
        setUserDetail({ ...userDetail, [e.target.name]: e.target.value || profile[e.target.name] })
    }
    let allInpts = document.querySelectorAll('.InptBox')

    const HandleDetailSave = (key) => {
        setSave({ ...save, [key]: false })
        setIsEdit(false)
    }
    
    const [isedit, setIsEdit] = useState(false);
    
    useEffect(() => {
        if (isedit) {
            showToast("Edit Access", "Now you can edit details by clicking onto particular one!", "success", 5000)
        }
        allInpts.forEach(inpt => inpt.classList.remove('active'))
        // eslint-disable-next-line
    }, [isedit]);

    const handleSetEdit = () => {
        setIsEdit(true)
        setTimeout(() => {
            let allInpts = document.querySelectorAll('.InptBox')
            document.querySelector('.nameInpt')?.focus()
            allInpts.forEach(inpt => inpt.classList.add('active'))
        }, 10);
    }

    return (
        <Box
            className={`profileDrawer ${align === "right" ? "right0 translateXFull maxWidth520" : "left0 translateXFull-"}`}
            width={{ base: "full", md: width }}
            height={"100%"}
            pos={"absolute"}
            transition="all .3s"
            zIndex={"2"}
            background="white">
            <Box className='DrawerInner' display={"flex"} flexDir="column" justifyContent={"flex-start"} gap={".5rem"} alignItems="flex-start" width={"full"} height="full" pos="relative" padding={"0 .53rem"} paddingTop="1rem">

                <Box onClick={() => setProfile(null)} cursor={"pointer"} pos={"absolute"} left=".8rem" top={".8rem"}>
                    <Tooltip label="Close" placement='bottom'>
                        <Image width="2rem" src="https://cdn-icons-png.flaticon.com/512/2763/2763138.png" />
                    </Tooltip>
                </Box>

                {
                    (user?._id === profile?._id || selectedChat?.isGroupchat) &&
                    <Box pos={"absolute"} right='1rem' cursor={"pointer"}>
                        {
                            !isedit
                                ?
                                <Tooltip label="Edit" placement='bottom'>
                                    <Image onClick={handleSetEdit} width={"2rem"} src='https://cdn-icons-png.flaticon.com/512/1160/1160758.png' />
                                </Tooltip>
                                :
                                <Tooltip label="save" placement='bottom'>
                                    <Image onClick={() => setIsEdit(false)} cursor="pointer" src='https://cdn-icons-png.flaticon.com/512/443/443138.png' width={"2rem"} />
                                </Tooltip>

                        }
                    </Box>
                }

                <Box className='profile_details' width={"full"} padding={{ base: "0rem .8rem", md: "0" }} >
                    <Box className='flex' flexDir={"column"} width="100%">
                        <Avatar src={profile?.avatar} width="11rem" height={"11rem"} />
                        <Text fontSize={"2xl"} color="gray.500" fontWeight="semibold" pos={"relative"} width="full" className='flex' marginTop={".5rem"}>

                            {/* Profile name */}
                            <Box className='InptBox flex nameInptBox' gap={".5rem"} >
                                <Tooltip label="save" placement='top'>
                                    <Image onClick={() => HandleDetailSave("name")} cursor="pointer" display={save.name && isedit ? "inline" : "none"} src='https://cdn-icons-png.flaticon.com/512/443/443138.png' width={"1.4rem"} />
                                </Tooltip>
                                {
                                    isedit
                                        ?
                                        <input type="text"
                                            autocomplete="off"
                                            name="name"
                                            onChange={HandleDetailChange}
                                            disabled={!selectedChat?.isGroupchat && profile?._id !== user?._id}
                                            value={userDetail.name}
                                            className="userDetailInpt nameInpt"
                                            style={{ width: userDetail.name.length + "ch" }}
                                            maxLength="25"
                                        />
                                        :
                                        <Text>
                                            {userDetail.name}
                                        </Text>
                                }
                            </Box>

                            {/* the online and offline status should ponly be visible on user profile not group profile and that's why as only user profile has about property in it that's the reason we use about property to display user status if it's there! */}
                            {
                                (profile.about) && (onlineUsers.map(U => U.userId).includes(profile._id)
                                    ?
                                    <Text fontSize={".7rem"} marginLeft=".5rem" borderRadius={".2rem"} padding=".1rem .4rem" paddingTop={".22rem"} display={"inline-block"} color={"#29b764"} letterSpacing=".01rem" background="#d0ffde">
                                        online
                                    </Text>
                                    :
                                    <Text fontSize={".7rem"} marginLeft=".5rem" borderRadius={".2rem"} padding=".1rem .4rem" paddingTop={".22rem"} display={"inline-block"} color={"#3e4240"} letterSpacing=".01rem" background="#e0e0e0">
                                        offline
                                    </Text>)
                            }

                        </Text>
                    </Box>

                    {/* Profile about */}
                    {
                        (user?._id === profile?._id || (!(selectedChat?.isGroupchat))) &&
                        <Box marginTop={"1.5rem"} className='flex' flexDir={"column"} gap=".4rem" alignItems={"flex-start"} padding={{ base: "0 0", md: "0 1rem" }} width={"full"}>
                            <Text
                                fontWeight={"bold"}
                                fontSize="1.2rem">
                                About
                            </Text>
                            <Box className='InptBox flex borderT-B' gap={".5rem"} padding=".9rem 0" width="100%">
                                <Tooltip label="save" placement='top'>
                                    <Image onClick={() => HandleDetailSave("about")} cursor="pointer" display={save.about && isedit ? "inline" : "none"} src='https://cdn-icons-png.flaticon.com/512/443/443138.png' width=
                                        {"1.4rem"} />
                                </Tooltip>
                                {
                                    isedit
                                        ?
                                        <input type="text"
                                            autocomplete="off"
                                            name="about"
                                            onChange={HandleDetailChange}
                                            disabled={!selectedChat?.isGroupchat && profile?._id !== user?._id}
                                            value={userDetail.about}
                                            className="userDetailInpt"
                                            style={{ width: userDetail.about.length + "ch" }}
                                            maxLength="70"
                                        />
                                        :
                                        <Text padding={"0 .5rem"} userSelect="none">
                                            {userDetail.about}
                                        </Text>

                                }
                            </Box>
                        </Box>
                    }

                    {/* Profile Contact */}
                    {
                        (user?._id === profile?._id || (!(selectedChat?.isGroupchat))) &&
                        <Box width={"full"} padding={{ base: "0 0", md: "0 1rem" }} marginTop=".6rem">
                            <Box className='flex' flexDir={"column"} gap=".4rem" alignItems={"flex-start"} width={"full"}>
                                <Text
                                    fontWeight={"bold"}
                                    fontSize="1.2rem">
                                    Contact
                                </Text>
                                <Box width={"full"}>
                                    <Box>
                                        <Text fontWeight={"hairline"} fontSize=".9rem">Email</Text>
                                        <Box className='InptBox flex borderT-B' gap={".5rem"} padding=".9rem 0" width="100%">
                                            <Tooltip label="save" placement='top'>
                                                <Image onClick={() => HandleDetailSave("email")} cursor="pointer" display={save.email && isedit ? "inline" : "none"} src='https://cdn-icons-png.flaticon.com/512/443/443138.png' width={"1.4rem"} />
                                            </Tooltip>
                                            {
                                                isedit
                                                    ?
                                                    <input type="text"
                                                        name="email"
                                                        onChange={HandleDetailChange}
                                                        disabled={!selectedChat?.isGroupchat && profile?._id !== user?._id}
                                                        value={userDetail.email}
                                                        className="userDetailInpt"
                                                        style={{ width: userDetail.email.length + "ch" }}
                                                        maxLength="35"
                                                        autocomplete="off"
                                                    />
                                                    :
                                                    <Text userSelect="none">
                                                        {userDetail.email}
                                                    </Text>

                                            }
                                        </Box>
                                    </Box>
                                    <Box marginTop={".4rem"}>
                                        <Text fontWeight={"hairline"} fontSize=".9rem">Phone</Text>
                                        <Box className='InptBox flex borderT-B' gap={".5rem"} padding=".9rem 0" width="100%">
                                            <Tooltip label="save" placement='top'>
                                                <Image onClick={() => HandleDetailSave("phone")} cursor="pointer" display={save.phone && isedit ? "inline" : "none"} src='https://cdn-icons-png.flaticon.com/512/443/443138.png' width={"1.4rem"} />
                                            </Tooltip>
                                            {
                                                isedit
                                                    ?
                                                    <input type="text"
                                                        name="phone"
                                                        placeholder={userDetail.phone === "" && "valid phone"}
                                                        onChange={HandleDetailChange}
                                                        disabled={!selectedChat?.isGroupchat && profile?._id !== user?._id}
                                                        value={userDetail.phone}
                                                        className="userDetailInpt "
                                                        autocomplete="off"
                                                        style={{ width: 12 + "ch" }}
                                                    />
                                                    :
                                                    <Text userSelect="none">
                                                        {userDetail.phone || "Not provided"}
                                                    </Text>

                                            }
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    }
                </Box>
                {
                    profile?._id === user?._id &&
                    <Box padding={{ base: "0rem .8rem", md: "0 1.1rem" }} width="full" marginTop={"1rem"}>
                        <Button colorScheme={"red"} width="full" onClick={HandleLogout}>
                            LOG-OUT &nbsp;
                            <Image src='https://cdn-icons-png.flaticon.com/512/4034/4034229.png' width={"1.2rem"}/>
                        </Button>
                    </Box>
                }


                {
                    (selectedChat?.isGroupchat && user?._id !== profile?._id)
                    &&
                    <Box className='flex' width={"100%"} padding="0 .5rem">
                        <GroupMembersBox />
                    </Box>
                }

            </Box>
        </Box>
    )
}

export default ProfileDrawer
