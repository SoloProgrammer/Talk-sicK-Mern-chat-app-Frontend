import { Box, Text } from '@chakra-ui/react'
import React from 'react'
import { ChatState } from '../../../Context/ChatProvider'

const EmojiMenu = ({ message, hideEmojiBoxs, user }) => {

  const { reactToMessage } = ChatState()

  let Emojis = ['😂', '👍', '❤️‍🔥', '🥳', '😠', '🙏']

  function handleEmojiClick(e, emoji) {
    e.stopPropagation()
    hideEmojiBoxs()
    reactToMessage(message, emoji)
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
            width={'35px'}
            height={'35px'}
            onClick={(e) => handleEmojiClick(e, emoji)}
            padding={'.3rem .35rem'}
            bg={message?.reactions.filter(r => (r.user._id === user?._id && r.reaction === emoji)).length > 0 && EmojiHexShade}
            borderRadius={'50%'}
            cursor={'pointer'}
            _hover={{ 'bg': EmojiHexShade }}
            className='flex-center'
          >{emoji}
          </Text>
          )
        }
      </Box>
    </>
  )
}

export default EmojiMenu
