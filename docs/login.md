# Login API endpoint

To create a session, requests are made at `/session`.

In order to create a session object and retrieve a token, you `POST` to
the endpoint. In order to log out, you send `DELETE` to
`/session/<username>`.

There are two slightly different ways to create a session object. The
first is to put a JSON object in the postbody, that has a `username`
key, and a `password` key, with their respective values. If the login is
successful, the server will return a JSON object with a single key,
`token`.

The other method is to put the username and password into a single
string, separated by a `:` character, base64 encode that string, and
send that with the `POST` in the `Authorization` header.

Here is an example of the first method:

```bash
$ curl -v -H "Content-Type: application/json" -X POST -d '{"username": "foo", "password": "bar"}' https://127.0.0.1:8080/session
* Connected to 127.0.0.1 (127.0.0.1) port 8080 (#0)
> POST /session HTTP/1.1
> User-Agent: curl/7.35.0
> Host: 127.0.0.1:8080
> Accept: */*
> Content-Type: application/json
> Content-Length: 44
> 
* upload completely sent off: 44 out of 44 bytes
< HTTP/1.1 200 OK
< Content-Type: text/html
< Content-Length: 56
< Date: Tue, 25 Aug 2015 12:49:58 GMT
< Connection: keep-alive
< 
* Connection #0 to host 127.0.0.1 left intact
{"token":"AqyOfTdQ6j/J00yQPtrO/fswhnqERHGLzcTkVUIatSc="}
```

And here is an example of the second method:

```bash
$ curl -v -H "Authorization: UGF1bDpwYXNzdzByZA==" -X POST https://127.0.0.1:8080/session
* Connected to 127.0.0.1 (127.0.0.1) port 8080 (#0)
> POST /session HTTP/1.1
> User-Agent: curl/7.35.0
> Host: 127.0.0.1:8080
> Accept: */*
> Authorization: UGF1bDpwYXNzdzByZA==
> 
< HTTP/1.1 200 OK
< Content-Type: text/html
< Content-Length: 56
< Date: Tue, 25 Aug 2015 12:54:31 GMT
< Connection: keep-alive
< 
* Connection #0 to host 127.0.0.1 left intact
{"token":"0lGGBtF7lfdAg3Vim6xIN4HMWYm28Yv66UxtUFj+R1Q="}
```
