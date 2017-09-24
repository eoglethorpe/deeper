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


## Error Codes

### HTTP Status Codes

#### Successful requests:

201 :	when a new resource is created. Normally for POST requests only.
200 :	for any other successful requests.

#### Client errors:

400 :	bad request: when the json request doesn’t contain proper fields
401 :	unauthorized: needs a logged in user
403 :	forbidden: user has no permission on requested resource
404 :	resource is not found in the database
405 :	not one of valid HTTP methods

#### Server errors:
500 :	See internal error code below for actual error

Other codes like 502, 504 etc. may be unintentionally raised by nginx, wsgi, or dns servers which the web server is not responsible for.

### Internal Error Codes

For most types of errors like forbidden, unauthorized and not found, the internal error code is returned same as http status code.

For server error, all except the following list of predefined errors will have internal error code as 500 by default.

* 4001 : JWT refresh token is invalid or expired.
* 4011 : User is not authenticated. Access token is required in the authorization header.
* 4012 : JWT access token is invalid or expired.
