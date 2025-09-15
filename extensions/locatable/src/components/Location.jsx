import { Badge, Banner, BlockLayout, BlockSpacer, BlockStack, Button, Card, Grid, Heading, HeadingGroup, Icon, InlineLayout, InlineSpacer, Link, List, ListItem, Modal, Pressable, Switch, Text, TextBlock, TextField, Tooltip, useApi, View } from "@shopify/ui-extensions-react/customer-account"
import { useEffect, useState } from "react"
import { CustomNameModal } from "./CustomNameModal.jsx"

export const Location = ({location, saveLocatableState}) => {
    const [isLocatable, setIsLocatable] = useState(location.locatable)
    const [newName, setNewName] = useState(false)
    const [customName, setCustomName] = useState(location.customName)
    const [success, setSuccess] = useState(false)
    
    function handleSwitch() {
        const locatable = isLocatable == 'true' ? 'false' : 'true'
        saveLocatableState(location.locationId, locatable)
        setIsLocatable(locatable)
    }
    async function handleNameChange(name) {
        setSuccess(false)
        try {
            await saveCustomName(location.locationId, name)
            setNewName(true)
            setCustomName(name)
            console.log('Name change successfully.')
            setSuccess(true)
        } catch(err) {
            setCustomName(location.customName || '')
            console.warn('Error changing name.', err)
        }
    }
    async function handleNameDelete() {
        setSuccess(false)
        try {
            await deleteCustomName(location.locationId)
            setNewName(true)
            setCustomName(null)
            setSuccess(true)
        } catch(err) {
            setNewName(location.customName || '')
            console.warn('Error deleting name.', err)
        }
    }

    function saveCustomName(locationId, customName) {
        fetch("shopify:customer-account/api/2025-01/graphql.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: `mutation saveCustomName($metafields: [MetafieldsSetInput!]!) {
                            metafieldsSet(metafields: $metafields) {
                                metafields {
                                    id
                                    namespace
                                    key
                                    value
                                    updatedAt
                                }
                                userErrors {
                                    field
                                    message
                                }
                            }
                        }`,
                variables: {
                    metafields: [
                    {
                        ownerId: locationId,
                        namespace: "locator",
                        key: "custom_name",
                        value: customName,
                        type: 'single_line_text_field',
                    },
                    ],
                },
            }),
        })
    }
    function deleteCustomName(locationId) {
        fetch("shopify:customer-account/api/2025-01/graphql.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: `mutation deleteCustomName($metafields: [MetafieldIdentifierInput!]!) {
                            metafieldsDelete(metafields: $metafields) {
                                deletedMetafields {
                                    ownerId
                                    namespace
                                    key
                                }
                                userErrors {
                                    field
                                    message
                                }
                            }
                        }`,
                variables: {
                    metafields: [
                    {
                        ownerId: locationId,
                        namespace: "locator",
                        key: "custom_name",
                    },
                    ],
                },
            }),
        })
    }

    const fulfilled = location.orders.find(order => order.status == 'FULFILLED')
    
    return(
        <Card padding='base'>
            <InlineLayout columns={['fill', 'auto']} padding='base'>
                <BlockLayout>
                    <Heading level={2}>
                        {customName || location.shippingAddress.company}
                    </Heading>
                    <View>
                        <Link 
                            overlay={<CustomNameModal success={success} customName={customName} setSuccess={setSuccess} handleNameDelete={handleNameDelete} originalName={location.shippingAddress.company} handleNameChange={handleNameChange} />}
                        >
                            <Text size='small'>
                            {
                                customName
                                ? 'Edit Custom Name'
                                : 'Add Custom Name'
                            }
                            </Text>
                        </Link>
                    </View>
                </BlockLayout>
                {fulfilled 
                    ? <Pressable overlay={<Tooltip>Recent order(s) fulfilled.</Tooltip>}><Icon source='truck' appearance='monochrome' /></Pressable>
                    : <Pressable overlay={<Tooltip>Recent order(s) pending.</Tooltip>}><Icon source='clock' appearance='monochrome' /></Pressable>
                }
            </InlineLayout>
            <View padding='base'>
                <List marker='none'>
                    <ListItem>{location.shippingAddress.phone ?? <Text appearance='warning' emphasis='italic'>Phone Recommended</Text>}</ListItem>
                    <ListItem>{location.shippingAddress.line1}</ListItem>
                    {location.shippingAddress.line2 && <ListItem>{location.shippingAddress.line2}</ListItem>}
                    <ListItem>{location.shippingAddress.state}</ListItem>
                    <ListItem>{location.shippingAddress.zip}</ListItem>
                </List>
            </View>
            <InlineLayout columns={['auto', 4, 'fill']} blockAlignment='center' background='subdued' padding='base' cornerRadius='base'>
                <View>
                    <Icon source='marker' size='base' appearance='info' />
                </View>
                <InlineSpacer spacing='tight' />
                <View>
                    <Switch label={`Locatable`} checked={isLocatable == 'true' ? 'true' : ''} onChange={handleSwitch}  accessibilityLabel={'Locatable'} />
                </View>
            </InlineLayout>
        </Card>
    )
}