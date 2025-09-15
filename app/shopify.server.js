import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ admin, session }) => {
      // Suppose you have a way to determine the currently logged in customer ID:
      const customerId = session.customerId;
      
      try {
        const betaAccess = await isBetaCustomer(admin, customerId);
        if (!betaAccess) {
          console.log(`Customer ${customerId} is not eligible for beta features.`);
          // Optionally, restrict further functionality here.
          return;
        }
  
        // Enable full functionality for eligible customers
        await shopify.registerWebhooks({ session });
        const addressesData = await getAddresses(admin);
        console.log("Fetched addresses data:", addressesData);
      } catch (error) {
        console.error("Error checking customer eligibility:", error);
        throw error;
      }
    },
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;

// Query customer tags for soft launch filtering
const queryCustomer = `
  query getCustomer($id: ID!) {
    customer(id: $id) {
      id
      tags
    }
  }
`;

const queryAddresses = {
  query: `query getLocationsOrders {
    customer {
      companyContacts(first: 10) {
        nodes {
          company {
            id
            name
            locations(first: 2, sortKey:UPDATED_AT, reverse: true) {
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

async function isBetaCustomer(admin, customerId) {
  const response = await admin.graphql(queryCustomer, { id: customerId });
  const json = await response.json();
  const customer = json.data?.customer;
  if (!customer) {
    throw new Error("Customer not found");
  }
  // Check if the customer has the "beta" tag
  return customer.tags && customer.tags.includes("beta");
}

async function getAddresses(admin) {
  const response = await admin.graphql(queryAddresses)
  const json = await response.json()
  console.log('json', json)
  return json.data
}
