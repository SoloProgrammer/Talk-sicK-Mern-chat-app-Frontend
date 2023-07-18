import React, { useState, useEffect } from 'react'
import {
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Button,
    Input,
    Box,
    Image,
    FormControl
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { ChatState } from '../../Context/ChatProvider'
import UserListItem from '../../utils/UserListItem'
import SearchLoading from '../../utils/SearchLoading'
import EmptySearch from '../EmptySearch'
import { server } from '../../configs/serverURl'
import { HandleLogout } from '../../configs/userConfigs'
import { useNavigate } from 'react-router-dom'

function SideDrawer({ isOpen, onClose }) {

    const { showToast, setProfile, chats, CreateChat, archivedChats } = ChatState();

    const [keyword, setKeyword] = useState("")
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null);

    const navigate = useNavigate()

    const handleOnchange = (e) => {
        setResults(null)
        setKeyword(e.target.value);
    }
    useEffect(() => {
        setResults(null);
        setKeyword("");

        setTimeout(() => {
            isOpen && document.querySelector('.SearchInput')?.focus()
        }, 0);
    }, [isOpen])

    useEffect(() =>{
        isOpen && onClose()
         // eslint-disable-next-line
    },[navigate])

    const handleSearch = async (e) => {
        if (e.key === "Enter" || e.target.type === "button") {
            if (keyword === "") return showToast("*Required", "Please Enter Something to Search", "error", 3000, "top-left");

            try {
                setLoading(true)
                let config = {
                    headers: {
                        token: localStorage.getItem('token')
                    }
                }
                const res = await fetch(`${server.URL.local}/api/user/searchuser?search=${keyword}`, config)
                const json = await res.json()

                if (!json.status) HandleLogout()

                setResults(json.searchResults)
            } catch (error) {
                showToast("Error", error.message, "error", 3000)
            }
            setLoading(false)
        }
    }

    const handleAccesschat = async (user) => {

        onClose()
        if (!user) return showToast("Error", "Something went wrong", "error", 3000)

        if (chats.length === 0) return CreateChat(user._id, user.name)

        let isChat = false

        archivedChats.forEach((chat, _) => {
            if (!(chat.isGroupchat) && chat.users.map(u => u._id).includes(user._id)) {
                navigate(`/chats/chat/${chat._id}`)
                setProfile(null)
                isChat = true
            }
        })

        if (!isChat) {

            chats?.forEach((chat, i) => {
                if (!(chat.isGroupchat) && chat.users.map(u => u._id).includes(user._id)) {
                    navigate(`/chats/chat/${chat._id}`)
                    setProfile(null)
                    isChat = true
                }
                // if index of map reaches the length of the chats that means the chat has not yet created with the user so we are creating the chat now with that user!
                if (i === chats.length - 1 && !isChat) CreateChat(user._id, user.name)
            })
        }

    }

    return (
        <>
            <Drawer
                isOpen={isOpen}
                placement='left'
                onClose={onClose}
                size="xs"
            >
                <DrawerOverlay />
                <DrawerContent overflow={"none !important"}>
                    <DrawerCloseButton />
                    <DrawerHeader fontFamily={"sans-serif"} color="lightslategray" textDecor={"underline"}>Search or Start a New Chat..!</DrawerHeader>
                    <Box padding={"0 1.4rem .6rem 1.4rem"}>
                        <Box >
                            <FormControl width={"full"} display="flex" justifyContent={"space-between"} alignItems="center" gap={".5rem"} onKeyDown={handleSearch}>
                                <Input className='SearchInput' value={keyword} onChange={handleOnchange} variant={"filled"} placeholder='Search with Email or Name' />
                                <Button onClick={handleSearch}>
                                    <SearchIcon fontSize={"2lg"} m={1} />
                                </Button>
                            </FormControl>
                        </Box>
                    </Box>
                    <DrawerBody paddingTop={"0"}>
                        <Box display={"flex"} flexDir="column" gap={".5rem"} marginTop={5} overflowY={"auto"} padding={"0 0 0.5rem 0"} >
                            {
                                loading ? <SearchLoading /> : results?.map(u => {
                                    return <UserListItem key={u._id} user={u} handleFunc={handleAccesschat} />
                                })
                            }

                            {(!loading && results?.length === 0) && <EmptySearch size={"12rem"} />}

                            {
                                !loading && !results
                                && <Box m={3} display="flex" justifyContent={'center'} flexDir="column" alignItems={"center"} gap="1rem">
                                    <Image width={"140px"} src="https://cdn-icons-png.flaticon.com/512/190/190798.png"></Image>
                                    <span>Results will appear here..</span>
                                </Box>
                            }
                        </Box>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

        </>
    )
}

export default SideDrawer
