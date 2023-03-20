import { Avatar, Box, Button, Image, Menu, MenuButton, MenuItem, MenuList, Text, Tooltip, useDisclosure } from '@chakra-ui/react'
import React from 'react'
import { ChatState } from '../../Context/ChatProvider'
import { BellIcon, ChevronDownIcon, SearchIcon } from '@chakra-ui/icons'
import SideDrawer from './SideDrawer';
import BrandLogo from '../../utils/BrandLogo';
import CreateGroupChat from './CreateGroupChat';
import { defaultPic, HandleLogout } from '../../configs/userConfigs';

import NotificationBadge from 'react-notification-badge';
import { Effect } from 'react-notification-badge';
import { useNavigate } from 'react-router-dom';
import NotificationsMenu from './NotificationsMenu';
import { LogoutIcon } from '../../configs/ImageConfigs';

function ChatsTopBar() {

    const { user, setProfile, profile, notifications, setNotifications, setSelectedChat, chats, archivedChats, viewArchivedChats, setViewArchivedChats } = ChatState();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const navigate = useNavigate()

    return (
        <>
            <Box zIndex={10} pos={"relative"} height={"5rem"} width="100%" background={"#27aea4"} boxShadow="0 0 3px rgba(0,0,0,.5)"
                display={"flex"} justifyContent="space-between" alignItems={"center"} padding="0 .3rem">
                <Box>
                    <Menu>
                        <MenuButton onClick={() => profile?._id === user?._id && setProfile(null)} className='userAvatarBtn' height="fit-content" as={Button} rightIcon={<ChevronDownIcon />} background="transperent'">
                            <Avatar className='userAvatar' transition=".3s" size={"md"} src={user?.avatar} />{' '}
                        </MenuButton>
                        <MenuList boxShadow={"0 0 3px rgba(0,0,0,.4)"}>
                            <MenuItem display={"flex"} gap=".5rem" alignItems={"center"} onClick={() => setProfile(user)} >
                                <Avatar size={"xs"} name={user?.name} src={user?.avatar} />{' '}
                                <span>My profile</span>
                            </MenuItem>
                            <div></div>
                            <MenuItem onClick={HandleLogout} display={"flex"} gap=".5rem" alignItems={"center"}>
                                <Image src={LogoutIcon}
                                    boxSize='1.4rem'
                                    borderRadius='full' />
                                <span>Logout</span>
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Box>
                <Box zIndex={1}>
                    <BrandLogo color="white" />
                </Box>
                <Box display={"flex"} justifyContent="space-evenly">
                    <Box>
                        <Tooltip label="Search" placement='bottom-end' borderRadius={".2rem"}>
                            <Box _active={{ boxShadow: "inset 0 0 0 22px #a2f1ec54" }}
                                _hover={{ boxShadow: "inset 0 0 0 25px #a2f1ec54" }}
                                width="fit-content"
                                cursor={"pointer"}
                                transition=".5s" borderRadius='full'
                                onClick={onOpen}
                                padding={".6rem"}>
                                <SearchIcon fontSize={window.innerWidth > 770 ? "1.3rem" : "2lg"} m={1} />
                            </Box>
                        </Tooltip>
                        <SideDrawer isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
                    </Box>
                    <Menu>
                        <Tooltip isDisabled={window.innerWidth < 770} label="Notifications" placement='bottom-end' borderRadius={".2rem"}>
                            <MenuButton p={1}
                                _active={{ boxShadow: "inset 0 0 0 18px #a2f1ec54" }}
                                _hover={{ boxShadow: "inset 0 0 0 18px #a2f1ec54" }}
                                transition=".5s" borderRadius='full'
                                padding={".3rem"}>
                                {notifications.length > 0 && <NotificationBadge className="notification_badge" pos="absolute" count={notifications.length} effect={Effect.SCALE} />}
                                <BellIcon fontSize={window.innerWidth > 770 ? "2rem" : "1.8rem"} m={1} />
                            </MenuButton>
                        </Tooltip>
                        <MenuList boxShadow={"0 0 3px rgba(0,0,0,.4)"} position={"left"} zIndex="10" >

                            {notifications.length > 0
                                ?
                                <NotificationsMenu chats={chats} setNotifications={setNotifications} navigate={navigate} defaultPic={defaultPic} notifications={notifications} />
                                :
                                <MenuItem>No notifications!</MenuItem>
                            }
                        </MenuList>
                    </Menu>
                </Box>

                {/* Create Group Chat Button Component */}
                <CreateGroupChat />

            </Box>


            <Box padding={".3rem"} borderBottom="2px solid darkcyan" background={"aliceblue"} pos="relative" zIndex={1}>
                {
                    archivedChats.length > 0 &&
                    <Box position={'absolute'} left="0" marginLeft={".4rem"} marginTop=".08rem" cursor={"pointer"}>
                        {
                            !viewArchivedChats
                                ?
                                <Box display={"flex"} gap=".3rem" alignItems={"center"} onClick={() => {
                                    setViewArchivedChats(true);
                                    navigate('/chats/archived')
                                }}>
                                    <Image src='https://cdn-icons-png.flaticon.com/512/8138/8138776.png' width={"1.1rem"} />
                                    <Text userSelect={"none"} fontWeight={"semibold"} fontSize=".86rem" >Archived</Text>
                                </Box>
                                :
                                <Box padding={".1rem .7rem"} background={"#c5eaff"} borderRadius=".2rem" border={"1px solid #31bac3"}>
                                    <Image onClick={() => {
                                        setViewArchivedChats(false);
                                        setSelectedChat(null);
                                        navigate('/chats')
                                    }} src='https://cdn-icons-png.flaticon.com/512/8979/8979605.png' width={"1.2rem"} />
                                </Box>
                        }
                    </Box>
                }
                <Text textAlign={"center"} textTransform="uppercase" fontStyle={"italic"} fontWeight="hairline">
                    {
                        viewArchivedChats ? "Archived chats" : "My chats"
                    }
                </Text>
            </Box>
        </>
    )
}

export default ChatsTopBar
