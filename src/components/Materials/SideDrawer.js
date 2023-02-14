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

    const { showToast, setProfile, chats, setChats, setChatsLoading } = ChatState();

    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null);

    const navigate = useNavigate()

    const handleOnchange = (e) => {
        setResults(null)
        setSearch(e.target.value);
    }
    useEffect(() => {
        setResults(null)
        setSearch("")
    }, [isOpen])

    const handleSearch = async (e) => {
        if(e.key === "Enter" || e.target.type === "button"){
                if (search === "") return showToast("*Required", "Please Enter Something to Search", "error", 3000, "top-left");
        
                try {
                    setLoading(true)
                    let config = {
                        headers: {
                            token: localStorage.getItem('token')
                        }
                    }
                    const res = await fetch(`${server.URL.production}/api/user/searchuser?search=${search}`, config)
                    const json = await res.json()
        
                    if (!json.status) HandleLogout()
        
                    setResults(json.searchResults)
                    setLoading(false)
                } catch (error) {
                    showToast("Error", error.message, "error", 3000)
                }
        }
    }

    const CreateChat = async (user) => {
        console.log("isyudg")
        setChatsLoading(true)
        try {
            let config = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ userId: user._id })
            }
            let res = await fetch(`${server.URL.production}/api/chat`, config)

            if (res.status === 401) HandleLogout();

            let json = await res.json();

            if (!json.status) return showToast("Error", json.message, "error", 3000)

            if (json.status) {
                console.log(json)
                setChatsLoading(false)
                setChats(json.chats)
                navigate(`/chats/chat/${json.chat._id}`)
                setProfile(null)
                return showToast("Talk-o-Meter reading", json.message, "success", 3000)
            }
           

        } catch (error) {
            return showToast('Error', error.message, "error", 3000)
        }
    }

    const handleAccesschat = async (user) => {
        onClose()
        if (!user) return showToast("Error", "Something went wrong", "error", 3000)
        let ischat = false

        chats?.map((chat, i) => {
            if (!(chat.isGroupchat) && chat.users.map(u => u._id).includes(user._id)) {
                navigate(`/chats/chat/${chat._id}`)
                setProfile(null)
                ischat = true
            }
            // if index of map reaches the length of the chats that means the chat has not yet created with the user so we are creating the chat now with that user!
            if (i === chats.length - 1 && !ischat) CreateChat(user)
            return 1
        })
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
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Search Users</DrawerHeader>
                    <DrawerBody>
                        <Box >
                            <FormControl width={"full"} display="flex" justifyContent={"space-between"} alignItems="center" gap={".5rem"}  onKeyDown={handleSearch}>
                                <Input value={search} onChange={handleOnchange} variant={"filled"} placeholder='Search here... Eg = John' />
                                <Button onClick={handleSearch}>
                                    <SearchIcon fontSize={"2lg"} m={1} />
                                </Button>
                            </FormControl>
                        </Box>
                        <Box display={"flex"} flexDir="column" gap={".5rem"} marginTop={5}>
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
