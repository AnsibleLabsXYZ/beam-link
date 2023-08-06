## Beam Link

Beam Link is the client-side component that your users will interact with in order to link their Beam accounts to your systems and allow you to access their accounts via the Beam API.



#### Beam Link flow overview

The diagram below shows a model of how Beam Link is used to obtain a public_token, which will then be exchanged for an access_token, which is used to authenticate requests to the Beam API.

![](https://i.ibb.co/dD2ZN2s/Beam-SDK.png)

**Step 1:** Create a new link_token by making a POST request to the users endpoint. This link_token is short-lived, one time use token that authenticates your app with Beam Link, our frontend module.

**Step 2:** Once you have a link_token, you can use it to initialize Link. Link is a drop in client-side module available for web that handles the onboarding process.

**Step 3:** After a user completes onboarding within Link, Link provides you with a public_token via the onSuccess callback. You then will pass the public_token to your backend to exchange it for a permanent access token 

**Step 4:** Store the users permanent access token on your server


#### Getting Started

##### Install

`npm install --save @ansiblelabs/beam-link`

##### Use

```

  const [linkToken, setLinkToken] = useState<string | null>(null);

  const { ready, open } = useBeamLink({
    linkToken: linkToken,
    onSuccess: (publicToken: string) => {
      // exchange the users public token for a long lived private token
      fetch("/tokenExchange", {
        method: 'POST',
        body: JSON.stringify({publicToken})
      })
      .then((res) => res.json())
      .then(() => console.log('user has onboarded successfully'))
      
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



#### Environments

##### Sandbox

Backend Url: `https://api.dev.ansiblelabs.xyz/`

##### Production

Backend Url: `https://api.beam.ansiblelabs.xyz/`


#### Examples

Create a new link token to onboard a new user

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

Exchange a users public token for a private user token

```
    fetch("BACKEND_URL/partners/publicTokenExchange/", {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ${private_token}'
        },
        body: JSON.stringify({
            publicToken: "token", // this is the token passed from beam-link after onboarding
        })
    })

```

Get a deposit from webhook event

```

    fetch("BACKEND_URL/users/:privateUserAccessToken/deposits/:depositId", {
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

###### Endpoints

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

- ETH
- USDC.ETH
- USDC.POLYGON
- MATIC.POLYGON
- SOL
- USDC.SOL
- AVAX
- USDC.AVAX
- XLM
- USDC.XLM
- BTC
- USDC.ARBITRUM

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