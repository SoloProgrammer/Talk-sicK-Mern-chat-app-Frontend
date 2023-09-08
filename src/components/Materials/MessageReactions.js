import { Box, Text } from '@chakra-ui/react'
import React from 'react'

const MessageReactions = ({ m }) => {
    return (
        <Box cursor={'pointer'}
            pos={'absolute'}
            _hover={{ bg: '#ebebec' }}
            bottom={'-.5rem'}
            left={'.2rem'}
            bg={'white'}
            padding={'0rem .2rem'}
            borderRadius={'2rem'}
            boxShadow={'0 0 0 .5px rgba(0,0,0,.6), inset 0 0 1px rgba(0,0,0,.2)'}>
            <Text
                fontSize={'.75rem'}
                fontWeight={'normal'}>
                {
                    m.reactions.map(rec => rec.reaction).slice(0,2).join('')
                }
                {
                    m.reactions.map(rec => rec.reaction).length > 2
                    &&
                    <Text marginRight={'.1rem'} display={'inline-block'}>+{m.reactions.map(rec => rec.reaction).slice(2).length}</Text>
                }
            </Text>
        </Box>
    )
}

export default MessageReactions
