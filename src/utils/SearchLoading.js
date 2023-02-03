import React from 'react'
import { Skeleton, Stack } from '@chakra-ui/react'

function SearchLoading() {

    let stackCount = new Array(11).fill(1)
    return (
        <Stack>
            {stackCount.map((_,i) => {
                return <Skeleton key={i} height='50px' borderRadius={".3rem"}/>
            })}
        </Stack>
    )
}

export default SearchLoading
