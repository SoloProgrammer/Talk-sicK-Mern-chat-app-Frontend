import { createContext, useState, useContext, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { server } from '../configs/serverURl';
import { HandleLogout } from '../configs/userConfigs';
import io from 'socket.io-client'
import { useNavigate } from 'react-router-dom';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {

    const navigate = useNavigate();

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

    const [onlineUsers, setOnlineUsers] = useState([])

    // const ENDPOINT = "http://localhost:8001"

    const ENDPOINT = server.URL.production

    const [socket, setSocket] = useState(null);

    const [isTyping, setIsTyping] = useState(null);

    const [typingUser, setTypingUser] = useState(null) // this is needed inside the groupChat as we need to find who is typing in the whole group! 

    useEffect(() => {
        let socketCreated = io(ENDPOINT, { transports: ['websocket', 'polling'] });
        setSocket(socketCreated)

        if (socket) {
            socket.emit('setup', user);
            socket.on('connected', () => setSocketConnected(true))
            socket.on('activeUsers', (users) => setOnlineUsers(users));
        }

        // eslint-disable-next-line 
    }, [user]);

    //Socket.io connection with configuration........................................................

    const [chats, setChats] = useState(null);

    const [chatMessages, setChatMessages] = useState([])

    const [selectedChat, setSelectedChat] = useState(null);

    const [isfetchChats, setIsfetchChats] = useState(null);

    const [profile, setProfile] = useState(null)

    const [chatsLoading, setChatsLoading] = useState(false)

    const [isChatCreating, setIsChatCreating] = useState(null);

    const [archivedChats, setArchivedChats] = useState([]);

    const [viewArchivedChats, setViewArchivedChats] = useState(false);

    const [notifications, setNotifications] = useState([])

    const CreateChat = async (userId, userName) => {

        navigate('/chats')

        try {
            setChatsLoading(true);

            // this state helps to notify user that the chat is creating via showing loader with information that chat is creating with this user..!
            setIsChatCreating({ createdWith: userName.split(" ")[0] })
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

            setChats(json.chats.filter(c => !(c.archivedBy.includes(user?._id))))
            setChatsLoading(false)
            setIsChatCreating(null)
            navigate(`/chats/chat/${json.chat._id}`)
            setProfile(null)

        } catch (error) {
            showToast("Error", error.message, "error", 3000)
            setChatsLoading(false)
        }

    }

    const handlePinOrUnpinChat = async (chat) => {

        setTimeout(() => {
            document.body.click()
        }, 250);

        let updatedChats = chats.map(c => {
            if (c._id === chat._id) {
                if (!c.pinnedBy.includes(user?._id)) {
                    c.pinnedBy.push(user._id)
                }
                else {
                    c.pinnedBy = c.pinnedBy.filter(UId => UId !== user._id)
                }
            }
            return c;
        });

        (selectedChat && selectedChat._id === chat._id) && setSelectedChat(chats.filter(c => c._id === chat._id)[0]);

        setChats(updatedChats)
        try {
            let config = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ chatId: chat._id })
            }

            let res = await fetch(`${server.URL.production}/api/chat/pinORunpinchat`, config);

            if (res.status === "401") HandleLogout()

            let json = await res.json();

            if (!json.status) return showToast("Error", json.message, "error", 3000);

        } catch (error) {

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

            // refresing the chats whenever a new or lastemessgge seen by user to show him in the chat that he has seen the latestmessage!
            setChats(json.chats.filter(c => !(c.archivedBy.includes(user?._id))));

            setArchivedChats(json.chats.filter(c => c.archivedBy.includes(user?._id)))

        } catch (error) {
            setSelectedChat(null)
            setProfile(null)
            showToast("Error", error.message, "error", 3000)
            return
        }

    }

    const refreshChats = async (u = user) => {

        try {
            const config = {
                headers: {
                    token: localStorage.getItem('token')
                }
            }

            const res = await fetch(`${server.URL.production}/api/chat/allchats`, config);

            if (res.status === 401) HandleLogout()

            const json = await res.json();

            if (!json.status) return showToast("Error", json.message, "error", 3000)

            setChats(json.chats.filter(c => !(c.archivedBy.includes(u?._id))));

            setArchivedChats(json.chats.filter(c => c.archivedBy.includes(u?._id)))

        } catch (error) {
            return showToast("Error", error.message, "error", 3000)
        }

    }

    // This function is responsible to archive chat and if it is already archived then remove it from archived chats!
    const hanldeArchiveChatAction = async (chat) => {

        if ((selectedChat?._id === chat._id)) {
            setSelectedChat(null)
            navigate('/chats')
        }

        // this logic will remove chat from archived if it presents and puch back to not archived chats of users
        if (archivedChats.map(c => c._id).includes(chat._id)) {
            setArchivedChats(archivedChats.filter(c => c._id !== chat._id));
            setChats([chat, ...chats])
        }
        // this logic will add chat into archived if not present and remove from chats of users
        else {
            setArchivedChats([...archivedChats, chat]);
            setChats(chats.filter(c => c._id !== chat._id));
        }

        if (archivedChats.filter(c => c._id !== chat._id).length < 1) navigate('/chats')

        // Remove notification of this chat from notifications array when the chat is archived
        setNotifications(notifications.filter(noti => noti.chat._id !== chat._id))

        setTimeout(() => {
            document.body.click()
        }, 100);

        try {
            let config = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ chatId: chat._id })
            }
            let res = await fetch(`${server.URL.production}/api/chat/archiveOrUnarchiveChat`, config);

            if (res.status === "401") HandleLogout();

        } catch (error) {
            return showToast("Error", error.message, "error", 3000)
        }
    }

    const handleLeaveGrp = async (chat, onClose, setLoading) => {
        if (chat?.groupAdmin.map(u => u._id).includes(user._id) && chat?.groupAdmin.length === 1) {
            onClose()
            return showToast("Error", "Plz first add some one as GroupAdmin if you wish to leave this group.!", "error", 3000)
        }

        try {
            setLoading(true)
            setIsClosable(false)
            let config = {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ chatId: chat?._id, userId: user?._id })
            }

            let res = await fetch(`${server.URL.production}/api/chat/groupremove`, config);

            if (res.status === 401) HandleLogout();

            let json = await res.json();

            setLoading(false);
            setIsClosable(true);
            onClose();
            if (!json.status) return showToast("Error", json.message, "error", 3000);

            setArchivedChats(archivedChats.filter(c => c._id !== chat._id))
            setChats(chats.filter(c => c._id !== chat._id));

            // if user try to delete the chat before reading the new message from that chat than deleting the notification of that chat parallelly..!!
            setNotifications(notifications.filter(noti => noti.chat._id !== chat._id))

            showToast("Success", `You left ${chat.chatName}`, "success", 3000)

            if (!(archivedChats.map(c => c._id).includes(chat._id)) || archivedChats.filter(c => c._id !== chat._id).length < 1) navigate('/chats');
            else navigate('/chats/archived')

        } catch (error) {
            showToast("Error", error.message, "error", 3000)
            setLoading(false)
            onClose();
        }
    }

    const handleDeleteChat = async (chat, onClose, setLoading) => {
        try {
            setLoading(true)
            setIsClosable(false)
            let config = {
                method: "PUT",
                headers: {
                    token: localStorage.getItem('token'),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ chatId: chat?._id })
            }

            const res = await fetch(`${server.URL.production}/api/chat/deletechat`, config);

            if (res.status === 401) HandleLogout();

            const json = await res.json();

            setLoading(false);
            setIsClosable(true);
            onClose();

            if (!json.status) return showToast("Error", json.message, "error", 3000);

            setArchivedChats(archivedChats.filter(c => c._id !== chat._id));
            setChats(chats.filter(c => c._id !== chat._id));

            // if user try to delete the chat before reading the new message from that chat than deleting the notification of that chat parallelly..!!
            setNotifications(notifications.filter(noti => noti.chat._id !== chat._id))

            showToast(json.message, '', "success", 3000)

            if (!(archivedChats.map(c => c._id).includes(chat._id)) || archivedChats.filter(c => c._id !== chat._id).length < 1) navigate('/chats');
            else navigate('/chats/archived')

        } catch (error) {
            showToast("Error", error.message, "error", 3000)
            setLoading(false)
            onClose();
        }
    }

    useEffect(() => {

        // whenever new message recives and user is on another chat so all the chats will be fetch again and to stay the user on the same chat he is before refrshing the chats this logic is used!
        if (selectedChat && notifications.length) {
            chats && setSelectedChat(chats.filter(chat => chat._id === selectedChat._id)[0])
        }
        // eslint-disable-next-line
    }, [chats])


    // state for determining all the popups in the app should be able to closed or not..! 
    const [isClosable, setIsClosable] = useState(true)

    return (
        <ChatContext.Provider value={{ isClosable, setIsClosable, isChatCreating, refreshChats, CreateChat, chatsLoading, setChatsLoading, chats, setChats, chatMessages, setChatMessages, profile, setProfile, user, showToast, setUser, getUser, selectedChat, setSelectedChat, isfetchChats, setIsfetchChats, seenlstMessage, handlePinOrUnpinChat, socket, socketConneted, notifications, setNotifications, onlineUsers, setOnlineUsers, isTyping, setIsTyping, typingUser, setTypingUser, archivedChats, setArchivedChats, viewArchivedChats, setViewArchivedChats, hanldeArchiveChatAction, handleLeaveGrp,handleDeleteChat }}>
            {children}
        </ChatContext.Provider>
    )
}

export const ChatState = () => {
    return useContext(ChatContext);
};

export default ChatProvider;