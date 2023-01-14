import { createContext, useState, useContext } from 'react'
import { useToast } from '@chakra-ui/react'
import { server } from '../configs/serverURl';
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

    const [chats, setChats] = useState(null)

    const [selectedChat, setSelectedChat] = useState(null);

    const [isfetchChats, setIsfetchChats] = useState(null);

    const [profile, setProfile] = useState(null)

    const [chatsLoading, setChatsLoading] = useState(false)


    return (
        <ChatContext.Provider value={{ chatsLoading, setChatsLoading, chats, setChats, profile, setProfile, user, showToast, setUser, getUser, selectedChat, setSelectedChat, isfetchChats, setIsfetchChats }}>
            {children}
        </ChatContext.Provider>
    )
}

export const ChatState = () => {
    return useContext(ChatContext);
};

export default ChatProvider;