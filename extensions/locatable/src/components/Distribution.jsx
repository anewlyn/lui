import { Badge, Card, Grid, Heading, Icon, InlineLayout, InlineSpacer, List, ListItem, Pressable, Switch, Tooltip, View } from "@shopify/ui-extensions-react/customer-account"
import { useState } from "react"

export default function Distribution() {
    const [isDistributed, setIsDistributed] = useState('false')
    
    function handleSwitch() {
        const distributed = isDistributed == 'true' ? 'false' : 'true'
        setIsDistributed(distributed)
    }

    return (<>
        <View inlineAlignment='end' blockAlignment='end'>
            <Switch label={`Distributed`} checked={isDistributed == 'true' ? 'true' : ''} onChange={handleSwitch}  accessibilityLabel={'Distributed'} />    
        </View>
    </>)
}