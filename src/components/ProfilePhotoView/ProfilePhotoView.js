import React, { useEffect } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import { Box, Image, Tooltip } from '@chakra-ui/react';
import './style.css'
import { isMobile } from '../../pages/Chatpage';

const ProfilePhotoView = () => {
    const { profilePhoto, setProfilePhoto } = ChatState()

    useEffect(() => {
        const profileViewBox = document.querySelector('.profileViewBox');
        setTimeout(() => {
            profileViewBox?.classList.add('opa-1', !profilePhoto)
        }, 20);
    }, [profilePhoto])
    return (
        <Box
            className='profileViewBox opa-0'
            position={'fixed'}
            top={0}
            left={0}
            width={'100vw'}
            height={'100dvh'}
            bg={'#0707079c'}
            zIndex={30}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            onClick={() => setProfilePhoto(null)}>
            <Box pos={'absolute'} top="1rem" right={'1rem'} borderRadius={'50%'} cursor={'pointer'}>
                <Tooltip label="Close" placement='bottom' >
                    <Image width="1.5rem" src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" filter={'invert(1)'}/>
                </Tooltip>
            </Box>
            <Image
                w={'600px'}
                maxW={isMobile() ? '95%' : '70%'}
                h={'auto'}
                maxH={isMobile() ? '80%' : '95%'}
                objectFit={'contain'}
                src={profilePhoto} />
        </Box>
    )
}

export default ProfilePhotoView
