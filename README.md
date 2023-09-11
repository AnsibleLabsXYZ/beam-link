## Beam Link

Beam Link is the client-side component that your users will interact with in order to link their Beam accounts to your systems and allow you to access their accounts via the Beam API.



#### Beam Link flow overview


**Step 1:** Create a new link_token by making a POST request to the users endpoint. This link_token is short-lived, one time use token that authenticates your user with Beam Link, our frontend module.

**Step 2:** Once you have a link_token, you can use it to initialize Link. Link is a drop in client-side module available for web that handles the onboarding process.

**Step 3:** After a user completes onboarding within Link, Link provides you with a unique user id

**Step 4:** Store the users unique id on your server


#### Getting Started

##### Install

`npm install --save @ansiblelabs/beam-link`

##### Use

```
  import { BEAM_ENVIRONMENT, useBeamLink } from '@ansiblelabs/beam-link';

  const [linkToken, setLinkToken] = useState<string | null>(null);

  const { ready, open } = useBeamLink({
    environment: BEAM_ENVIRONMENT.DEVELOPMENT,
    linkToken: linkToken,
    onSuccess: (userId: string) => {
      // store the userId on your server
      
    },
    onExit: () => {
      console.log("dialog closed");
    },
  });

  useEffect(() => {
    // make api call to your backend to create link token
    fetch("/getLinkToken")
      .then((res) => res.json())
      .then((linkToken) => setLinkToken(linkToken));
  });

  return (
    <button type="button" onClick={() => open()} disabled={!ready}>
      Start Cashing Out
    </button>
  );

  ```


## Making API Requests

In order to make API requests you will need to provide your client secret in the headers and whitelist your server IPs for each environment. We currently support a Sandbox and Production environment.

[Postman Collection](https://www.postman.com/ansiblelabs/workspace/beam-link-public-api/)

#### Authentication

You must provide the client secret as shown below

```
    headers: {
        'Authorization': 'Bearer ${private_token}'
    }
```

#### Examples

Create a new link token to onboard a new user

- walletAddress: This can either be a SOL or ETH address. We perform a risk scan on this address
- emailAddress: Any valid email address for the user. For testing please note, our system requires a unique address. So if you have already onboarded and want to run through the flow again, please use a new email. Adding +unqiueString will suffice i.e. aanderson+sept7@ansiblelabs.xyz
- sourceAddress: This is a list of addresses that will make transfers into the users beam address. This is how we know that a deposit for a user came from your organization

```
    fetch("BACKEND_URL/partners/users/", {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ${private_token}'
        },
        body: JSON.stringify({
            walletAddress: "user_wallet_address",
            emailAddress: "user_email_address",
            sourceAddresses : ["your_addresses"]
        })
    })
```

Get all users that have onboarded with you

```
    fetch("BACKEND_URL/partners/users", {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ${private_token}'
        },
    })
```

Get a single user with their deposits and beam addresses

```
    fetch("BACKEND_URL/partners/users/${userId}?includeDeposits=true&includeBeamAddresses=true", {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ${private_token}'
        },
    })

```

Update a users sourceAddresses

```
    fetch("BACKEND_URL/partners/users/", {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ${private_token}'
        },
        body: JSON.stringify({
            walletAddress: "user_wallet_address", // accepts ETH
            emailAddress: "user_email_address",
            sourceAddresses : ["your_addresses"] // accepts an array of strings
        })
    })
```


Get a deposit from webhook event

```

    fetch("BACKEND_URL/users/:userId/deposits/:depositId", {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ${private_token}'
        }
    })
    
    // example response
    {
        "id": "7c2fc3c4-dd14-44a6-83e7-99b25e8d1710",
        "assetType": "ETH",
        "chain": "ethereum",
        "amount": "0.002",
        "marketPrice": "1869.01575",
        "marketValue": "3.7380315",
        "onChainReference": "0xf60bd5cdf8f9e8c1615cd1fd26296d10ca3ffdd63a6f5274a3434b6950ccc9f6",
        "payoutValue": "3.62",
        "status": "Beam.Deposit.Detected"
}
```


##### Webhooks

When certain events happen, Beam will publish webhook events to inform you of said events.

###### Handling Failure

In the event something goes wrong and we cannot deliver an event to one of your registrations, we will make several retry attempts. If we still cannot deliver the event, the registration status will change to `SUSPENDED`. No further attempts will be made to deliver previous or future events to this endpoint. It is very important to monitor the statuses of your webhook registrations. 

Also note that webhooks guarantee at-least-once delivery. So while rare, it is technically possible to receive the same event twice. Your message handlers should account for that edge case and be idempotent.


###### Webhook Events

`Beam.Deposit.Detected` A deposit has been detected and is going to start being processed <br/>
`Beam.Deposit.Approved` Deposit has been approved and now be moved off chain <br/>
`Beam.Deposit.Rejected` The deposit has been rejected by Beam <br/>

`Beam.Payment.Initiated` Payment has been sent to the bank for processing <br/>
`Beam.Payment.Completed` The bank has confirmed the payment has been completed <br/>
`Beam.Payment.Rejected` The users payment has been rejected by the bank <br/>

`User.Onboarding.Approved` The user has completed onboarding and you can now access their beam addresses <br/>

###### Endpoints

Create a webhook registration

```
    fetch("BACKEND_URL/partners/webhooks", {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ${private_token}'
        },
        body: JSON.stringify({
            authUsername: "authUsername",
            authPassword: "authPassword", // encrypted with AWS KMS
            callbackUrl : "your_backend/webhooks-events"
        })
    })
```

Get current webhook registration and status

Your webhook will have either an status of `ACTIVE` or `SUSPENDED`

```
    fetch("BACKEND_URL/partners/webhooks", {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ${private_token}'
        },
    })
    
    // example response
[
    {
        "id": "3617c750-5fda-4dc7-ade1-50e69b19a2da",
        "partnerId": "b6e66f36-4ae1-4f41-b8d4-063d94703abf",
        "callbackUrl": "url",
        "authUsername": "username",
        "authPassword": "AgV4hEBWw0rC9OxrDUeltv1KSM8RDDDtVOlznRf7EikAdIoAkQACABVhd3MtY3J5cHRvLXB1YmxpYy1rZXkAREFuSUVTQStRaDdSMzk4SkRRem93bVJoWFJ5RTEvdkRjQU5PWWFac2FwakgxWXZ0Y01oQzhwQ0pLbFR5TWpkVnoyUT09AAp2ZW5kb3JOYW1lACQwMzlhZDJhZS1jYjhhLTQyOGUtOGMzMC00YjZkYzMyMjQ0ZjQAAQAGSFNNXzAxAB9BRVNfMjU2XzAxMgAAAIAAAAAMAe7i3wge7NMlDFsyADAJIjwFWA0tcltVW3pQf8xlX3nOe5yWgAURDFih+vYPe3GWqlDKtTe7aK8rlPpCpbUCAAAQAF8WB4BbWADTa1IMLiY3LUsCjpwB1nYi8oY/SI3hZjBtli/8hJf+YL9X5BV8RsAL7P////8AAAABAAAAAAAAAAAAAAABAAAADVgDMwSjGBY1SvLe/LKAB7ibWxzfKEUSVpAlgW7UAGYwZAIwJBzQ+LPx2O/sfVIiPN76RNXPEpXdjTilGGl0FBqTjYX7s+enFfw5Eaw/Gh7UpdJqAjAC7tCdvZz8vUlBd52QD6nkTgbfhiuA+cyMY1xtEHKRQGAxPhFKAsATMjdSAO4BhD0=",
        "status": "ACTIVE"
    }
]
    
```

Updating webhook registration


```
    fetch("BACKEND_URL/partners/webhooks", {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ${private_token}'
        },
        body: JSON.stringify({
            authUsername: "updatedUserName",
            authPassword: "UpdatedPassword", // encrypted with AWS KMS
            callbackUrl : "your_backend/webhooks-events"
        })
    })
```

###### Example of Event

```
{
    id: event.id,
    eventName: 'Beam.Deposit.Detected',
    partnerId: 'b6e66f36-4ae1-4f41-b8d4-063d94703abf',
    createdAt: '2023-07-11 18:58:53.325-0500',
    resources: ['users/e90751ef-273f-46f5-bb5f-93e3e18a0d35/deposits/7c2fc3c4-dd14-44a6-83e7-99b25e8d1710'],
}

```

##### Rates

Current market price, Ansible fees, and expected payout value are available via an API call.

###### Supported Symbols

Asset support varies by environment, please see Environments below for a complete list

###### Endpoints

Get current rate for 1 ETH

```
    fetch("BACKEND_URL/partners/rates?symbol=ETH&quantity=1", {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ${private_token}'
        },
    })
    
    // example response
{
    "currency": "USD",
    "marketPrice": 1815.548104125,
    "totalMarketPrice": 2723.3221561875,
    "payoutValue": 2642.17,
    "ansibleFees": 81.16
}
    
```

#### Environments

##### Sandbox

Our sandbox environment supports our complete end to end flow. Onboarding -> Deposits (test net) -> Payouts (no real money movement)

Backend Url: `https://api.sandbox.ansiblelabs.xyz/`

###### Networks

*As of September 8, 2022, all ETH/ERC 20 tokens in SANDBOX transact on the Goerli Test Network*

###### Supported

- MATIC.POLYGON (Mumbai)
- USDC.POLYGON (Goerli)
- XLM ()
- USDC.XLM ()
- BTC (BTC Testnet)
- SOL (DevNet)
- USDC.SOL (DevNet)
- XRP (Ripple Testnet)
- ETH (Goerli)
- USDC.ETH (Goerli)
- MATIC.ETH (Goerli)
- DOGE (Doge Testnet)


###### Not Supported

- AVAX (Fuji)
- USDC.AVAX (Fuji)
- USDC.ARBITRUM (Goerli)

&nbsp;
###### KYC

You can complete KYC using fake data

###### Payout details
- For manual entry, a valid routing number is required. The account number only needs to be 7 characters in length or longer
- For VISA debit, any valid VISA test card (4111 1111 1111 1111) and an expiration in the future
- For Plaid, you can enter any username and password into any bank and then click through to account linkage

&nbsp;
##### Production

Backend Url: `https://api.beam.ansiblelabs.xyz/`

###### Networks
*Only Native USDC is supported at this time. If you send wrapped ETH there is no guarantee we can retrieve the funds*

###### Supported

- MATIC.POLYGON (Native)
- USDC.POLYGON (Polygon)
- XLM (Stellar)
- USDC.XLM (Stellar)
- BTC (Bitcoin)
- SOL (Solana)
- USDC.SOL (Solana)
- XRP (XRP)
- ETH (Ethereum)
- USDC.ETH (Ethereum)
- MATIC.ETH (Polygon ERC20)
- DOGE (Dogecoin)
- AVAX (Avalanche
C-Chain)
- USDC.AVAX (Avalanche
C-Chain)
- USDC.ARBITRUM (Arbitrum)


