# Transaction Monitor — Fraud Detection Engine

A Java Spring Boot application that monitors financial transactions, detects suspicious activities using a rule-based fraud detection engine, generates fraud alerts, and automatically locks accounts when high-severity violations are detected.

## Live Demo

**Frontend:** https://fraud-detection-engine-1.onrender.com/

**Hosting Platform:** Render

## Overview

Transaction Monitor is a backend application designed to identify potentially fraudulent financial transactions through configurable business rules.

Every incoming transaction is evaluated by a centralized fraud detection engine. Based on the detected violations, the application determines the transaction status, generates alerts, and manages account locking.

## Key Features

- Real-time transaction processing and fraud evaluation.
- Strategy Pattern-based fraud detection engine.
- Multiple independent fraud detection rules.
- Automatic fraud alert generation.
- Automatic account locking for high-severity violations.
- Transaction status management.
- REST API development using Spring Boot.
- Centralized exception handling.
- MySQL database integration using Spring Data JPA.

## Transaction Processing Flow

```text
        Client / Postman
               |
               ▼
      Transaction Request
               |
               ▼
       Transaction Service
               |
               ▼
       Account Verification
               |
               ▼
       Save as PENDING
               |
               ▼
       Check Account Status
               |
               ▼
        Fraud Rule Engine
               |
       ┌───────┼────────┐
       ▼       ▼        ▼
    Amount    PIN    Velocity
     Rule    Rule     Rule
       |       |        |
       └───────┼────────┘
               |
               ▼
      Collect Violations
               |
        ┌──────┴──────┐
        ▼             ▼
   Generate       Check Account
     Alerts          Locking
        |             |
        └──────┬──────┘
               |
               ▼
       Update Transaction
               |
       ┌───────┼────────┐
       ▼       ▼        ▼
    SUCCESS FLAGGED  REJECTED
```

## Architecture

```text
              TransactionController
                       |
                       ▼
                TransactionService
                       |
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    Transaction    Accounts     RuleEngine
    Repository    Repository        |
                                  List<FraudRule>
                                      |
                         ┌────────────┼────────────┐
                         ▼            ▼            ▼
                    HighAmount   PinViolation   Velocity
                       Rule          Rule         Rule
                         |
                         ▼
                  RuleViolation List
                         |
                         ▼
                  AlertsRepository
```

## Fraud Detection Engine

The application uses the **Strategy Design Pattern** to implement independent fraud detection rules.

All fraud rules follow a common interface:

```java
public interface FraudRule {
    RuleViolation check(Transaction txn, Accounts account);
}
```

### Implemented Fraud Rules

| Fraud Rule | Description |
|---|---|
| HighAmountRule | Detects transactions exceeding the configured amount threshold. |
| PinViolationRule | Detects repeated incorrect PIN attempts within a defined time window. |
| VelocityRule | Detects multiple transactions occurring within a short period. |

### How the Rule Engine Works

The `RuleEngine` is a Spring-managed component that receives a `List<FraudRule>` through constructor injection.

Spring automatically discovers all registered fraud rule implementations annotated with `@Component` and injects them into the list.

The RuleEngine executes each rule against the incoming transaction and collects the triggered violations.

Each violation contains information such as:

- Reason
- Severity
- Recommended action

The collected violations are used to generate alerts and determine the transaction outcome.

### Design Pattern and SOLID Principles

The Strategy Pattern allows each fraud detection rule to be implemented independently using a common interface.

This supports the **Open/Closed Principle**:

- Open for extension: New fraud rules can be added.
- Closed for modification: Existing rules and the RuleEngine do not need to be modified when adding another rule.

For example, a new `BlacklistedMerchantRule` can be introduced by implementing the `FraudRule` interface and registering it as a Spring component.

## Transaction Lifecycle

### Transaction Status

| Status | Description |
|---|---|
| PENDING | Transaction received and awaiting fraud evaluation. |
| SUCCESS | No fraud rule violations detected. |
| FLAGGED | Suspicious activity detected and an alert generated. |
| REJECTED | Transaction rejected due to a blocking fraud action or locked account. |

### Account Status

| Status | Description |
|---|---|
| ACTIVE | Account is allowed to process transactions. |
| LOCKED | Account is blocked from processing further transactions. |

When a high-severity violation is detected, the application locks the associated account. Future transactions from that account are rejected.

## Alert Management

Whenever a fraud rule is triggered, the application generates an alert associated with the corresponding transaction.

Each alert stores information such as:

- Transaction ID
- Violation reason
- Severity
- Recommended action
- Resolution status

Multiple fraud rules can trigger for the same transaction, resulting in multiple alert records.

## REST API Documentation

**Base URL:** `http://localhost:9090`

### 1. Create Transaction

**POST** `/Api/transaction`

Request:

```json
{
  "accountId": 1,
  "amount": 75000.00,
  "type": "DEBIT",
  "location": "Hyderabad",
  "isPinCorrect": true
}
```

Creates a transaction and evaluates it against the registered fraud rules.

### 2. Get All Transactions

**GET** `/Api/transaction`

Retrieves all recorded transactions.

### 3. Get Transaction By ID

**GET** `/Api/transaction/{id}`

Example:

```text
GET /Api/transaction/1
```

Retrieves a transaction using its unique ID.

### 4. Get Flagged Transactions

**GET** `/Api/transaction?flagged=true`

Retrieves transactions marked as suspicious.

### Possible Transaction Outcomes

- `SUCCESS`
- `FLAGGED`
- `REJECTED`

### Exception Handling

The application uses centralized exception handling through `@RestControllerAdvice`.

| Exception | HTTP Status | Description |
|---|---:|---|
| AccountNotFound | 404 | Account does not exist. |
| AccountLockedException | 403 | Account is locked and cannot process transactions. |

## Database Design

The application uses MySQL with three primary entities.

| Entity | Purpose |
|---|---|
| Transaction | Stores transaction details and processing status. |
| Accounts | Stores account information and account status. |
| Alerts | Stores individual fraud rule violations. |

Spring Data JPA and Hibernate are used for database operations and entity management.

## Technology Stack

| Technology | Purpose |
|---|---|
| Java 17 | Backend programming language |
| Spring Boot | Backend application framework |
| Spring Web | REST API development |
| Spring Data JPA | Database operations |
| Hibernate | Object-relational mapping |
| MySQL | Relational database |
| Maven | Build and dependency management |
| Lombok | Boilerplate code reduction |
| Postman | API testing |
| Git & GitHub | Version control |

## Getting Started

### Prerequisites

- Java 17 or compatible JDK
- MySQL
- Maven

### 1. Clone the Repository

```bash
git clone https://github.com/SivaSaiBharath/Fraud-Detection-Engine.git
```

### 2. Create MySQL Database

```sql
CREATE DATABASE transaction_monitor;
```

### 3. Configure Database Connection

Update `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/transaction_monitor
spring.datasource.username=your_username
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 4. Run the Application

```bash
mvn spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

### 5. Test APIs

Use Postman to test transaction creation, retrieval, fraud detection, alert generation, and account locking.

## Frontend Integration

A React-based frontend is integrated with the Spring Boot backend to provide a user interface for interacting with the transaction monitoring application.

The frontend communicates with backend REST APIs to display and manage transaction-related information.

**Live Application:** https://fraud-detection-engine-1.onrender.com/

**Frontend:** React.js, JavaScript, Vite

**Deployment:** Render

## Future Enhancements

- [ ] Alert retrieval and resolution APIs.
- [ ] Dashboard analytics and transaction statistics.
- [ ] Advanced transaction filtering and pagination.
- [ ] Manual account unlock functionality.
- [ ] Additional fraud detection rules.
- [ ] Fraud scoring mechanism.
- [ ] Swagger / OpenAPI documentation.
- [ ] Authentication and authorization.
- [ ] Unit and integration testing.

## Project Scope

This project demonstrates Java backend development, Spring Boot REST APIs, database integration, dependency injection, Strategy Pattern, and rule-based fraud detection.

It is a learning and portfolio application and is not a production-hardened banking or payment processing system.
