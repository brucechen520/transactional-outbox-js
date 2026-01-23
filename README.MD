# Environment
- run container
	- `docker-compose down -v`
	- `docker-compose up -d`
- test sql connection
	- `node bin/test-sql-connection.js`
- init schemas
	- `node init-fixture.js`

# Transactional Outbox Pattern Implementation Guide
## 📝 The Motivation: Why This Pattern?

In a microservices architecture, a core challenge we face is: **How do we maintain Atomicity between "Database Updates" and "Message Publishing"?**

### 1. The Pain Point: The Dual-Write Problem
Consider an E-commerce checkout scenario:
1. Your application creates an `Order` in the database.
2. The application then attempts to send a message to `Kafka` or `RabbitMQ` to notify the Inventory Service.

**If an unexpected failure occurs:**
* **DB Success, Kafka Fails**: The order is created, but inventory isn't deducted, leading to overselling.
* **Kafka Success, DB Rollback**: Inventory is deducted, but the order doesn't exist. The customer is charged but receives no product.

This "cross-system" consistency issue cannot be resolved by traditional database transactions alone because they cannot span across different infrastructures (SQL vs. Message Broker).



---

## 🚀 How Transactional Outbox Solves This

The core philosophy is: **"Instead of sending the message directly, store the message as part of your database transaction."**

### Core Workflow
1. **Atomic Write**:
   Within a single database transaction, two things happen simultaneously:
   * Write business data (e.g., `Orders` table).
   * Write message data (e.g., `Outbox` table).
   *Since both happen in one transaction, they are guaranteed to either both succeed or both fail.*

2. **Asynchronous Relay**:
   A separate background process (Relay / Worker) scans the `Outbox` table for messages with a `PENDING` status and publishes them to the Message Broker (Kafka).

3. **Status Update**:
   Once the message is successfully acknowledged by Kafka, the Relay marks the message in the database as `PROCESSED`.



---

## 🏆 Benefits of This Pattern

* **Eventual Consistency**: Guarantees that the message will eventually be sent. Even if Kafka is temporarily down, the message remains safely in the Outbox table awaiting retry.
* **High Availability**: Business logic is no longer coupled to the availability of the Message Broker. If Kafka is slow, the API remains fast.
* **Performance Optimization**: API response times no longer include the network latency of publishing to a broker, providing a smoother user experience.

---

## Transactional Outbox Pattern Sequence Diagram
- [AWS Transactional outbox pattern Doc](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)
![aws-transactional-outbox-pattern](https://docs.aws.amazon.com/images/prescriptive-guidance/latest/cloud-design-patterns/images/outbox-1.png)
