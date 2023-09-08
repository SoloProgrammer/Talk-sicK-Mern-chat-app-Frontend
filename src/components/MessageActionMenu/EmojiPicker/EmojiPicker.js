import { Box, Text } from '@chakra-ui/react'
import React from 'react'

const EmojiMenu = ({ message, hideEmojiBoxs }) => {
  let Emojis = ['😂', '👍', '❤️‍🔥', '🥳', '🥲', '🙏']

  function handleEmojiClick(e, emoji) {
    e.stopPropagation()
    hideEmojiBoxs()
  }

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
            borderRadius={'50%'}
            cursor={'pointer'}
            _hover={{ 'bg': 'rgba(0,0,0,.07)' }}
          >{emoji}
          </Text>
          )
        }
      </Box>
    </>
  )
}

export default EmojiMenu
