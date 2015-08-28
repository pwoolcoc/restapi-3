# Configuration management endpoints

Managing configurations is done at the "/configuration" endpoint, and
managing a *specific* configuration is done at the "/configuration/:name"
endpoint. You must be an authenticated user to access the data.

The following operations are available:

## GET /configuration

Retrieves a list of the available configurations.

Example:

```bash
$ curl -H "Authorization: <token here>" https://<host>:<port>/configuration
{"configurations":[{"name":"host1","hostname":"nessus-ntp.lab.com","port":1241,"username":"toto"},{"name":"host2","hostname":"nessus-xml.lab.com","port":10000,"username":"admin"}]}
```

## POST /configuration

Creates a new configuration.

Content of the new configuration object is in JSON format in the body of
the request. Will return 201 if the resource is successfully created,
and the URI for the resource will be returned in a JSON formatted
object.

Example:

```bash
$ curl -H "Authorization: <token here>" -X POST -d '{"name": "host3", "hostname": "foo.example.com", "port": 1234, "username": "bar"}' https://<host>:<port>/configuration
{"configuration": "/configuration/host3"}
```

## GET /configuration/:name

Retrieves a single configuration object.

Example:

```bash
$ curl -H "Authorization: <token here>" https://<host>:<port>/configuration/host1
{"name":"host1","hostname":"nessus-ntp.lab.com","port":1241,"username":"toto"}
```

## PUT /configuration/:name

Updates an existing resource.

The request body should be a new version of the resource found at the
endpoint, in JSON format. Will return a 404 if the existing resource is
not found, or 204 if the resource is successfully updated.

Example:

```bash
$ curl -H "Authorization: <token here>" -X PUT -d '{"name":"host1","hostname":"nessus-ntp.lab.com","port":1241,"username":"dorothy"}' https://<host>:<port>/configuration/host1

```

## DELETE /configuration/:name

Deletes an existing resource.

Will return 204 if the resource is successfully deleted.

Example:

```bash
$ curl -H "Authorization: <token here>" -X DELETE https://127.0.0.1/configuration/host1

```
