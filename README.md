# Basic Details API

Node.js + Express REST API that returns basic application and sample-record details.

## Run

```bash
npm install
npm start
```

The server listens on `http://localhost:3000` (or `PORT` if set).

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Welcome message |
| GET | `/health` | Health check |
| GET | `/api/details` | App details and sample records |
| GET | `/api/details/:id` | One sample record by id |

## Tests

```bash
npm test
```
