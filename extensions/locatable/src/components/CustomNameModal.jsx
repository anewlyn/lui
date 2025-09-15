import { Banner, BlockSpacer, BlockStack, Button, InlineLayout, Link, Modal, Text, TextBlock, TextField, useApi } from "@shopify/ui-extensions-react/customer-account"
import { useEffect, useState } from "react"

export const CustomNameModal = ({success, setSuccess, handleNameDelete, customName, originalName, handleNameChange}) => {
    const [nameValue, setNameValue] = useState(customName || null)
    const { ui } = useApi()

    useEffect(() => {
        setSuccess(false)
    }, [])
        
    return(
        <Modal
            id={`modal-${location.locationId}-name`}
            padding
            title='Change Store Name'
            onClose={() => {
                setNameValue(customName)
                setSuccess(false)
            }}
        >
            {success 
                ? <>
                    <BlockStack>
                        <Banner
                            status="success"
                            title="Name change successful."
                        />
                        <Button
                            kind='secondary'
                            onPress={
                                () => {
                                    ui.overlay.close(`modal-${location.locationId}-name`)
                                }
                            }
                        >
                            Close
                        </Button>
                    </BlockStack>
                </>
            : <BlockStack>
                <Text size='base'>
                    Name from shipping address: <Text size='base' emphasis='bold'>{originalName}</Text>
                    <Text>{customName && <Link onPress={() => handleNameDelete()}>Revert to Original</Link>}</Text>
                </Text>
                <TextField autocomplete={false} maxLength={48} label='Custom Name' value={nameValue} onChange={val => setNameValue(val)} />
                <TextBlock>
                    This changes your store name on the store locator, not on your shipping or billing information.
                </TextBlock>
                <TextBlock size='small' appearance='subdued'>
                    We reserve the right to edit names if deemed offensive or an abuse of the feature.
                </TextBlock>
                <BlockSpacer />
                <InlineLayout spacing='tight'>
                    <Button
                        kind='primary'
                        disabled={nameValue === customName ? 'true' : ''}
                        onPress={e => {
                            handleNameChange(nameValue)
                        }}
                    >
                        Submit
                    </Button>
                    <Button
                        kind='secondary'
                        onPress={
                            () => {
                                ui.overlay.close(`modal-${location.locationId}-name`)
                            }
                        }
                    >
                        Cancel
                    </Button>
                </InlineLayout>
            </BlockStack>}
            {/* : success */}
        </Modal>
    )
}