import { useEffect, useState } from 'react'

export function useDebounce(input, delay = 1000) {
    const [debouncedVal, setDebouncedVal] = useState(input)
    useEffect(() => {
        let handler = setTimeout(() => {
            setDebouncedVal(input)
        }, delay);

        return () => clearTimeout(handler)

    }, [input, delay])

    return debouncedVal;
}

