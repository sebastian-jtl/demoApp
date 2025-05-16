JTL-WAWI API (Cloud) - 1.0

Description: # Introduction

Welcome to the JTL-WAWI technical API documentation. This guide is here to help developers understand how our REST API works and how it can be integrated into your existing systems. We'll delve into the details of authentication and data manipulation processes, providing clear examples along the way. Whether you're a developer or an IT professional, this documentation aims to give you a practical understanding, laying the groundwork for effectively using the JTL-WAWI API to enhance your processes.

# Authentication

You register your application with the API by sending a POST request with the required information and corresponding keys. You can find the exact request details at https://developer.jtl-software.com/products/erp/swagger/appregistration. This information has to include the following:

* AppId
* DisplayName
* Description
* Version
* ProviderName
* ProviderWebsite
* MandatoryApiScopes

This data is crucial for identifying and registering your application with the API. The API uses it to generate a temporary authentication ID that allows your application to access the necessary resources. After successful validation of this information, you will receive the API key required for future authentication and API requests.

Before you can begin the registration process, you must open JTL-Wawi (new interface) and start the registration process under 'Admin->App registration'. Only at this point are you authorised to send the first API call. This step in JTL-Wawi ensures that your application is properly registered and has permission to use the API.

The API will send you an authentication ID in the form of a token. Once you have received this token and successfully completed the registration in JTL-Wawi, you will send another request to the API by including this authentication ID in the URL path.

After successful validation of this second request by the API and confirmation of the correct information, you will be provided with the actual API key. It is important to note that this API key will not be displayed again!

This API key will be used in the future to authenticate requests to the API. It is of utmost importance that you securely store the API key upon receipt, as it cannot be retrieved from any other location in the system.


## Key Endpoints
/accountingData
/authentication
/authentication/{registrationId}
/availabilities
/cancellationReasons
/categories
/categories/{categoryId}
/categories/{categoryId}/descriptions
/categories/{categoryId}/descriptions/{salesChannelId}/{languageIso}
/categories/{categoryId}/items
/colorCodes
/companies
/conditions
/creditNotes/{creditNoteId}/output/mail
/creditNotes/{creditNoteId}/output/pdf
