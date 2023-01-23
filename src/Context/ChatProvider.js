import { createContext, useState, useContext, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { server } from '../configs/serverURl';
import { HandleLogout } from '../configs/userConfigs';
import io from 'socket.io-client'

const ChatContext = createContext();

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

    // const ENDPOINT = "http://localhost:8001"
    
    const ENDPOINT = server.URL.production

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let socketCreated = io(ENDPOINT, { transports: ['websocket', 'polling'] });
        setSocket(socketCreated)

        if (user) {
            socket.emit('setup', user);
            socket.on('connection', () => setSocketConnected(true))
        }

        socketConneted && console.log()

        // eslint-disable-next-line 
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

    const seenlstMessage = async (msgId) => {

        try {

            let config = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ msgId })
            }

            let res = await fetch(`${server.URL.production}/api/message/seenMessage`, config);

            if (res.status === 401) return HandleLogout();

            let json = await res.json();

            // ToDo gave an appropiatiate msg for the bad res[ponse from the server!
            if (!json.status) return

            setChats(json.chats) // refresing the chats whenever a new orr lastemessgge seen by user to show him in the chat that he has seenn the lastemessage!

        } catch (error) {
            setSelectedChat(null)
            setProfile(null)
            showToast("Error", error.message, "error", 3000)
            return
        }

    }

    return (
        <ChatContext.Provider value={{ CreateChat, chatsLoading, setChatsLoading, chats, setChats, profile, setProfile, user, showToast, setUser, getUser, selectedChat, setSelectedChat, isfetchChats, setIsfetchChats, seenlstMessage, socket }}>
            {children}
        </ChatContext.Provider>
    )
}

export const ChatState = () => {
    return useContext(ChatContext);
};

export default ChatProvider;