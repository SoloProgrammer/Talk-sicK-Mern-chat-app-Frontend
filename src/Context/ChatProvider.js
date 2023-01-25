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

    const [socketConneted, setSocketConnected] = useState(false);

    const [onlineUsers,setOnlineUsers] = useState([])

    // const ENDPOINT = "http://localhost:8001"

    const ENDPOINT = server.URL.production

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let socketCreated = io(ENDPOINT, { transports: ['websocket', 'polling'] });
        setSocket(socketCreated)

        if (socket) {
            socket.emit('setup', user);
            socket.on('connection', () => setSocketConnected(true))
            socket.on('activeUsers',(users)=>{
                // console.log("online users",users)
                setOnlineUsers(users)
            });
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

            // ToDo gave an appropiatiate msg for the bad response from the server!
            if (!json.status) return

            setChats(json.chats) // refresing the chats whenever a new or lastemessgge seen by user to show him in the chat that he has seen the latestmessage!

        } catch (error) {
            setSelectedChat(null)
            setProfile(null)
            showToast("Error", error.message, "error", 3000)
            return
        }

    }

    useEffect(() => {

        // whenever new message recives and user is on another chat so all the chats will be fetch again and to stay the user on the same chat he is before refrshing the chats this logic is used!
        if (selectedChat) {
            setSelectedChat(chats.filter(chat => chat._id === selectedChat._id)[0])
        }
        // eslint-disable-next-line
    }, [chats])

    const [notifications, setNotifications] = useState([])

    return (
        <ChatContext.Provider value={{ CreateChat, chatsLoading, setChatsLoading, chats, setChats, profile, setProfile, user, showToast, setUser, getUser, selectedChat, setSelectedChat, isfetchChats, setIsfetchChats, seenlstMessage, socket, socketConneted, notifications, setNotifications,onlineUsers,setOnlineUsers }}>
            {children}
        </ChatContext.Provider>
    )
}

export const ChatState = () => {
    return useContext(ChatContext);
};

export default ChatProvider;