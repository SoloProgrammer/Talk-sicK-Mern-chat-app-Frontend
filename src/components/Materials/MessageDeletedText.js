import React from 'react'
import { ChatState } from '../../Context/ChatProvider'
import { stopIcon } from '../../configs/ImageConfigs'
import { Box, Image, Text } from '@chakra-ui/react'

const MessageDeletedText = ({ message, iconSize, flexDir = 'row' }) => {
    const { user } = ChatState()

    return (
        <Box fontStyle="italic" color={'gray.500'} display={'flex'} gap={'.5rem'} alignItems={'center'} flexDir={flexDir}>
            <Image filter={'grayScale(1)'} opacity={'.5'} w={iconSize} h={iconSize} src={stopIcon} alt="" />
            <Text userSelect={'none'}>
                {
                    message.sender._id === user?._id
                        ?
                        "You deleted this message"
                        :
                        "This message was deleted"
                }
            </Text>
        </Box>
    )
}

export default MessageDeletedText
