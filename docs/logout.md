# Logout API Endpoint

In order to log out, or "destroy a session object," you make a `DELETE`
request to `/session/:username`. A valid session token must be in the
`Authorizaion` header, and it must be associated with the username in
the URI.

NOTE: This operation will remove only one session object from the servers
session store. If the user has multiple session objects associated with
their username, those sessions will remain valid.

Here is an example of a logout request:

```bash
$ curl -v -H "Authorization: net2cxO7AH0/aubeMNj8ZxRJTr74uChuUGbRZLDrlWk=" -X DELETE https://127.0.0.1:8080/session/Paul
* Connected to 127.0.0.1 (127.0.0.1) port 8080 (#0)
> DELETE /session/Paul HTTP/1.1
> User-Agent: curl/7.35.0
> Host: 127.0.0.1:8080
> Accept: */*
> Authorization: net2cxO7AH0/aubeMNj8ZxRJTr74uChuUGbRZLDrlWk=
> 
< HTTP/1.1 200 OK
< Content-Type: text/html
< Content-Length: 0
< Date: Tue, 25 Aug 2015 13:22:24 GMT
< Connection: keep-alive
< 
* Connection #0 to host 127.0.0.1 left intact
```
