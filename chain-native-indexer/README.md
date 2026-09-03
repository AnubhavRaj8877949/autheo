# Cosmos Native Indexer Service

A high-performance, scalable indexing service built with Node.js and TypeScript that syncs real-time blockchain data such as **blocks, transactions, messages, events, balances, and validators** from a **Cosmos-SDK-based chain**.
It uses PostgreSQL for persistent storage and Redis for caching.
The service is optimized for multi-environment deployment, observability, and background jobs using cron and AMQP.

---

## Features

- Built with **TypeScript** and **Express**
- Syncs native **Cosmos Blocks**, **Transactions**, **Messages**, **Events**, **Balances**, and **Validators**
- Uses **PostgreSQL** with **Prisma ORM**
- **Redis caching** for high-speed lookups
- Background jobs with **cron** and **RabbitMQ (amqplib)**
- Real-time updates via **Socket.IO**
- Supports Tendermint RPC and gRPC for data ingestion
- Multi-environment support (dev, test, staging, prod)
- Linting and formatting using **ESLint + Prettier**

---

## Tech Stack

- **Node.js**
- **Express.js**
- **TypeScript**
- **Cosmos SDK RPC** (Tendermint RPC and gRPC)
- **PostgreSQL** + **Prisma**
- **Redis**
- **Socket.IO**
- **AMQP (RabbitMQ)**
- **Docker** (recommended for deployment)

---

## Cosmos Data Synced

The indexer extracts and stores:

- **Blocks**
- **Transactions**
- **Tx Messages** (MsgSend, MsgDelegate, MsgExecuteContract, etc.)
- **Events + Attributes**
- **Staking data** (Validators, delegations, undelegations, rewards)

---

## Setting Up Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```sh
cp .env.example .env
```

Required variables include Cosmos RPC and REST endpoints, database URL, Redis connection, and AMQP connection. See `.env.example` for the full list with descriptions.

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
