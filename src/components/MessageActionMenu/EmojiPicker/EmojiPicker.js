import { Box, Text } from '@chakra-ui/react'
import React from 'react'
import { ChatState } from '../../../Context/ChatProvider'
import { server } from '../../../configs/serverURl'
import { HandleLogout } from '../../../configs/userConfigs'

const EmojiMenu = ({ message, hideEmojiBoxs, user }) => {

  const { messages, setMessages, chatMessages, setChatMessages, setIsMessagesUpdated, showToast, socket } = ChatState()

  let Emojis = ['😂', '👍', '❤️‍🔥', '🥳', '🥲', '🙏']

  const updateReactionInServer = async (emoji) => {
    try {
      const config = {
        method: 'PUT',
        headers: {
          token: localStorage.getItem('token')
        },
      }

      let res = await fetch(`${server.URL.local}/api/message/${message?._id}/react?reaction=${emoji}`, config);

      if (res.status === 401) return HandleLogout()

      let json = await res.json();

      if (!json.status) return showToast("Error", json.message, "error", 3000);

      socket.emit('react message', json.msg, json.reacted_user)

    } catch (error) {
      showToast("Error", error.message, "error", 3000);
    }
  }
  function handleEmojiClick(e, emoji) {
    e.stopPropagation()
    hideEmojiBoxs()

    // Updating reactions on message on Client side---
    let messagesClone = structuredClone(messages)
    let updatedMessages = messagesClone?.map(m => {
      if (m._id === message._id) {
        let newReaction = { user, reaction: emoji }

        if (m.reactions && m.reactions.length > 0) {
          if (m?.reactions?.map(r => r.user._id === user?._id)) {

            if (m?.reactions.filter(r => r.user._id === user?._id)[0]?.reaction === emoji) {
              m.reactions = m?.reactions.filter(r => r.user._id !== user?._id)
            }
            else {
              m.reactions = m?.reactions.filter(r => r.user._id !== user?._id)
              m?.reactions?.unshift(newReaction)
            }
          }
          else m.reactions.unshift(newReaction)
        }
        else {
          m.reactions = [newReaction]
        }
      }
      return m;
    })

    setIsMessagesUpdated(true)
    setTimeout(() => {
      setMessages(updatedMessages)
      setChatMessages(chatMessages.map(ch => {
        if (ch.chatId === message.chat._id) {
          ch.messages = updatedMessages
        }
        return ch
      }))
    }, 200);

    // Updating reactions on message on Server side---
    updateReactionInServer(emoji)
  }

  let EmojiHexShade = '#00000012'

  return (
    <>
      <Box
        transition={'.2s all ease-in'}
        className='EmojiPickerBx'
        pos={'absolute'}
        bg={'#ffffff'}
        padding={'.3rem .35rem'}
        borderRadius={'2rem'}
        shadow={'0 0 3px rgba(0,0,0,.2)'}
        display={'flex'}
        top={'-2.9rem'}
        left={'50%'}
        id={`EmojiBox${message._id}`}
        justifyContent={'space-between'}
      >
        {
          Emojis.map((emoji, i) => <Text
            key={i}
            onClick={(e) => handleEmojiClick(e, emoji)}
            padding={'.3rem .35rem'}
            bg={message?.reactions.filter(r => (r.user._id === user?._id && r.reaction === emoji)).length > 0 && EmojiHexShade}
            borderRadius={'50%'}
            cursor={'pointer'}
            _hover={{ 'bg': EmojiHexShade }}
          >{emoji}
          </Text>
          )
        }
      </Box>
    </>
  )
}

export default EmojiMenu
