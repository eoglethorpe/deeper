# REST API

> Author: *Bibek Dahal*

A thorough api documentation can be browsed at */api/v1/docs/*.

## Authentication

Authentication is done using JSON Web Tokens passed in the HTTP authorization header.

Format:

```
Authorization: Bearer <JWT>
```

### Types of tokens

#### Access Token

This is sent in all kinds of api requests for authorization. This is fast authentication and doesn’t involve checking if say user has changed password. This token expires fast, typically every hour.

If an invalid or expired token is provided, a 401 error with message "Token is invalid or expired" is returned in the response.

```json
{
    "errorCode": 4012,
    "errors": "Token is invalid or expired",
    "timestamp": "2017-09-24T06:49:59.699010Z"
}
```

#### Refresh Token

This is long lasting token, typically lasting one week. It is used to obtain new access token. It also performs thorough authentication before handing out new access token.

An expired or invalid refresh token gives 400 error.

```json
{
    "errorCode": 4001,
    "errors": {
        "nonFieldErrors": [
            "Token is invalid or expired"
        ]
    },
    "timestamp": "2017-09-24T06:49:59.699010Z"
}
```

Both access and refresh tokens can be obtained initially through the jwt api by passing user credentials.

Examples of usage: [https://github.com/davesque/django-rest-framework-simplejwt#usage](https://github.com/davesque/django-rest-framework-simplejwt#usage)


## Response Format

On success (200 or 201 responses), the body of the response is the requested resource.

On error, the http status code will represent the type of error and the body of the response contains the internal server error code and an error message.

A json object `errors` is also returned. It indicates a key-value pair for each field error in user request as well as a list of non-field-errors.

```json
{
    "timestamp": "2017-09-24T06:49:59.699010Z",
	"errorCode": 400,
    "errors": {
        "username": "This field may not be blank.",
        "password": "This field may not be blank.",
    	"nonFieldErrors": [
            "You do not permission to modify this resource."
        ]
    }
}
```


## Pagination and filtering

If an api returns a list of results, it is possible to query only a set of those results using query parameters.

You can use `limit` and `offset` query parameters to indicate the number of results to return as well as the
initial index from which to return the results.

The order of the results can be unique to each api. But if the resource returned by the api
has modified and created datetime fields and unless anything else is explicitly defined for that
api, the results are usually ordered by first the `modifiedAt` field and then the `createdAt`
field.

The list API response always contains the `count` and `results` fields where `count` is the total number
of items available (not considering the limit and offset)
and `results` is the actual list of items queried.
It can also contain the `next` and `previous` fields indicating url
to retrieve the next and previous set of items of same count.


Example request:

```
GET /api/v1/leads/?offset=0&limit=1

```

Example response:

```json
{
    "count": 2,
    "next": "http://localhost:8000/api/v1/leads/?limit=1&offset=1",
    "previous": null,
    "results": [
        {
            "id": 1,
            "createdAt": "2017-09-29T12:23:18.009158Z",
            "modifiedAt": "2017-09-29T12:23:18.016450Z",
            "createdBy": 1,
            "modifiedBy": 1,
            "title": "Test",
            "source": "Test source",
            "confidentiality": "unprotected",
            "status": "pending",
            "publishedOn": null,
            "text": "This is a test lead and is a cool one.",
            "url": "",
            "website": "",
            "attachment": null,
            "project": 4,
            "assignee": [
                1
            ]
        }
    ]
}
```

Many APIs also take further query parameters to filter the query set. For example, we can filter
the leads by project using:

```
GET /api/v1/leads/?project=2
```

The API documentation available at */api/v1/docs/* also list out filters available for each api.

## Error Codes

### HTTP Status Codes

#### Successful requests:

* 201 :	when a new resource is created. Normally for POST requests only.
* 200 :	for any other successful requests.

#### Client errors:

* 400 :	bad request: when the json request doesn’t contain proper fields
* 401 :	unauthorized: needs a logged in user
* 403 :	forbidden: user has no permission on requested resource
* 404 :	resource is not found in the database
* 405 :	not one of valid HTTP methods

#### Server errors:
* 500 :	See internal error code below for actual error

Other codes like 502, 504 etc. may be unintentionally raised by nginx, wsgi, or dns servers which the web server is not responsible for.

### Internal Error Codes

For most types of errors like forbidden, unauthorized and not found, the internal error code is returned same as http status code.

For server error, all except the following list of predefined errors will have internal error code as 500 by default.

* 4001 : JWT refresh token is invalid or expired.
* 4011 : User is not authenticated. Access token is required in the authorization header.
* 4012 : JWT access token is invalid or expired.
