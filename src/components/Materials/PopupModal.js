import React, { useState, useEffect } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Text,
    Box,
    Input,
    Image,
    Avatar
} from '@chakra-ui/react'
import Loading from './Loading'
import { ChatState } from '../../Context/ChatProvider'
import UserListItem from '../../utils/UserListItem'
import EmptySearch from '../EmptySearch'
import { defaultPic, HandleLogout, UserChip } from '../../configs/userConfigs'
import { server } from '../../configs/serverURl'
import { useNavigate } from 'react-router-dom'

function PopupModal({ children, isOpen, onClose, addMember, handleFunc, addmemberLoading }) {

    const { showToast, selectedChat, setChats, setSelectedChat } = ChatState()

    const [selectedUsers, setSelectedUsers] = useState([])
    const [searchResults, setSearchResults] = useState(null)
    const [groupName, setGroupName] = useState("")

    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate()

    const HandleSearch = (e) => {
        setSearch(e.target.value);
        setLoading(true);
    }

    const SearchUsers = async () => {
        if (search.length > 0) {
            try {
                let config = {
                    headers: {
                        token: localStorage.getItem('token')
                    }
                }
                const res = await fetch(`${server.URL.production}/api/user/searchuser?search=${search}`, config);
                const json = await res.json();

                // let result = result1.filter(o1 => !result2.some(o2 => o1.id === o2.id));

                if (addMember) {
                    setSearchResults(json?.searchResults?.filter(u => !selectedChat?.users.some(U => U._id === u._id)).slice(0, 4))
                }
                else {
                    setSearchResults(json?.searchResults.slice(0, 4))
                }

            } catch (error) {
                showToast("Error", error.message, "error", 3000)
            }
        }
        else setSearchResults(null)

        setLoading(false)
    }

    useEffect(() => {

        let searchDelay = setTimeout(() => {
            SearchUsers()
        }, 200);

        // cleapUp function needed to 300ms delay in search.... 
        return () => { clearTimeout(searchDelay) }

        // eslint-disable-next-line
    }, [search])


    useEffect(() => {
        setSearchResults(null)
        setSelectedUsers([])
        setSearch("")
        setPic(null)
        setGroupName("")

        // eslint-disable-next-line
    }, [isOpen])

    const handleAddUsers = (user) => {
        if (!selectedUsers.some(u => u._id === user._id)) {
            setSelectedUsers([user, ...selectedUsers])
        }
    }

    const handleRemoveUsers = (user) => {
        setSelectedUsers(selectedUsers.filter(u => u._id !== user._id))
    }

    const [creategroupLoading, setCreategroupLoading] = useState(false)
    const handleCreateGroup = async () => {
        let users = selectedUsers.map(u => u._id)
        if (groupName === "") return showToast("Required*", "Please Provide a groupName!", "error", 3000)

        try {
            setCreategroupLoading(true)
            let config = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ users, groupName, groupAvatar: pic })
            }
            let res = await fetch(`${server.URL.production}/api/chat/creategroup`, config)

            if (res.status === 401) HandleLogout();

            const json = await res.json();
            if (!json.status) {
                setCreategroupLoading(false)
                return showToast("Error", json.message, "error", 3000)
            }

            showToast("Success", "New Group Created Sucessfully", "success", 3000);
            setCreategroupLoading(false);
            setChats(json.chats)
            setSelectedChat(json.Fullgroup)
            navigate(`/chats/chat/${json.Fullgroup._id}`)


            onClose()

        } catch (error) {
            return showToast("Error", error.message, "error", 3000)
        }

    }

    const [pic, setPic] = useState(null)
    const [uploadloading, setUploadloading] = useState(false)

    const HandleUpload = async (e) => {

        let pics = e.target.files[0]

        if (pics === undefined) {
            setPic(null)
            return showToast("Not Selected", "Please select an Image file", "warning", 3000)
        }
        if (pics.type === 'image/jpeg' || pics.type === 'image/png' || pics.type === 'image/jpg') {
            setUploadloading(true)
            const data = new FormData();
            data.append('file', pics);
            data.append('upload_preset', "Talk-o-Meter");
            data.append('cloud_name', "dvzjzf36i");

            const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dvzjzf36i/image/upload"
            let config = {
                method: "POST",
                body: data
            }
            try {
                let res = await fetch(CLOUDINARY_URL, config)
                let json = await res.json();
                setPic(json.url.toString())
                setUploadloading(false)
            } catch (error) {
                setUploadloading(false)
                return showToast("Seems some suspicious*", "Some error occured try again later", "error", 3000)
            }
        }
        else {
            return showToast("*Not accepted", "Please select an Image file", "warning", 3000)
        }
        // if (pics && pics[0]) {
        //     setUploadloading(true)
        // }
    }

    return (
        <>
            {children}
            <Modal size={'md'} isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <Box className='flex' gap={".6rem"} justifyContent="start">
                            <Text textTransform={'capitalize'} fontSize="1.5rem">
                                {addMember ? "Add a new group member" : "Create a Group"}
                            </Text>
                            <Image width={"2.5rem"} src='https://cdn-icons-png.flaticon.com/512/2990/2990282.png' />

                        </Box>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {!addMember && <Box display={"flex"} gap=".3rem" alignItems={{ base: "normal", md: "center" }} flexDir={{ base: "column", md: "row" }}>
                            <Box>
                                <Box className='flex' gap={"1rem"} justifyContent="start">
                                    <Image width={"2rem"} src='https://cdn-icons-png.flaticon.com/512/1828/1828469.png' />
                                    <Text fontWeight={'medium'} fontSize="lg">Group Name</Text>
                                </Box>
                                <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} variant='flushed' placeholder='Group name' />
                            </Box>
                            <Box>
                                <Box justifyContent={"space-between"} margin={{ base: ".5rem 0", md: "none" }} display={"flex"} flexDir={{ base: "row", md: "column" }} alignItems={"center"} gap=".5rem">
                                    <Box className='flex' gap={"1rem"} justifyContent="start">
                                        <input onChange={HandleUpload} accept="image/*" style={{ display: "none" }} id="icon-button-file" type="file" />
                                        <label style={{ cursor: "pointer" }} htmlFor="icon-button-file"><img width={30} src="https://cdn-icons-png.flaticon.com/512/1177/1177911.png" alt="Upload pic" /></label>
                                        <Text fontWeight={'medium'} fontSize="lg">Group Avatar</Text>

                                        {uploadloading && <Box zIndex={10} position={"absolute"} right={{ base: "4rem", md: "0rem" }}>
                                            <Loading size={"5rem"} src={"https://miro.medium.com/max/600/1*beQRWt1uWdnQM_nqCwhJnA.gif"} />
                                        </Box>}

                                    </Box>
                                    <Avatar name='Group Avatar' width={"2.5rem"} height="2.5rem" src={pic ? pic : defaultPic} />
                                </Box>
                            </Box>
                        </Box>}
                        {/* /This Text will act like a divider */}
                        <Text marginTop={".9rem"} />
                        <Box>
                            <Box className='flex' gap={"1rem"} justifyContent="start">
                                <Image width={"1.8rem"} src='https://cdn-icons-png.flaticon.com/512/1531/1531117.png' />
                                <Text fontWeight={'medium'} fontSize="lg">Search Member</Text>
                            </Box>
                            <Input value={search} onChange={HandleSearch} variant='flushed' placeholder='Eg :- Rohan, Mohan or Sohan ...' />
                        </Box>

                    </ModalBody>

                    {
                        (selectedUsers.length > 0) &&
                        <Box margin={".9rem 0"} display={"flex"} flexWrap="wrap" gap=".5rem" overflowX="auto" padding={"0 1.4rem"}>
                            {
                                selectedUsers?.map((u, i) => {
                                    return <UserChip key={i} user={u} handleFunc={handleRemoveUsers} />
                                })
                            }
                        </Box>
                    }

                    {
                        loading && <Loading size={"8rem"} src={"https://miro.medium.com/max/600/1*beQRWt1uWdnQM_nqCwhJnA.gif"} />
                    }

                    {
                        (!loading && searchResults?.length > 0)
                        && <Box padding={"0 1.4rem"} className='selectedUserschips flex' flexDir={"column"} width="100%" gap=".6rem" >
                            {
                                searchResults?.map((u, i) => {
                                    return <UserListItem key={i} user={u} handleFunc={handleAddUsers} />
                                })
                            }
                        </Box>
                    }

                    {
                        (!loading && searchResults?.length === 0) && <EmptySearch size={"9rem"} />
                    }
                    {
                        (searchResults?.length > 3 && !loading) &&
                        <Text margin={".9rem 1.4rem"} marginBottom="0rem" fontSize="0.7rem" fontWeight={'normal'} textTransform="capitalize">
                            <b>NOTE</b> :- if there are more than 3 searchResults of the same keyword we will display only 4 of them!
                        </Text>
                    }
                    {
                        addMember
                        && <Text margin={".9rem 1.4rem"} marginBottom="0rem" fontSize="0.7rem" fontWeight={'normal'} textTransform="capitalize">
                            <b>SEARCH NOTE</b> :- The members which are not in the group will be searched!
                        </Text>
                    }

                    {<ModalFooter>
                        {<Button display={(addMember && selectedUsers.length < 1) > 0 ? "none" : "flex"} isLoading={creategroupLoading || addmemberLoading} disabled={uploadloading || creategroupLoading || addmemberLoading} onClick={() => addMember ? handleFunc(selectedUsers) : handleCreateGroup()} colorScheme='teal' boxShadow={"0px 0px 2px rgba(0,0,0,.5)"} mr={3}>
                            {!addMember ? "Create" : "Add now"}
                        </Button>}
                    </ModalFooter>}
                </ModalContent>
            </Modal>
        </>
    )
}

export default PopupModal
