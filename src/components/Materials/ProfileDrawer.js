import { Avatar, Box, Button, Image, Input, Spinner, Text, Tooltip } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import { handleFileUpload } from '../../configs/handleFileUpload'
import { server } from '../../configs/serverURl'
import { HandleLogout } from '../../configs/userConfigs'
import { ChatState } from '../../Context/ChatProvider'
import DeleteChat from '../DeleteChat'
import GroupMembersBox from '../GroupMembersBox'


function ProfileDrawer({ width, align = "right" }) {
    const { setSelectedChat, archivedChats, setArchivedChats, selectedChat, user, profile, setProfile, onlineUsers, showToast, setUser, setChats, handlePinOrUnpinChat } = ChatState();

    // let regx = /^[a-zA-Z!@#$&()`.+,/"-]*$/g;

    const [profileDetail, setProfileDetail] = useState({
        name: profile?.name,
        about: profile?.about,
        email: profile?.email,
        phone: profile?.phone
    });

    const [isedit, setIsEdit] = useState(false);

    const regx = / {2}|\n/g

    const HandleDetailChange = (e) => {
        if (e.target.tagName === "TEXTAREA") {
            e.target.style.height = "0"
            e.target.style.height = e.target.scrollHeight + "px"
        }

        setProfileDetail({ ...profileDetail, [e.target.name]: e.target.name === "phone" ? Number(String(e.target.value).slice(0, 10)) : e.target.value })

    }

    let allInpts = document.querySelectorAll('.InptBox');

    const [saved, setSaved] = useState(true);

    const updateUserProfile = async (detailsToUpdate) => {

        setSaved(false)

        try {
            let config = {
                method: "PUT",
                headers: {
                    token: localStorage.getItem('token'),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(detailsToUpdate)
            }

            let res = await fetch(`${server.URL.local}/api/user/updateuser`, config);

            if (res.status === "401") return HandleLogout();

            let json = await res.json();

            if (!json.status) {
                showToast("Error", json.message, "error", 3000);
                setSaved(true)
                return
            }

            setUser(json.updatedUser);
            setSaved(true);
            setIsEdit(false)
            showToast("Success", json.message, "success", 3000)

        } catch (error) {
            return showToast("Error", error.message, "error", 3000)
        }
    }

    const updateGrpProfile = async (detailsToUpdate) => {

        setSaved(false)

        try {
            let config = {
                method: 'PUT',
                headers: {
                    token: localStorage.getItem('token'),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ chatId: selectedChat._id, detailsToUpdate })
            }

            let res = await fetch(`${server.URL.local}/api/chat/updategroup`, config);

            if (res.status === "401") HandleLogout();

            let json = await res.json();

            if (!json.status) {
                showToast("Error", json.message, "error", 3000);
                setSaved(true)
                return
            }

            setSaved(true);

            setSelectedChat({ ...selectedChat, ...detailsToUpdate });

            // if the group to update is archived then update the archived chats
            setArchivedChats(json.chats.filter(c => c.archivedBy.includes(user?._id)))

            // updating chats if group is not archived!
            setChats(json.chats.filter(c => !(c.archivedBy.includes(user?._id))));

            showToast("Success", json.message, "success", 3000)

        } catch (error) {

        }
        setIsEdit(false)
    }

    const HandleDetailSave = () => {

        let isChanged = false;

        Object.keys(profileDetail).forEach(key => {
            if (profileDetail[key] && profileDetail[key].replace(regx, "") !== profile[key]) isChanged = true
        })

        if (isChanged) {
            if (profile.isGrpProfile) {
                if (profileDetail.name.length === 0) {
                    return showToast("Required", `Groupname cannot be empty..!`, "error", 3000);
                }
            }

            let isProcessable = true;

            profile?._id === user?._id && Object.keys(profileDetail).forEach(k => {
                // checking for key !== phone bcz phone is not required field so it can be empty.....!
                if (profileDetail[k].length === 0 && k !== "phone") {
                    showToast("Required", `${k} field cannot be empty..!`, "error", 3000);
                    isProcessable = false
                }
            });

            if (isProcessable) {

                if (profileDetail.phone && String(profileDetail.phone).length < 10) {
                    return showToast("Invalid", "Phone cannot have less than 10 digits", "error", 3000)
                }

                profile?._id === user?._id && setProfileDetail({ ...profileDetail, about: profileDetail.about.replace(regx, " ") })

                if (profile?._id === user?._id) {
                    updateUserProfile(profileDetail);
                    setProfile({ ...profile, ...profileDetail })
                } else {
                    updateGrpProfile({ chatName: profileDetail.name });
                    setProfile({ ...profile, ...profileDetail })
                }

            }
        }
        else {
            setIsEdit(false);
            setProfileDetail({ ...profileDetail, about: profileDetail.about.replace(regx, " ") })
        }
    }

    useEffect(() => {
        if (isedit) {
            showToast("Edit Access", "Now you can edit details by clicking onto particular one!", "success", 3000)
        }
        allInpts.forEach(inpt => inpt.classList.remove('active'))
        // eslint-disable-next-line
    }, [isedit]);

    const handleSetEdit = () => {
        setIsEdit(true)
        setTimeout(() => {
            let allInpts = document.querySelectorAll('.InptBox')
            document.querySelector('.nameInpt')?.focus()
            allInpts.forEach(inpt => inpt.classList.add('active'));

            let elm = document.getElementById('profileDetailInpt_about')
            elm.style.height = `${elm?.scrollHeight}px`
        }, 10);
    }

    useEffect(() => {
        setTimeout(() => {
            document.querySelector('.DrawerInner')?.classList.remove('TopHide')
        }, 380)
    }, [profile]);

    const [onHover, setOnHover] = useState(false);

    const [avatarLoading, setAvatarLoading] = useState(false);

    const handleProfileAvatarChange = async (e) => {

        setSaved(false)

        let avatar = await handleFileUpload(e, setAvatarLoading, showToast);
        if (avatar) {
            if (profile?._id === user._id) {
                setProfile({ ...profile, avatar });
                updateUserProfile({ avatar });
            }
            else {
                setProfile({ ...profile, avatar })
                updateGrpProfile({ groupAvatar: avatar })
            }
        }
    }

    return (
        <Box
            className={`profileDrawer ${align === "right" ? "right0 translateXFull maxWidth520" : "left0 translateXFull-"}`}
            width={{ base: "full", md: width }}
            pos={"absolute"}
            transition="all .3s"
            zIndex={"2"}
            top="0"
            overflowY="auto"
            height={`${window.innerWidth > 770 ? `calc(100vh - ${profile?._id === user?._id ? "11rem" : "10.1rem"})` : `calc(100vh - ${profile?._id === user?._id ? "12rem" : "9.6rem"})`}`}
            paddingBottom={"1rem"}
            boxShadow={"0 0 4px rgb(0 0 0 / 30%)"}
            background="white">
            <Box className='DrawerInner TopHide' display={"flex"} flexDir="column" justifyContent={"flex-start"} gap={".5rem"} alignItems="flex-start" width={"full"} pos="relative" padding={"0 .53rem"} paddingTop="1rem" >

                <Box onClick={() => setProfile(null)} cursor={"pointer"} pos={"absolute"} left=".8rem" top={".8rem"}>
                    <Tooltip label="Close" placement='bottom'>
                        <Image width="2rem" src="https://cdn-icons-png.flaticon.com/512/2763/2763138.png" />
                    </Tooltip>
                </Box>

                {
                    (user?._id === profile?._id || selectedChat?.isGroupchat) &&
                    <Box pos={"absolute"} right='1rem' cursor={"pointer"}>
                        {
                            !saved
                                ?
                                <Spinner cursor={'progress'} size={'lg'} color="#08a673" />
                                :
                                !isedit
                                    ?
                                    <Tooltip label="Edit" placement='bottom'>
                                        <Image onClick={handleSetEdit} width={"2rem"} src='https://cdn-icons-png.flaticon.com/512/1160/1160758.png' />
                                    </Tooltip>
                                    :
                                    <Tooltip label="save" placement='bottom'>
                                        <Image onClick={HandleDetailSave} cursor="pointer" src='https://cdn-icons-png.flaticon.com/512/1293/1293029.png' width={"2rem"} />
                                    </Tooltip>

                        }
                    </Box>
                }

                <Box className='profile_details' width={"full"} padding={{ base: "0rem .8rem", md: "0" }} >
                    <Box className='flex' flexDir={"column"} width="100%">
                        <label htmlFor="profileAvatarOnchange">
                            <Avatar onMouseEnter={() => setOnHover(true)} onMouseLeave={() => setOnHover(false)} cursor={"pointer"} overflow={"hidden"} src={profile?.avatar} width="11rem" height={"11rem"} position="relative" >
                                {
                                    (profile?._id === user?._id || selectedChat?.isGroupchat)
                                    &&
                                    <>
                                        <Input onChange={handleProfileAvatarChange} type="file" name="avatar" id="profileAvatarOnchange" display="none" />
                                        <Box display={onHover || isedit ? "flex" : "none"} background={"blackAlpha.500"} borderRadius={"."} width={"100%"} height="100%" pos={'absolute'} top="0" left={"0"} className="flex">
                                            {
                                                avatarLoading
                                                    ?
                                                    <Spinner size={'lg'} color="white" />
                                                    :
                                                    <Image cursor={"pointer"} filter={"invert(100%)"} width={"2rem"} src="https://cdn-icons-png.flaticon.com/512/2099/2099154.png" />

                                            }
                                        </Box>
                                    </>

                                }
                            </Avatar>
                        </label>
                        <Text fontSize={"2xl"} color="gray.500" fontWeight="semibold" pos={"relative"} width="full" className='flex' marginTop={".5rem"}>

                            {/* Profile name */}
                            <Box className='InptBox flex nameInptBox' gap={".5rem"} >
                                {
                                    isedit
                                        ?
                                        <input type="text"
                                            autoComplete="off"
                                            name="name"
                                            onChange={HandleDetailChange}
                                            disabled={!selectedChat?.isGroupchat && profile?._id !== user?._id}
                                            value={profileDetail.name}
                                            className="profileDetailInpt nameInpt"
                                            style={{ width: profileDetail.name.length + 1 + "ch" }}
                                            maxLength="30"
                                        />
                                        :
                                        <Text>
                                            {profileDetail.name}
                                        </Text>
                                }
                            </Box>

                            {/* the online and offline status should ponly be visible on user profile not group profile and that's why as only user profile has about property in it that's the reason we use about property to display user status if it's there! */}
                            {
                                (profile.about) && (onlineUsers.map(U => U.userId).includes(profile._id)
                                    ?
                                    <Text userSelect={"none"} fontSize={".7rem"} marginLeft=".5rem" borderRadius={".2rem"} padding=".1rem .4rem" paddingTop={".22rem"} display={"inline-block"} color={"#29b764"} letterSpacing=".01rem" background="#d0ffde">
                                        online
                                    </Text>
                                    :
                                    <Text userSelect={"none"} fontSize={".7rem"} marginLeft=".5rem" borderRadius={".2rem"} padding=".1rem .4rem" paddingTop={".22rem"} display={"inline-block"} color={"#3e4240"} letterSpacing=".01rem" background="#e0e0e0">
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
                            <Box className='InptBox flex' gap={".5rem"} padding=".9rem 0" width="100%">
                                {
                                    isedit
                                        ?
                                        <textarea type="text"
                                            autoComplete="off"
                                            name="about"
                                            onChange={HandleDetailChange}
                                            disabled={!selectedChat?.isGroupchat && profile?._id !== user?._id}
                                            value={profileDetail.about}
                                            className="profileDetailInpt"
                                            id='profileDetailInpt_about'
                                            style={{ width: profileDetail.about.length + "ch", textAlign: "center" }}
                                            maxLength="90"
                                            rows={1}
                                        />
                                        :
                                        <Text padding={"0 .5rem"} userSelect="none">
                                            {profileDetail.about}
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
                                        <Box className={`flex ${profile?._id === user?._id ? "disabledBg" : "InptBox"}`} gap={".5rem"} padding=".9rem 0" width="100%">
                                            {
                                                <input type="text"
                                                    name="email"
                                                    onChange={HandleDetailChange}
                                                    disabled={true}
                                                    value={profileDetail.email}
                                                    className="profileDetailInpt"
                                                    style={{ width: profileDetail.email.length + "ch" }}
                                                    maxLength="35"
                                                    autoComplete="off"
                                                />

                                            }
                                        </Box>
                                    </Box>
                                    <Box marginTop={".4rem"}>
                                        <Text fontWeight={"hairline"} fontSize=".9rem">Phone</Text>
                                        <Box className='InptBox flex' gap={".5rem"} padding=".9rem 0" width="100%">
                                            {
                                                isedit
                                                    ?
                                                    <input type="number"
                                                        name="phone"
                                                        placeholder={profileDetail.phone || "valid phone"}
                                                        onChange={HandleDetailChange}
                                                        disabled={!selectedChat?.isGroupchat && profile?._id !== user?._id}
                                                        value={profileDetail.phone || ""}
                                                        className="profileDetailInpt "
                                                        autoComplete="off"
                                                    // style={{ width: 12 + "ch" }}
                                                    />
                                                    :
                                                    <Text userSelect="none">
                                                        {profileDetail.phone || "Not provided"}
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
                    <Box padding={{ base: "0rem .8rem", md: "0 1.1rem" }} width="full" marginTop={".5rem"}>
                        <Button colorScheme={"red"} width="full" onClick={HandleLogout}>
                            LOG-OUT &nbsp;
                            <Image src='https://cdn-icons-png.flaticon.com/512/4034/4034229.png' width={"1.2rem"} />
                        </Button>
                    </Box>
                }


                {
                    (selectedChat?.isGroupchat && user?._id !== profile?._id)
                    &&
                    <Box className='flex' width={"100%"} padding={{ base: "0 .5rem", md: "0 1rem" }} paddingRight={{ base: ".15rem", md: ".5rem" }}>
                        <GroupMembersBox />
                    </Box>
                }

                {
                    (profile?._id !== user?._id && !profile?.isGrpProfile)
                    &&
                    <Box width={"100%"} marginTop={".5rem"} padding={{ base: "0 .8rem", md: "0 1.1rem" }} display="flex" flexDir={"column"} gap=".2rem">
                        <DeleteChat />
                    </Box>
                }

                {
                    (profile?._id !== user?._id && !archivedChats.map(c => c._id).includes(selectedChat?._id))
                    &&
                    <Box padding={{ base: "0 .8rem", md: "0 1.1rem" }} width={"100%"}>
                        <Box
                            onClick={() => handlePinOrUnpinChat(selectedChat)}
                            _hover={{ bg: "gray.200", boxShadow: "0 0 2px rgba(0,0,0,.1)" }}
                            padding=".4rem"
                            className='flex'
                            border={"1px solid rgba(0,0,0,.1)"}
                            transition=".4s all"
                            cursor={"pointer"}>
                            <Text className='flex' gap={".6rem"} color="blue.500" fontWeight={"medium"}>
                                <Image width="1.1rem" src={`${selectedChat?.pinnedBy?.includes(user?._id) ? "https://cdn-icons-png.flaticon.com/512/1274/1274749.png" : "https://cdn-icons-png.flaticon.com/512/1274/1274786.png"}`} />
                                {
                                    selectedChat?.pinnedBy.includes(user?._id)
                                        ?
                                        "Unpin chat"
                                        :
                                        "Pin chat"
                                }
                            </Text>
                        </Box>
                    </Box>
                }

            </Box>
        </Box>
    )
}

export default ProfileDrawer
