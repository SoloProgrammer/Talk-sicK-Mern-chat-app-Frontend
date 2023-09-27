import { Box, Text } from '@chakra-ui/react'
import React from 'react'
import EmojiDetailBox from '../MessageActionMenu/EmojiDetailBox/EmojiDetailBox'

const MessageReactions = ({ m }) => {

    const hideEmojiDetailBoxs = () => {
        let EmojiDetailBoxs = document.querySelectorAll(`.EmojiDetailBox`)
        EmojiDetailBoxs.forEach(box => box.classList.remove('active'))

        // removing event listner from window
        window.removeEventListener('click', hideEmojiDetailBoxs)
    }
    window.addEventListener('click', hideEmojiDetailBoxs)

    const handleReactionsClick = (e) => {

        e.stopPropagation()
        let EmojiDetailBox = document.querySelector(`#EmojiDetailBox${m._id}`)
        if (EmojiDetailBox.classList.contains('active')) return
        hideEmojiDetailBoxs()
        // console.log(e.clientX);
        if (e.clientX > 800 || (window.innerWidth < 770 && e.clientX > 140)) {
            EmojiDetailBox.style.left = '-125px'
            EmojiDetailBox.style.transformOrigin = 'bottom'
        }

        setTimeout(() => {
            EmojiDetailBox.classList.add('active')
            if (e.clientY < 360) {
                let messagesDisplay = document.querySelector('#messagesDisplay');
                setTimeout(() => {
                    messagesDisplay.scrollTo({
                        top: messagesDisplay.scrollTop -= (360 - e.clientY),
                        behavior: "smooth",
                    });
                }, 30);
            }
        }, 10);

    }
    return (
        <Box cursor={'pointer'}
            pos={'absolute'}
            _hover={{ bg: '#ebebec' }}
            bottom={'-1rem'}
            left={'.2rem'}
            bg={'white'}
            padding={'0rem .2rem'}
            borderRadius={'2rem'}
            onClick={handleReactionsClick}
            transition={'.2s all'}
            boxShadow={'0 0 0 .5px rgba(0,0,0,.6), inset 0 0 1px rgba(0,0,0,.2)'}>
            <Text
                fontSize={'.9rem'}
                fontWeight={'normal'}>

                {
                    m.reactions.map(rec => rec.reaction).slice(0, 2).join('')
                }
                {
                    m.reactions.map(rec => rec.reaction).length > 2
                    &&
                    <Text marginRight={'.1rem'} display={'inline-block'}>+{m.reactions.map(rec => rec.reaction).slice(2).length}</Text>
                }
            </Text>
            <EmojiDetailBox m={m} />
        </Box>
    )
}

export default MessageReactions
