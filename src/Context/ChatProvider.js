import { createContext, useState, useContext, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { server } from '../configs/serverURl';
import { HandleLogout } from '../configs/userConfigs';
import io from 'socket.io-client'
import { useNavigate } from 'react-router-dom';

export const ChatContext = createContext();

const ChatProvider = ({ children }) => {

    const navigate = useNavigate();

    const toast = useToast();
    function showToast(title, msg, status, time, pos = "bottom-center") {
        toast({
            title: title,
            description: msg,
            status: status,
            duration: time,
            variant: 'left-accent',
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
        const res = await fetch(`${server.URL.local}/api/user/getuser`, config);
        return res.json()
    }

    //Socket.io connection with configuration........................................................

    const [socketConneted, setSocketConnected] = useState(false);

    const [onlineUsers, setOnlineUsers] = useState([]);

    const ENDPOINT = server.URL.local;

    const [socket, setSocket] = useState(null);

    const [isTyping, setIsTyping] = useState(null);

    const [typingInfo, setTypingInfo] = useState([]) // this is needed inside the groupChat as we need to find who is typing in the whole group! 

    //Socket.io connection with configuration........................................................

    useEffect(() => {
        let socketCreated = io(ENDPOINT, { transports: ['websocket', 'polling'] });
        setSocket(socketCreated)

        if (user) {
            socketCreated?.emit('setup', user);
            socketCreated?.on('connected', () => setSocketConnected(true))
            socketCreated?.on('activeUsers', (users) => setOnlineUsers(users));
        }
        // eslint-disable-next-line 
    }, [user]);


    const [chats, setChats] = useState(null);

    const [chatMessages, setChatMessages] = useState([])

    const [selectedChat, setSelectedChat] = useState(null);

    const [isfetchChats, setIsfetchChats] = useState(null);

    const [profile, setProfile] = useState(null)

    const [chatsLoading, setChatsLoading] = useState(false)

    const [isChatCreating, setIsChatCreating] = useState(null);

    const [archivedChats, setArchivedChats] = useState([]);

    const [viewArchivedChats, setViewArchivedChats] = useState(false);

    const [notifications, setNotifications] = useState([]);

    const [sendPic, setSendPic] = useState(null)

    // state for determining all the popups in the app should be able to closed or not..! 
    const [isClosable, setIsClosable] = useState(true);

    const [messages, setMessages] = useState([]);

    const [alertInfo, setAlertInfo] = useState({
        active: false
    })

    const getPinnedChats = (chats, u) => {
        return chats.filter(c => c.pinnedBy.includes(u?._id) && !c.archivedBy.includes(u?._id))
    }

    const getUnPinnedChats = (chats, u) => {
        return chats.filter(c => !c.pinnedBy.includes(u?._id) && !c.archivedBy.includes(u?._id))
    }

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

            let res = await fetch(`${server.URL.local}/api/chat`, config);

            if (res.status === 401) HandleLogout();

            let json = await res.json();

            if (!json.status) return showToast("Error", json.message, "error", 3000)

            setChats([...getPinnedChats(json.chats, user), ...getUnPinnedChats(json.chats, user)]);

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

        if (chat.pinnedBy.includes(user?._id)) {
            updatedChats = [...updatedChats.filter(c => c._id === chat._id), ...updatedChats.filter(c => c._id !== chat._id)]
        }

        (selectedChat && selectedChat._id === chat._id) && setSelectedChat(chats.filter(c => c._id === chat._id)[0]);

        setChats([...getPinnedChats(updatedChats, user), ...getUnPinnedChats(updatedChats, user)])

        try {
            let config = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ chatId: chat._id })
            }

            let res = await fetch(`${server.URL.local}/api/chat/pinORunpinchat`, config);

            if (res.status === "401") HandleLogout()

            let json = await res.json();

            if (!json.status) return showToast("Error", json.message, "error", 3000);

        } catch (error) {

        }
    }

    const seenMessages = async (selectedChat, updatedChatMsgs) => {

        try {

            let config = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ chatId: selectedChat?._id })
            }

            let res = await fetch(`${server.URL.local}/api/message/seenMessage`, config);

            if (res.status === 401) return HandleLogout();

            let json = await res.json();

            // ToDo gave an appropiatiate msg for the bad response from the server!
            if (!json.status) return

            socket?.emit('seeing messages', selectedChat?._id, json?.messages[0].chat.totalMessages, json.chats.filter(ch => ch._id === selectedChat._id)[0]);

            // refresing the chats whenever a new or lastemessgge seen by user to show him in the chat that he has seen the latestmessage!
            setChats([...getPinnedChats(json.chats, user), ...getUnPinnedChats(json.chats, user)]);
            // setSelectedChat(json.chats.filter(c => c._id === selectedChat?._id)[0])
            setArchivedChats(json.chats.filter(c => c.archivedBy.includes(user?._id)))

            // Updating the chatMessages with the new seen messages so whenever user open the chat of which we have updating the messages second time after browsing from other chats the message - (x new message) in red will not be shown to him in the messages box!
            if (updatedChatMsgs) {
                updatedChatMsgs.forEach(chatMsg => {
                    if (chatMsg.chatId === selectedChat._id) {
                        chatMsg = { chatId: selectedChat._id, messages: [...json.messages] }
                        setChatMessages([...(updatedChatMsgs.filter(cm => cm.chatId !== selectedChat.id)), chatMsg]);
                    }
                });
            }


        } catch (error) {
            console.log('========', error);
            setSelectedChat(null)
            setProfile(null)
            showToast("Error", error.message, "error", 3000);
            setTimeout(() => {
                window.alert("Network or Server Error, Plese reload the page!");
                window.location.reload(0);
            }, 200);
            return
        }

    }

    const refreshChats = async (u = user, selectedChat) => {

        try {
            const config = {
                headers: {
                    token: localStorage.getItem('token')
                }
            }

            const res = await fetch(`${server.URL.local}/api/chat/allchats`, config);

            if (res.status === 401) HandleLogout()

            const json = await res.json();

            if (!json.status) return showToast("Error", json.message, "error", 3000)

            setArchivedChats(json.chats.filter(c => c.archivedBy.includes(u?._id)));

            setChats([...getPinnedChats(json.chats, u), ...getUnPinnedChats(json.chats, u)]);

            if (selectedChat) {
                setSelectedChat([...getPinnedChats(json.chats, u), ...getUnPinnedChats(json.chats, u)].filter(c => c._id === selectedChat._id)[0])
            }

        } catch (error) {
            return showToast("Error", error.message, "error", 3000)
        }

    }

    const hanldeArchiveChatAction = async (chat) => {

        if ((selectedChat?._id === chat._id)) {
            setSelectedChat(null)
            navigate('/chats')
        }

        // this logic will remove chat from archived if it presents and push back to not archived chats of users
        if (archivedChats.map(c => c._id).includes(chat._id)) {
            setArchivedChats(archivedChats.filter(c => c._id !== chat._id));
            setChats([...getPinnedChats(chats, user), chat, ...getUnPinnedChats(chats, user)])
        }
        // this logic will add chat into archived if not present and remove from chats of users
        else {
            if (chat.pinnedBy.includes(user?._id)) {
                handlePinOrUnpinChat(chat);
                chat.pinnedBy = chat.pinnedBy.filter(u => u !== user._id)
            }
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
            let res = await fetch(`${server.URL.local}/api/chat/archiveOrUnarchiveChat`, config);

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

            let res = await fetch(`${server.URL.local}/api/chat/groupremove`, config);

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

            document.body.click();

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

            const res = await fetch(`${server.URL.local}/api/chat/deletechat`, config);

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

            // this click handler is impoertant don't delete this...!!
            document.body.click()

        } catch (error) {
            showToast("Error", error.message, "error", 3000)
            setLoading(false)
            onClose();
        }
    }

    function setChatsandMessages(json) {

        setMessages(json.allMessages);

        chatMessages.forEach(chatMsg => {
            if (chatMsg.chatId === selectedChat?._id) {

                chatMsg = { chatId: selectedChat._id, messages: [...json.allMessages] }

                setChatMessages([...(chatMessages.filter(cm => cm.chatId !== selectedChat._id)), chatMsg]) // cm := ChatMessage
            }
        })

        setArchivedChats(json.chats.filter(c => c.archivedBy.includes(user?._id)))
        setChats([...getPinnedChats(json.chats, user), ...getUnPinnedChats(json.chats, user)]);
    }

    async function sendInfoMsg(msgType, content) {

        try {
            let config = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem('token')
                },
                body: JSON.stringify({ chatId: selectedChat?._id, content, receiverIds: selectedChat.users.filter(u => u._id !== user?._id).map(u => u._id), msgType })
            }

            let res = await fetch(`${server.URL.local}/api/message/sendmessage`, config);

            if (res.status === 401) return HandleLogout()

            let json = await res.json();

            if (!json.status) return showToast("Error", json.message, "error", 3000);

            socket.emit('new message', json.fullmessage)

            setChatsandMessages(json)

        } catch (error) {
            showToast("Error", error.message, "error", 3000)
        }
    }

    // Socket/Effect for typing... funcionality
    useEffect(() => {
        if (socket && user) {
            socket.on("typing", (User, typingInfoData) => {
                if (User._id !== user?._id) {
                    setIsTyping(true);
                    setTypingInfo(typingInfoData)
                }
            })
            socket.on("stop typing", (typingInfoData) => {
                !typingInfoData.length && setIsTyping(false)
                setTypingInfo(typingInfoData)
            })
        }
    }, [socket, user])

    return (
        <ChatContext.Provider value={{ getPinnedChats, getUnPinnedChats, messages, setMessages, isClosable, setIsClosable, isChatCreating, refreshChats, CreateChat, chatsLoading, setChatsLoading, chats, setChats, chatMessages, setChatMessages, profile, setProfile, user, showToast, setUser, getUser, selectedChat, setSelectedChat, isfetchChats, setIsfetchChats, seenMessages, handlePinOrUnpinChat, socket, socketConneted, notifications, setNotifications, onlineUsers, setOnlineUsers, isTyping, setIsTyping, typingInfo, setTypingInfo, archivedChats, setArchivedChats, viewArchivedChats, setViewArchivedChats, hanldeArchiveChatAction, handleLeaveGrp, handleDeleteChat, sendPic, setSendPic, alertInfo, setAlertInfo, sendInfoMsg }}>
            {children}
        </ChatContext.Provider>
    )
}

// This is the setup for using the global data/ context data in every componet of out application only by importing this function!
export const ChatState = () => {
    return useContext(ChatContext);
};

export default ChatProvider;