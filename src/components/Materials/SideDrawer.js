import React, { useState } from 'react'
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
    Text
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { ChatState } from '../../Context/ChatProvider'
import UserListItem from '../../utils/UserListItem'
import SearchLoading from '../../utils/SearchLoading'

function SideDrawer({ isOpen, onClose }) {

    const { showToast } = ChatState();

    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null)

    const handleOnchange = (e) => {
        setResults(null)
        setSearch(e.target.value);
    }

    const handleSearch = async () => {
        if (search === "") return showToast("*Required", "Please Enter Something to Search", "error", 3000, "top-left");

        try {
            setLoading(true)
            let config = {
                headers: {
                    token: localStorage.getItem('token')
                }
            }
            const res = await fetch(`/api/user/searchuser?search=${search}`, config)
            const json = await res.json()
            setResults(json.searchResults)
            setLoading(false)
        } catch (error) {

        }
    }

    const handleAccesschat = async (user) => {
        onClose()
        if (!user) return showToast("Error", "Something went wrong", "error", 3000)
        try {
            let config = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ userId: user._id })
            }
            let res = await fetch(`/api/chat`, config)
            let json = await res.json();

            if (json.createdChat) {
                return showToast("Talk-o-Meter reading", json.message, "success", 3000)
            }

            console.log(json)
        } catch (error) {
            return showToast('Error', error.message, "error", 3000)
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
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Search Users</DrawerHeader>
                    <DrawerBody>
                        <Box display="flex" justifyContent={"space-between"} alignItems="center" gap={".5rem"}>
                            <Input value={search} onChange={handleOnchange} variant={"filled"} placeholder='Search here... Eg = John' />
                            <Button onClick={handleSearch}>
                                <SearchIcon fontSize={"2lg"} m={1} />
                            </Button>
                        </Box>
                        <Box display={"flex"} flexDir="column" gap={".5rem"} marginTop={5}>
                            {
                                loading ? <SearchLoading /> : results?.map(u => {
                                    return <UserListItem key={u._id} user={u} handleFunc={handleAccesschat} />
                                })
                            }{
                                !loading && results?.length === 0
                                && <Box m={3} display="flex" justifyContent={'center'} flexDir="column" alignItems={"center"} gap="1rem">
                                    <Image size="xs" src="https://t4.ftcdn.net/jpg/04/26/08/51/240_F_426085199_q6YtlZR7McMNekrghgyetyoPZKTro0WV.jpg"></Image>
                                    <Text fontWeight={"bold"} fontSize={"xs"} textAlign={"center"}>No results found try with anaother word</Text>
                                </Box>


                            }{
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
