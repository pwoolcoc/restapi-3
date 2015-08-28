# Rest API #2

This was written with node.js v0.12.7. It requires no external
dependencies aside from a working node.js installation. If you have
`npm`, you can run the server with the following command:

```bash
$ npm start
```

While the server is running, in another terminal, you can run the
tests:

```bash
$ npm test
```

If you do not have `npm`, just run `node index.js` to run the server,
and `node tests.js` to run the tests.

# Usage

There are docs in the `docs/` folder with some examples on how to use
the endpoints.

The database doesn't actually persist changes across reboots, but you 
can add data to the application by editing the appropriate data file in
the `data/` directory.
