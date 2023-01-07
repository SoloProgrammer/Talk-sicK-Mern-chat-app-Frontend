export const getSender = (chat, user) => {
    if (chat.isGroupchat) return { name: chat.chatName,avatar:chat.groupAvatar }
    let sender = chat.users.filter(u => u._id != user._id)[0]
    return sender
}