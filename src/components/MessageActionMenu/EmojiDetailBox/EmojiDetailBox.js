import React, { useState, useEffect } from 'react'
import './style.css'
import { Box, Image, Text } from '@chakra-ui/react'
import { ChatState } from '../../../Context/ChatProvider'
import { getClickEventOptions } from '../../../configs/eventConfig'

var emojiUsers;

const EmojiDetailBox = ({ m }) => {
    let LightGrayHexShade = '#fafafa'
    let Emojis = m.reactions.map(r => r.reaction)

    const { user, messages, reactToMessage: removeReactionFromMsg } = ChatState()

    // removing duplicate emojis in the original array itself i.e inplace 
    let i = 0
    while (i !== Emojis.length) {
        if (Emojis.slice(i + 1).includes(Emojis[i])) Emojis.splice(i, 1)
        else i++
    }

    let underline = document.querySelector(`#underline${m._id}`)
    const clickEmoji = (e, emoji) => {
        if (underline) {
            underline.style.left = e.target.offsetLeft + 'px'
            underline.style.width = e.target.offsetWidth + 'px'
        }
        setCurrEmoji(emoji)
    }
    const [currEmoji, setCurrEmoji] = useState(m.reactions.map(r => r.reaction)[0])

    emojiUsers = m.reactions.filter(r => r.reaction === currEmoji)

    useEffect(() => {
        let Emoji = Emojis[0]
        emojiUsers = m.reactions.filter(r => r.reaction === Emoji)
        if (underline) underline.style.left = '0px'
        setCurrEmoji(Emoji)

        // eslint-disable-next-line
    }, [messages])

    // let emojiTabs = document.querySelectorAll('.emojiTab')

    const handleRemoveReaction = (emoji, User) => {
        if (User._id !== user?._id) return
        removeReactionFromMsg(m, emoji)

        const eventOptions = getClickEventOptions(window, true, true)
        var clickEvent = new MouseEvent("click", eventOptions);

        // We are firing the click event on window to close the reactions detials box when reaction gets remove---
        setTimeout(() => {
            window.dispatchEvent(clickEvent);
        }, 100);
    }

    return (
        <Box
            pos={'absolute'}
            bottom={'2rem'}
            bg={LightGrayHexShade}
            minH={'200px'}
            maxH={'230px'}
            overflowY={'auto'}
            minW={'230px'}
            cursor={'auto'}
            className='EmojiDetailBox'
            onClick={(e) => e.stopPropagation()}
            zIndex={'9'}
            id={`EmojiDetailBox${m._id}`}
            shadow={'0 0 5px rgba(0,0,0,.2)'}
            borderRadius={'.3rem'}>
            <Box
                className='emojisTabs'
                bg={'white'}
                pos={'sticky'}
                top={'0'}
                borderBottom={'1px solid rgba(0,0,0,.2)'}
                padding={'0rem 0'}
                display={'flex'}
            >
                <div id={`underline${m._id}`} className="underLine"></div>
                {
                    Emojis.map((emoji, i) =>
                        <Text
                            key={i}
                            // transition={'.2s all'}
                            onClick={(e) => clickEmoji(e, emoji)}
                            padding=".5rem .3rem"
                            fontSize={'1.2rem'}
                            cursor={'pointer'}
                            className='emojiTab'
                            display="inline-flex"
                            alignItems={'center'}
                        >
                            {emoji}
                            <Text
                                fontSize={'.7rem'}
                                padding={'.1rem'}
                                pointerEvents={'none'}
                                width={'15px'}
                                height={'15px'}
                                display={'flex'}
                                justifyContent={'center'}
                                alignItems={'center'}
                                fontWeight={'medium'}
                                borderRadius={'50%'}>
                                {m.reactions.filter(r => r.reaction === emoji).length}
                            </Text>
                        </Text>
                    )
                }
            </Box>
            <Box display={'flex'} flexDir={'column'} gap={'0'} className='emojUsers' marginTop={'.2rem'}>
                {
                    emojiUsers.map((u, i) => {
                        return (
                            <Box
                                key={i}
                                padding={'.5rem .3rem'}
                                _hover={{ bg: 'white' }}
                                display={'flex'}
                                gap={'.9rem'}
                                cursor={u.user._id === user?._id ? 'pointer' : 'auto'}
                                onClick={() => handleRemoveReaction(u.reaction, u.user)}
                            >
                                <Box display={'flex'} gap={'.9rem'} alignItems={'center'}>
                                    <Image src={u.user.avatar} w={'30px'} h={'30px'} borderRadius={'50%'} objectFit={'cover'} />
                                    <Box>
                                        <Text fontSize={'.8rem'} fontWeight={'medium'} color={'gray.700'}>
                                            {
                                                u.user._id === user?._id ? 'You' : u.user.name
                                            }
                                        </Text>
                                        <Text>
                                            {
                                                u.user._id === user?._id
                                                &&
                                                <Text fontSize={'.65rem'}>{window.innerWidth <= 900 ? 'Tap' : 'Click'} to remove</Text>
                                            }
                                        </Text>
                                    </Box>
                                </Box>
                            </Box>)
                    })
                }
            </Box>
        </Box>
    )
}

export default EmojiDetailBox
