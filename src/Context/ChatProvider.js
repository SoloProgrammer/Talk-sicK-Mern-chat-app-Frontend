import { createContext, useState, useContext, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { server } from '../configs/serverURl';
import { HandleLogout } from '../configs/userConfigs';
const ChatContext = createContext();

import io from 'socket.io-client'

const ChatProvider = ({ children }) => {

    const toast = useToast();
    function showToast(title, msg, status, time, pos = "bottom-center") {
        toast({
            title: title,
            description: msg,
            status: status,
            duration: time,
            isClosable: true,
            position: pos
        });
    }

    const [user, setUser] = useState(null);

    const getUser = async () => {
        const config = {
            headers: {
                'token': localStorage.getItem('token')
            }
        }
        const res = await fetch(`${server.URL.production}/api/user/getuser`, config);
        return res.json()
    }


    //Socket.io connection with configuration........................................................

    const [socketConneted, setSocketConnected] = useState(false)

    const ENDPOINT = "http://localhost:8001"

    const [socket, setSocket] = useState(null);
    
    useEffect(() => {
        let socketCreated = io(ENDPOINT);
        setSocket(socketCreated)

        if (user) {
            socket.emit('setup', user);
            socket.on('connection', () => setSocketConnected(true))
        }
        console.log(socket);
    }, [user]);

    //Socket.io connection with configuration........................................................

    const [chats, setChats] = useState(null)

    const [selectedChat, setSelectedChat] = useState(null);

    const [isfetchChats, setIsfetchChats] = useState(null);

    const [profile, setProfile] = useState(null)

    const [chatsLoading, setChatsLoading] = useState(false)

    const CreateChat = async (userId) => {
        try {
            setChatsLoading(true)
            let config = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ userId })
            }

            let res = await fetch(`${server.URL.production}/api/chat`, config);

            if (res.status === 401) HandleLogout();

            let json = await res.json();

            if (!json.status) return showToast("Error", json.message, "error", 3000)

            setChats(json.chats)
            setChatsLoading(false)
            setSelectedChat(json.chat)
            setProfile(null)

        } catch (error) {
            showToast("Error", error.message, "error", 3000)
            setChatsLoading(false)
        }

    }


    return (
        <ChatContext.Provider value={{ CreateChat, chatsLoading, setChatsLoading, chats, setChats, profile, setProfile, user, showToast, setUser, getUser, selectedChat, setSelectedChat, isfetchChats, setIsfetchChats, socket }}>
            {children}
        </ChatContext.Provider>
    )
}

export const ChatState = () => {
    return useContext(ChatContext);
};

export default ChatProvider;