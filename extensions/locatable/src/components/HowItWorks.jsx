import {
    Text,
    Heading,
    BlockStack,
    View,
    Card,
    Icon,
    InlineLayout,
    Disclosure,
    Pressable,
    TextBlock,
    Button,
  } from '@shopify/ui-extensions-react/customer-account'
import { useState } from 'react'

export default function HowItWorks() {
    const [expanded, setExpanded] = useState(false)

    function handleToggle() {
        setExpanded(!expanded)
    }

    return (<>
        <Disclosure>
            <BlockStack blockAlignment='start' inlineAlignment='start'>
                <Button toggles='how' kind='secondary' appearance='monochrome' onPress={() => handleToggle()}>
                    <InlineLayout columns={['auto', 'auto']} spacing='tight'>
                        <Text>How It Works</Text>
                        <Icon source={expanded ? 'chevronUp' : 'chevronDown'} appearance='base' />
                    </InlineLayout>
                </Button>
            </BlockStack>
            <View id='how'>
                <Card padding='base'>
                <BlockStack>
                    <View>
                        <InlineLayout columns={['auto', 'auto']} spacing='tight'><Heading level={3}>Custom Name</Heading></InlineLayout>
                        <TextBlock>
                            Lorem for each store location you can opt-out lorem ipsum dolor sit amet.
                        </TextBlock>
                    </View>
                    <View>
                        <InlineLayout columns={['auto', 'auto']} spacing='tight'><Heading level={3}>Locatable</Heading><Icon source='marker' size='small' appearance='monochrome' /></InlineLayout>
                        <TextBlock>
                            Lorem for each store location you can opt-out lorem ipsum dolor sit amet.
                        </TextBlock>
                    </View>
                    <View>
                        <InlineLayout columns={['auto', 'auto']} spacing='tight'><Heading level={3}>Fulfilled Orders</Heading><Icon source='truck' size='small' appearance='monochrome' /></InlineLayout>
                        <TextBlock>
                            Lorem ipsum show all locations marked as locatable when the company makes an order dolor sit amet.
                        </TextBlock>
                    </View>
                    <View>
                        <InlineLayout columns={['auto', 'auto']} spacing='tight'><Heading level={3}>Pending Orders</Heading><Icon source='clock' size='small' appearance='monochrome' /></InlineLayout>
                        <TextBlock>
                            Lorem ipsum show all locations marked as locatable when the company makes an order dolor sit amet.
                        </TextBlock>
                    </View>
                </BlockStack>
                </Card>
            </View>
        </Disclosure>
    </>)
}