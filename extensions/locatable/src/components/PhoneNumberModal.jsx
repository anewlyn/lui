import { Banner, BlockSpacer, BlockStack, Button, InlineLayout, Link, Modal, Text, TextBlock, TextField, useApi } from "@shopify/ui-extensions-react/customer-account"
import { useEffect, useState } from "react"

export const PhoneNumberModal = ({success, setSuccess, handlePhoneDelete, customPhone, originalPhone, handlePhoneChange, locationId}) => {
    const [phoneValue, setPhoneValue] = useState(customPhone || originalPhone || '')
    const { ui } = useApi()

    useEffect(() => {
        setSuccess(false)
    }, [])
        
    return(
        <Modal
            id={`modal-${locationId}-phone`}
            padding
            title='Edit Phone Number'
            onClose={() => {
                setPhoneValue(customPhone || originalPhone || '')
                setSuccess(false)
            }}
        >
            {success 
                ? <>
                    <BlockStack>
                        <Banner
                            status="success"
                            title="Phone number updated successfully."
                        />
                        <Button
                            kind='secondary'
                            onPress={
                                () => {
                                    ui.overlay.close(`modal-${locationId}-phone`)
                                }
                            }
                        >
                            Close
                        </Button>
                    </BlockStack>
                </>
            : <BlockStack>
                <Text size='base'>
                    {originalPhone 
                        ? <>Phone from shipping address: <Text size='base' emphasis='bold'>{originalPhone}</Text></>
                        : <Text size='base' emphasis='italic' appearance='subdued'>No phone number on file</Text>
                    }
                    {customPhone && originalPhone && <Text><Link onPress={() => handlePhoneDelete()}>Revert to Original</Link></Text>}
                </Text>
                <TextField 
                    autocomplete={false} 
                    maxLength={20} 
                    label='Phone Number' 
                    value={phoneValue} 
                    onChange={val => setPhoneValue(val)}
                    type='tel'
                />
                <TextBlock>
                    This changes your phone number on the store locator, not on your shipping or billing information.
                </TextBlock>
                <TextBlock size='small' appearance='subdued'>
                    Please enter a valid phone number for customers to contact you.
                </TextBlock>
                <BlockSpacer />
                <InlineLayout spacing='tight'>
                    <Button
                        kind='primary'
                        disabled={phoneValue === (customPhone || originalPhone) ? 'true' : ''}
                        onPress={e => {
                            handlePhoneChange(phoneValue)
                        }}
                    >
                        Update Phone
                    </Button>
                    <Button
                        kind='secondary'
                        onPress={
                            () => {
                                ui.overlay.close(`modal-${locationId}-phone`)
                            }
                        }
                    >
                        Cancel
                    </Button>
                </InlineLayout>
            </BlockStack>}
        </Modal>
    )
}