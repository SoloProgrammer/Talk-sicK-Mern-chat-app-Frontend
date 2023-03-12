import { Box, Image, Spinner } from '@chakra-ui/react';
import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { handleFileUpload } from '../../configs/handleFileUpload'
import { ChatState } from '../../Context/ChatProvider'

function ImageDropZone({ isOpen, pic, setPic }) {

    const { showToast, setSendPic, setIsClosable } = ChatState();

    const [loading, setLoading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        // Do something with the files
        setIsClosable(false)
        let e = {
            target: {
                files: [acceptedFiles[0]]
            }
        }
        const picture = await handleFileUpload(e, setLoading, showToast)

        if(picture){
            setPic({ picture, picName: e.target.files[0].name })
        }
        setIsClosable(true)
        // eslint-disable-next-line
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    useEffect(() => {
        setPic(null)
        setSendPic(null)
        // eslint-disable-next-line
    }, [isOpen])

    return (
        <Box {...getRootProps()}>
            {(!loading && !pic) && <input {...getInputProps()} multiple={false} className="ImageDropZone" />}
            {
                !loading && !pic
                    ?
                    <Box height={"10rem"} cursor="pointer" className="flex" border={"2px dashed #1b95d8"} flexDir={"column"} borderRadius=".3rem">
                        <Image src='https://cdn-icons-png.flaticon.com/512/4303/4303472.png' opacity={".5"} width={"1.7rem"} />
                        <Box textAlign={"center"} padding="0 .4rem">
                            {isDragActive ?
                                <p>Drop the file here ...</p> :
                                <p>Drag 'n' drop Image file here, or click to select file</p>}
                        </Box>
                    </Box>
                    :
                    !pic
                        ?
                        <>
                            <Box className='flex' height={"10rem"}>
                                <Spinner color='cornflowerblue' size="lg" />
                            </Box>
                        </>
                        :
                        <>
                            <Box maxW={"100%"}>
                                <Image src={pic.picture} width={"100%"} height="100%" objectFit={"contain"} borderRadius=".3rem" maxHeight="30rem" />
                            </Box>
                        </>
            }
        </Box>
    )
}

export default ImageDropZone