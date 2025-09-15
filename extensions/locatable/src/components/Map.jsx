import {
    Text,
    useExtension
  } from '@shopify/ui-extensions-react/customer-account'
import { useEffect, useState } from 'react'

export const Map = () => {
    const ext = useExtension()
    const [windowLoaded, setWindowLoaded] = useState(null)

    useEffect(() => {
        
        if (typeof document === 'undefined') {
            console.log('server')
            setWindowLoaded(false)
        } else {
            console.log('browser')
            setWindowLoaded(true)
        }
    }, [ext, windowLoaded])

    return (<>
        <Text>map</Text>
    </>)
}