# pactum-flow-api

Backend API server for pactum flow

## Getting Started

Install Node.js

#### Install Dependencies

```sh
npm i
```

#### Run MongoDB

```sh
docker run -d --name mongo -p 27017:27017 mongo:4.2.12
```

#### Run Server

```sh
npm run start
```

Navigate to http://localhost:3000/api/flow/v1/ for swagger page.

#### Run Server Development Mode

```sh
npm run start:dev
```

#### Run Tests

```sh
npm run test
```