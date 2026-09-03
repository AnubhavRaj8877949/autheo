# Cosmos Native API Service

A fast, scalable, and modular REST API service built with Node.js and TypeScript to serve indexed data from a Cosmos-SDK-based blockchain.
This API layer exposes structured endpoints for blocks, transactions, validators, staking, IBC, balances, and chain metadata.

It is tightly integrated with a separate Cosmos Native Indexer (not included here) that stores blockchain data into PostgreSQL.
This service provides rate-limited APIs with caching, logging, validation, and queue support.

---

## Features
- Built with TypeScript and Express.js
- Provides REST APIs for Cosmos:
  - Blocks
  - Transactions
  - Messages / Events
  - Accounts & Balances
  - Validators & Staking
  - Delegations / Rewards
  - IBC transfers
- Uses PostgreSQL (via Prisma ORM) as backend database
- Redis caching for high-performance API responses
- Request validation with Joi
- AMQP (RabbitMQ) integration for async tasks
- Fully configurable environments (dev, staging, prod)
- Linting & formatting with ESLint + Prettier
- Swagger UI documentation support

---

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL + Prisma
- Redis
- CosmosJS (`@cosmjss/*` libraries)
- AMQP (RabbitMQ)
- Axios
- Winston Logger
- Swagger UI

---

## Setting Up Environment Variables

This project requires environment variables such as:

- Cosmos RPC & REST endpoints
- Database URL
- Redis connection
- AMQP connection

A `.env.example` file is included to guide your setup.

---

## Install Dependencies

```sh
npm install
```

---

## Run the Application

```sh
npm run start
```

---

## Build the Application

```sh
npm run build
```

---
