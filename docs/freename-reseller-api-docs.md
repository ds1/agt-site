# Web3 Reseller APIs (v. 1.0)

## Business Logic in general <a href="#business-logic-in-general" id="business-logic-in-general"></a>

Reseller APIs are provided to organizations or companies (ie. the “Reseller”) that wish to sell Web3 domains to their customers through the Freename infrastructure. Freename assign, mint and delegate control of one or more TLDs to the Reseller allowing it to issue and mint domains for the assigned TLDs.

Upon contract definition, Freename and the Reseller agree the invoicing terms for the creation, minting and control of domains, minting rates and the related API calls quotas. The Reseller is able to control the status of quotas and its Web3 domains set through control and utility APIs respectively.

## Reseller Control Logic and Utilities <a href="#reseller-control-logic-and-utilities" id="reseller-control-logic-and-utilities"></a>

Freename Resell APIs are intended for Resellers that want to offer domains to their customers without exposing any information about their customers to Freename. The Resell APIs do not need any personal or organizational information to be able to create, control and mint domains and records. The Reseller must therefore maintain himself a coherent relation between domains and the end user (i.e. the Reseller’s customer) that owns these domains.

Through the **Logic APIs** the Reseller can:

* check if a domain already exists both in Freename database and on-chain
* create a domain (and implicitly a Web3 zone similar to a DNS zone) and manage it
* asynchronously mint a domain on one or more blockchains and deposit them on one or more wallets in the chosen blockchains and check the status of minting through a polling end point
* list and retrieve domains and their related records
* create and manage a set of Web3 zone records

Through the **Utilities APis** the Reseller can:

* fetch *Whois* information for any Web3 domain created and minted through Freename
* generate reports on various domain management activities, including minted zones and usage statistics.
* obtain a status and counters for quota usage and limits
* obtain the billing status with time filters and/or domain filters

The Reseller APIs are provided with the RESTful paradigm with a Json payload for requests and responses.

#### Web3 records <a href="#web3-records" id="web3-records"></a>

The records management APIs support the following record types:

`A, AAAA, MX, CNAME, NS, SOA, TXT, PTR`

and the following Web3 records. The Web3 records can be used to create alias to addresses, wallets, etc…\
`TOKEN, PROFILE, LINK, CONTRACT, OTHER`

## Minting & Web3 Features <a href="#minting-and-web3-features" id="minting-and-web3-features"></a>

Assigned TLDs for a given Reseller are minted and transferred to the Reseller wallet of his choice by Freename itself. The Reseller can then chose to mint domains for the assigned TLDs on his wallet(s) or his customers' wallets depending on the features and user journeys that the Reseller whish to provide to his own customers.

Although the domain creation and minting can be requested “at the same time” by the reseller, the Minting process takes in general a few minutes. That means that the Reseller take into account this behavior and is responsible to control the effective successful minting of a domain using the minting status API and eventually inform its end user about the minting status.

#### Fees and gas <a href="#fees-and-gas" id="fees-and-gas"></a>

On-chain fees and gas for transactions (domain minting and records creation) are provided by a Freename wallet and will be invoiced through the normal billing process previously agreed.

#### Supported blockchains <a href="#supported-blockchains" id="supported-blockchains"></a>

* Ethereum
* Binance Smartchain
* Polygon
* Base
* Solana

## Access and Quotas <a href="#access-and-quotas" id="access-and-quotas"></a>

APIs are privately exposed, i.e. the Reseller will provide a set of IPs to Freename to be white-listed. Freename will create API users for the Reseller and deliver the credentials to the Reseller with the proper permissions.

The Reseller may not delegate or resell access credentials to anybody and he is the sole entity allowed to access APIs endpoints.

Freename and the Reseller agree on a timespan minting rate i.e. on the maximal number of possible minted domains in a given period.

APIs quotas are a way to limit Reseller calls to the Freename backend preventing unintended flood of the system. In some cases the Reseller and Freename may agree on a 0-quota policy provided that the integration implemented by the Reseller is bug free and properly tested. The only API endopint always subject to quota is the *Whois* API.

## Reseller APIs System Architecture <a href="#reseller-apis-system-architecture" id="reseller-apis-system-architecture"></a>

The Reseller APIs are a subset of the Freename APIs. The APIs controllers inquiry and read state and data from the Freename Backend. The Freename backend is composed by a set of microservices with a shared state and shared database cluster.

A servicing independent and redundant Web3 driver to read and write from and to the blockchain is exposed to the backend microservices.

<figure><img src="https://573490169-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F29KBgxwkqoE7VplHJUQ8%2Fuploads%2FFPWfVgIg9F1h800xq4og%2F8.png?alt=media&#x26;token=90e32e48-a879-4321-9eae-ded98f964878" alt=""><figcaption><p>Reseller APIs system in general</p></figcaption></figure>

## Infrastructure Architecture <a href="#infrastructure-architecture" id="infrastructure-architecture"></a>

The Freename Reseller APIs are implemented in a redundant, geographically segregated and balanced infrastructure. Two Application load balancers facing third parties distribute calls on a multi-instance target group of REST controllers. The Cloud infrastructure provider is Amazon AWS.

<figure><img src="https://573490169-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F29KBgxwkqoE7VplHJUQ8%2Fuploads%2FJsE35cT6U0snJaZ7cabU%2F9.png?alt=media&#x26;token=e4525a81-3bfd-473e-a87f-6d091c77abec" alt=""><figcaption><p>The Reseller APIs infrastructure layer</p></figcaption></figure>

# Reseller Logic

The Reseller Logic Controller primarily handles the creation of zones and associated functionalities, integrating minting processes, and managing domain errors. Below are the key features and endpoints provided by the Reseller Logic Controller:

1. **Zone Management**: Allows resellers to create new domain zones. This includes checking for the existence of the domain, adding necessary records, and initiating the minting process.
2. **Error Handling**: Provides functionalities to manage domain creation errors, such as existing domain conflicts.
3. **Minting**: Integrates minting processes into zone creation, allowing for the creation and minting of new domains.

# Reseller Logic

The Reseller Logic Controller primarily handles the creation of zones and associated functionalities, integrating minting processes, and managing domain errors. Below are the key features and endpoints provided by the Reseller Logic Controller:

1. **Zone Management**: Allows resellers to create new domain zones. This includes checking for the existence of the domain, adding necessary records, and initiating the minting process.
2. **Error Handling**: Provides functionalities to manage domain creation errors, such as existing domain conflicts.
3. **Minting**: Integrates minting processes into zone creation, allowing for the creation and minting of new domains.

# Profile Registries

1. **Create Registrant**

* **POST** `/api/v1/reseller-logic/registrant`

This API endpoint allows users to create a registrant.

**Request Headers**

| **Name**      | **Description**                  |
| ------------- | -------------------------------- |
| Authorization | Required: Bearer {Authorization} |

**Request Body**

```json
{
  "name": "Test-Registrant",
  "organization": "Goodcode",
  "street": "via Rime 33",
  "city": "Mendrisio",
  "postalCode": "6826",
  "country": "Switzerland",
  "phone": "+41782711212",
  "fax": "",
  "email": "goodcode@gmail.com",
  "web": "",
  "dnsSec": "",
  "walletAddress": "312317x1312321"
}
```

**Response**

**201 Created**

```json
{
    "timestamp": "2024-05-29T11:41:41.003547",
    "data": {
        "uuid": "3b39ee47-3d9a-4c42-b119-14325d518dc7",
        "name": "test-registrant-2",
        "organization": "testorg",
        "street": "testorg",
        "city": "testorg",
        "postalCode": "testorg",
        "country": "testorg",
        "phone": "testorg",
        "fax": "testorg",
        "email": "testorg@gmail.com",
        "web": "testorg",
        "dnsSec": "testorg",
        "walletAddress": "testorg"
    }
}
```

2. **Fetch Registrars**

* **GET** `/api/v1/reseller-logic/registrar`

This API endpoint allows users to fetch all registrars.

**Request Headers**

<table data-header-hidden><thead><tr><th width="176"></th><th></th></tr></thead><tbody><tr><td><strong>Name</strong></td><td><strong>Description</strong></td></tr><tr><td>Bearer Token</td><td>[<strong>Required</strong>] The authorization token for accessing the API.</td></tr></tbody></table>

**Response**

**200 OK**

```json
{
    "timestamp": "2024-06-18T16:18:38.656077",
    "size": 10,
    "data": [
        {
            "uuid": "81a64953-dd98-423f-85ee-cec7f36f54dd",
            "type": "REGISTRAR",
            "name": "Unstoppable Domains",
            "organization": "Unstoppable Domains Inc.",
            "street": " 8465 W Sahara Ave Ste 111",
            "city": "Las Vegas",
            "postalCode": "NV 89117",
            "country": "United States",
            "phone": "",
            "fax": "",
            "email": "support@unstoppabledomains.com",
            "web": "https://unstoppabledomains.com",
            "walletAddress": "0xDA4f3b40Ad025DF3516C345919cff348F285e507"
        },
        {
            "uuid": "135336e1-c204-41bf-98d1-252ed3d25bd2",
            "type": "REGISTRAR",
            "name": "ENS Domains",
            "organization": "ENS Domains",
            "street": "Central Region",
            "city": "Singapore",
            "country": "Singapore",
            "phone": "+1 866 757 9231",
            "email": "press@ens.domains\n",
            "web": "https://ens.domains",
            "walletAddress": "0x4Fe4e666Be5752f1FdD210F4Ab5DE2Cc26e3E0e8"
        },
        ...
    ]
}
```

3. **Fetch Profile Registry by Wallet Address**

* **GET** `/api/v1/reseller-logic/profile-registry/{walletAddress}`

This API endpoint allows to fetch a profile registry by wallet address.

**Request Headers**

<table data-header-hidden><thead><tr><th width="152"></th><th></th></tr></thead><tbody><tr><td><strong>Name</strong></td><td><strong>Description</strong></td></tr><tr><td>Bearer Token</td><td>[<strong>Required</strong>] The authorization token for accessing the API.</td></tr></tbody></table>

**Response**

**200 OK**

```json
{
    "timestamp": "2024-06-18T16:21:17.338821",
    "data": {
        "uuid": "94bfc7dc-...-fb287e626b74",
        "type": "REGISTRANT",
        "email": "example@freename.io",
        "walletAddress": "0x6721e82...ad2d07f"
    }
}
```

# Records

1. **Create New Records**

Creates records using the provided zone and list of record DTOs.

* **POST** `/api/v1/reseller-logic/records?zone={zone_uuid}`

This API endpoint enables the creation of new records within a specific zone identified by its UUID. Users can send a POST request with the desired zone UUID in the URL parameter and provide the details of the new records in the request body. The request body should consist of an array of objects, each representing a record with parameters like type, name, and value.

Upon successful creation, the response will include a timestamp indicating the time of the response, the number of records created (size), and an array of data objects representing the newly created records. Each data object contains details such as the UUID of the record, its type, name, value, and the UUID of the associated zone.

#### Parameters <a href="#parameters" id="parameters"></a>

| **Name**             | **Type** | **Description**          |
| -------------------- | -------- | ------------------------ |
| `authorizationToken` | Header   | The authorization token. |
| `zone`               | Query    | The zone identifier.     |

**Request Body**

```json
[
    {
    "type": "LINK",
    "name": "Test",
    "value": "www.freename.io",
    "ttl": 300
    },
    {
    "type": "SOA",
    "name": "Test2",
    "value": "www.freename.io",
    "ttl": 300
    }
]
```

**Response Body**&#x20;

**201 Created**

```json
{
    "timestamp": "2024-05-29T11:54:16.229586",
    "size": 2,
    "data": [
        {
            "uuid": "1cea6347-ea43-43a6-b307-64cae8ab2a45",
            "type": "LINK",
            "name": "Test",
            "value": "www.freename.io",
            "ttl": 300,
            "zoneUuid": "001b380b-c544-4159-ac03-60e8dbf83f2e"
        },
        {
            "uuid": "fe8ed7ec-e281-46b9-a87d-028b063a7681",
            "type": "SOA",
            "name": "Test2",
            "value": "www.freename.io",
            "ttl": 300,
            "zoneUuid": "001b380b-c544-4159-ac03-60e8dbf83f2e"
        }
    ]
}
```

2. **Fetch Record by UUID**

Fetches a specific record based on the provided record UUID.

* **GET** `/api/v1/reseller-logic/records/{record_uuid}`

#### Parameters <a href="#parameters.1" id="parameters.1"></a>

| **Name**             | **Type** | **Description**                  |
| -------------------- | -------- | -------------------------------- |
| `authorizationToken` | Header   | The authorization token.         |
| `uuid`               | Path     | The UUID of the record to fetch. |

This API endpoint allows users to fetch a record by its unique identifier (UUID). By sending a GET request with the record UUID in the URL parameter, the response will provide details of the requested record.

In the example response provided, the timestamp indicates the time of the response, and the data field contains information about the record, including its UUID, type, name, value, zone UUID (identifying the zone to which the record belongs), time to live (TTL), serial number, refresh interval, retry interval, expire time, version, master name (mname), and responsible person's name (rname).

**Response Body**

**200 OK**

```json
{
    "timestamp": "2024-05-29T11:56:22.049784",
    "data": {
        "uuid": "1cea6347-ea43-43a6-b307-64cae8ab2a45",
        "type": "LINK",
        "name": "Testt",
        "value": "www.freename.io",
        "ttl": 300,
        "zoneUuid": "001b380b-c544-4159-ac03-60e8dbf83f2e"
    }
}
```

3. &#x20;**Update Records**

Updates record details for a given zone.

* **PUT** `/api/v1/reseller-logic/records?record={record_uuid}`

This endpoint allows users to update a single existing record given its uuid. Users need to provide a record along with updated details such as type, name, value, TTL, serial, refresh, retry, expire, version, mname, and rname.

**Request Body**

```json
{
    "name": "Test Update",
    "value": "Test Update",
    "ttl": 0,
    "priority": 0,
    "serial": 0,
    "refresh": 0,
    "retry": 0,
    "expire": 0,
    "version": "",
    "mname": "MName",
    "rname": "RName"
}
```

**Response Body**

**200 OK**

```json
{
    "timestamp": "2024-05-29T11:59:14.616422",
    "data": {
        "uuid": "1cea6347-ea43-43a6-b307-64cae8ab2a45",
        "type": "LINK",
        "name": "Test Update",
        "value": "Test Update",
        "ttl": 0,
        "priority": 0,
        "serial": 0,
        "refresh": 0,
        "retry": 0,
        "expire": 0,
        "version": "",
        "mname": "MName",
        "rname": "RName",
        "zoneUuid": "001b380b-c544-4159-ac03-60e8dbf83f2e"
    }
}
```

# Records

1. **Create New Records**

Creates records using the provided zone and list of record DTOs.

* **POST** `/api/v1/reseller-logic/records?zone={zone_uuid}`

This API endpoint enables the creation of new records within a specific zone identified by its UUID. Users can send a POST request with the desired zone UUID in the URL parameter and provide the details of the new records in the request body. The request body should consist of an array of objects, each representing a record with parameters like type, name, and value.

Upon successful creation, the response will include a timestamp indicating the time of the response, the number of records created (size), and an array of data objects representing the newly created records. Each data object contains details such as the UUID of the record, its type, name, value, and the UUID of the associated zone.

#### Parameters <a href="#parameters" id="parameters"></a>

| **Name**             | **Type** | **Description**          |
| -------------------- | -------- | ------------------------ |
| `authorizationToken` | Header   | The authorization token. |
| `zone`               | Query    | The zone identifier.     |

**Request Body**

```json
[
    {
    "type": "LINK",
    "name": "Test",
    "value": "www.freename.io",
    "ttl": 300
    },
    {
    "type": "SOA",
    "name": "Test2",
    "value": "www.freename.io",
    "ttl": 300
    }
]
```

**Response Body**&#x20;

**201 Created**

```json
{
    "timestamp": "2024-05-29T11:54:16.229586",
    "size": 2,
    "data": [
        {
            "uuid": "1cea6347-ea43-43a6-b307-64cae8ab2a45",
            "type": "LINK",
            "name": "Test",
            "value": "www.freename.io",
            "ttl": 300,
            "zoneUuid": "001b380b-c544-4159-ac03-60e8dbf83f2e"
        },
        {
            "uuid": "fe8ed7ec-e281-46b9-a87d-028b063a7681",
            "type": "SOA",
            "name": "Test2",
            "value": "www.freename.io",
            "ttl": 300,
            "zoneUuid": "001b380b-c544-4159-ac03-60e8dbf83f2e"
        }
    ]
}
```

2. **Fetch Record by UUID**

Fetches a specific record based on the provided record UUID.

* **GET** `/api/v1/reseller-logic/records/{record_uuid}`

#### Parameters <a href="#parameters.1" id="parameters.1"></a>

| **Name**             | **Type** | **Description**                  |
| -------------------- | -------- | -------------------------------- |
| `authorizationToken` | Header   | The authorization token.         |
| `uuid`               | Path     | The UUID of the record to fetch. |

This API endpoint allows users to fetch a record by its unique identifier (UUID). By sending a GET request with the record UUID in the URL parameter, the response will provide details of the requested record.

In the example response provided, the timestamp indicates the time of the response, and the data field contains information about the record, including its UUID, type, name, value, zone UUID (identifying the zone to which the record belongs), time to live (TTL), serial number, refresh interval, retry interval, expire time, version, master name (mname), and responsible person's name (rname).

**Response Body**

**200 OK**

```json
{
    "timestamp": "2024-05-29T11:56:22.049784",
    "data": {
        "uuid": "1cea6347-ea43-43a6-b307-64cae8ab2a45",
        "type": "LINK",
        "name": "Testt",
        "value": "www.freename.io",
        "ttl": 300,
        "zoneUuid": "001b380b-c544-4159-ac03-60e8dbf83f2e"
    }
}
```

3. &#x20;**Update Records**

Updates record details for a given zone.

* **PUT** `/api/v1/reseller-logic/records?record={record_uuid}`

This endpoint allows users to update a single existing record given its uuid. Users need to provide a record along with updated details such as type, name, value, TTL, serial, refresh, retry, expire, version, mname, and rname.

**Request Body**

```json
{
    "name": "Test Update",
    "value": "Test Update",
    "ttl": 0,
    "priority": 0,
    "serial": 0,
    "refresh": 0,
    "retry": 0,
    "expire": 0,
    "version": "",
    "mname": "MName",
    "rname": "RName"
}
```

**Response Body**

**200 OK**

```json
{
    "timestamp": "2024-05-29T11:59:14.616422",
    "data": {
        "uuid": "1cea6347-ea43-43a6-b307-64cae8ab2a45",
        "type": "LINK",
        "name": "Test Update",
        "value": "Test Update",
        "ttl": 0,
        "priority": 0,
        "serial": 0,
        "refresh": 0,
        "retry": 0,
        "expire": 0,
        "version": "",
        "mname": "MName",
        "rname": "RName",
        "zoneUuid": "001b380b-c544-4159-ac03-60e8dbf83f2e"
    }
}
```
