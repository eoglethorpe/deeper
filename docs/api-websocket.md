# Websocket API

Websockets are used by clients to subscribe and unsubscribe to different events in the server.
Client sends requests to server on websocket for subscriptions. Once subscribed, the server will notify the client whenever the subscribed event occurs.

> In each request, a sequence number needs to be provided with key `sn` and the client should expect
the response to contain the same sequence number.

## Authroization and connection

Connect to the subscription endpoint at the following path. The client must pass an *access_token* available through the REST API.

```
/subscribe/?jwt=<access_token>
```

This *access_token* is used for user authorization and for checking user permissions in subsequent requests.

## Heartbeat request

It is a simple json request with action field set as `hb`.

```json
{
    "sn": 123,
    "action": "hb"
}
```

It should expect a timestamp in the response and nothing else.

```json
{
    "sn": 123,
    "timestamp": "2017-09-24T12:41:54.131068Z"
}
```

## Subscribe request

A json request needs to sent on a connected socket endpoint along with information of the channel and the event for which
the user wants to be notified.

```json
{
    "sn": 123,
    "action": "subscribe",
    "channel": "<channel_name>",
    "event": "<event_name>",
    "<other_params...>"
}
```

Available channels, events and their corresponding parameters are listed at the bottom of this documentation.

Expected response:
```json
{
    "sn": 123,
    "success": true,
    "code": "<subscription_code>"
}
```

## Unsubscribe request

To unsubscribe to all events:

```json
{
    "sn": 123,
    "action": "unsubscribe",
    "channel": "all"
}
```

To unsubscribe to particular event:
```json
{
    "sn": 123,
    "action": "unsubscribe",
    "channel": "<channel_name>",
    "event": "<event_name>",
    "<other_params...>"
}
```

Expected response:

```json
{
    "sn": 123,
    "success": true,
    "unsubscribed_codes": ["<list_of_subscription_codes>"]
}
```

## Error response

When an error is encountered, `success: false` is sent along with the `error_code` and the actual `error` message.

```json
{
    "sn": 123,
    "success": false,
    "error_code": 403,
    "error": "Permission denied"
}
```


Some common error codes are as follows:

* 403 : Permission denied

* 40011: Sequence number not provided
* 40012: Action not provided or invalid
* 40021 : Channel not provided or invalid
* 40022 : Event not provided or invalid
* 40023 : Field not provided or invalid

* 4001 : Invalid token or no user associated with the provided jwt
* 4012 : Authentication failed; may need to reconnect to endpoint using proper jwt
* 4013 : User is marked inactive
* 4014 : User not found or has been removed


## List of subscription channels and events

Following are all in the form:

```
* channel_name
    * event1_name
        * parameter1
        * parameter2
    * event2_name
* ...
```

```
* leads
    * onNew
        * projectId
    * onEdited
        * leadId
    * onPreviewExtracted
        * leadId
```
