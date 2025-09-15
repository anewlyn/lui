import {
  reactExtension,
  Text,
  Grid,
  Page,
  Heading,
  BlockStack,
  View,
  Style,
  Card,
  Divider,
  Icon,
  InlineLayout,
  Link,
  Disclosure,
  Pressable,
  Button,
  Menu,
  ChoiceList,
  Choice,
  TextBlock,
} from '@shopify/ui-extensions-react/customer-account'
import { Fragment, useEffect, useState } from 'react'
import { Location } from './components/Location.jsx'
import HowItWorks from './components/HowItWorks.jsx'
// import { Client } from '@googlemaps/google-maps-services-js'
// import { Map } from './components/Map.jsx'

export default reactExtension(
  'customer-account.page.render',
  () => <Extension />,
)

function Extension() {
  const [loaded, setLoaded] = useState(false)
  const [companyLocations, setCompanyLocations] = useState()

  useEffect(() => {
    const getAddresses = {
      query: `query getLocationsOrders {
        customer {
          companyContacts(first: 10) {
            nodes {
              company {
                id
                name
                locations(first: 2, sortKey:CREATED_AT, reverse: true) {
                  nodes {
                    id
                    metafields(identifiers:[{namespace:"locator",key:"locatable"}, {namespace:"locator",key:"custom_name"}]) {
                      namespace
                      key
                      value
                    }
                    shippingAddress {
                      formattedAddress
                      phone
                      address1
                      address2
                      city
                      province
                      zip
                    }
                    orders(first: 10, sortKey:UPDATED_AT, reverse: true) {
                      nodes {
                        id
                        createdAt
                        updatedAt
                        fulfillments(query:"status:SUCCESS",first:10) {
                          nodes {
                            updatedAt
                            status
                          }
                        }
                        shippingAddress {
                          company
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`
    }
    fetch("shopify://customer-account/api/2025-01/graphql.json",{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(getAddresses),
    })
      .then(response => response.json())
      .then(async ({data: {customer: {companyContacts: nodes}}}) => {
        console.log('data', nodes.nodes)
        let comp = []
        let loc = []
        const companies = nodes.nodes
        companies.forEach((company, index) => {
          const locations = company.company.locations.nodes
          comp.push({
            companyId: company.company.id,
            name: company.company.name,
            locations: []
          })
          locations.forEach(location => {
            let meta = {locatable: false, name: null}
            let ord = []
            let companyName
            // console.log('location', location)
            const metafields = location.metafields
            const orders = location.orders.nodes
            const address = location.shippingAddress
            // await geocode
            orders.forEach(order => {
              // console.log('order', order)
              companyName = order.shippingAddress.company
              const fulfillments = order.fulfillments.nodes
              const threshold = new Date().getTime() - (1000 * 60 * 60 * 24 * 90)
                                                      //ms     s    m    h    90 DAYS
              const orderUpdatedAt = new Date(order.updatedAt ?? order.createdAt).getTime()
              // ful = {       
              //   updatedAt: new Date(order.updatedAt ?? order.createdAt).getTime(),
              //   status: 'NONE'
              // }

              if(orderUpdatedAt > threshold) {
                if(fulfillments.length > 0) {
                  fulfillments.some(fulfillment => {
                    if(fulfillment.status == 'SUCCESS') {
                      ord.push({
                        updatedAt: new Date(fulfillment.updatedAt ?? fulfillment.createdAt).getTime(),
                        status: 'FULFILLED'
                      })
                      return true
                    }
                  })
                } else {
                  ord.push({
                    updatedAt: orderUpdatedAt,
                    status: 'UNFULFILLED'
                  })
                }
              }
              // console.log('ord', ord)
            })//orders
            metafields.forEach(metafield => {
              // console.log('metafield', metafield)
              if(metafield && metafield.key == 'locatable') meta.locatable = metafield.value
              if(metafield && metafield.key == 'custom_name') meta.customName = metafield.value
            })//metafields
            comp[index].locations.push({
              locationId: location.id,
              updatedAt: ord[0].updatedAt,
              orders: ord,
              locatable: meta.locatable,
              customName: meta.customName ?? null,
              shippingAddress: {
                company: companyName ?? null,
                phone: address.phone,
                line1: address.address1,
                line2: address.address2,
                city: address.city,
                state: address.province,
                zip: address.zip,
                formattedAddress: address.formattedAddress,
              }
            })
          })//locations
        })//companies
        console.log('comp', comp)
        setCompanyLocations(comp)
        setLoaded(true)
      })
      .catch(console.error)
  }, [])

  async function saveLocatableState(locationId, locatableState) {
    await fetch("shopify:customer-account/api/2025-01/graphql.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `mutation saveLocatableState($metafields: [MetafieldsSetInput!]!) {
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
              key: "locatable",
              value: locatableState,
              type: 'boolean',
            },
          ],
        },
      }),
    });
  }

  if(!loaded) return (<Page title='Store Locator' loading={true}></Page>)
  if(loaded) return (
    <Page title='Store Locator'>
      <BlockStack>
        <TextBlock>
          Lorem ipsum how your store will appear on the <Link to='https://cyclingfrog.com/pages/store-locator' external={true}>Cycling Frog Store Locator</Link>. Donec tempus elementum mi eu tristique. Cras nibh massa, lobortis in ultrices eget.
        </TextBlock>
        <HowItWorks />
      </BlockStack>
      <BlockStack>
        {companyLocations.map(company => (<Fragment key={company.companyId}>
          <Divider size='large' />
          <BlockStack key={company.companyId} padding='base'>
            <InlineLayout spacing='tight' columns={['fill', 'auto']}>
              <BlockStack spacing='tight' blockAlignment='start'>
                <Text size='small' emphasis='bold'>Company</Text>
                <Heading>{company.name}</Heading>
              </BlockStack>
            </InlineLayout>
            <Grid 
              columns={
                Style.default(['1fr'])
                .when({viewportInlineSize: {min: 'small'}}, ['1fr', '1fr'])
                .when({viewportInlineSize: {min: 'medium'}}, ['1fr', '1fr', '1fr'])
              } 
              rows="auto" spacing="base" blockAlignment='start' 
            >
              {company.locations.map(location => (
                <Location key={location.locationId} saveLocatableState={saveLocatableState} location={location} />
              ))}
            </Grid>
          </BlockStack>
        </Fragment>))}
      </BlockStack>
    </Page>
  )
}