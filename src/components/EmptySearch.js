import { Box, Image, Text } from '@chakra-ui/react'
import React from 'react'

function EmptySearch({size}) {
    return (
        <Box m={3} display="flex" justifyContent={'center'} flexDir="column" alignItems={"center"} gap="1rem">
            <Image width={size} src="https://t4.ftcdn.net/jpg/04/26/08/51/240_F_426085199_q6YtlZR7McMNekrghgyetyoPZKTro0WV.jpg"></Image>
            <Text fontWeight={"bold"} fontSize={"xs"} textAlign={"center"}>No results found try with another word</Text>
        </Box>
    )
}

export default EmptySearch
