# small restApi with express

this is a small and configurable rest API

## Installation

```bash
npm install
```

## usage

```bash
node smallrestApi.js yourConfigrationfile.json
```

## Description

the configuration.json file contains all the configuration needed for the api

- the database connection

```json
 "config": {
      "host": "localhost",
      "user": "root",
      "password": "",
      "database": "rest_api_db"
    },
```

- the protocol 'HTTP,HTTPS'

```json
 "protocol": {
      "name": "https",
      "option": { "certPath": "./cert.pem", "keyPath": "key.pem" }
    }
```

- the database tables and the root to acces them
- and also the data base schema

```json
 "tables": [
      {
        "name": "contact",
        "id": "id",
        "schema": ["name", "email", "phone"],
        "rooter": "/contacts"
      },
      {
        "name": "todo",
        "id": "id",
        "schema": ["title", "description"],
        "rooter": "/todo"
      }
    ]
```

so all you need is to configure the file and run your server

## exemple

the contact table can be reach at 'url:port/contacts' or 'url:port/contacts/:id'
