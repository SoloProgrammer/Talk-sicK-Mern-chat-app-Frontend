import { Box } from '@chakra-ui/react'
import React from 'react'

const ActionItem = ({ itemImgSrc, classNames, handleFunc, children }) => {
    return (
        <Box
            bg={'white'}
            transform={'scale(0)'}
            padding={'.3rem'}
            borderRadius={'50%'}
            transition={'.2s ease-in'}
            border={'1px solid rgba(0,0,0,.1)'}
            width={'25px'}
            height={'25px'}
            boxShadow={'0 0 2px rgba(0,0,0,.2)'}
            cursor={'pointer'}
            className={`msgActionItem ${classNames}`}
            pos={'relative'}
            onClick={handleFunc}
            >
            {children}
            <img width={'100%'} height={'100%'} src={itemImgSrc} alt="" />
        </Box>
    )
}

export default ActionItem
