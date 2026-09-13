# Local Pay & Credit

A platform that lets Iraqi merchants accept payments — cards, local wallets
(Zain Cash, Qi Card), and cash-on-delivery reconciliation — and offers
customers short-term credit / installment plans (BNPL) at checkout. No
current Iraqi player does both of these well together.

This document is the architecture design; `packages/`, `services/` and
`apps/` are a working TypeScript scaffold that implements it end to end
(mocked adapters, in-memory storage, in-process event bus) so the shape of
the system can be run and read, not just described.

## Why these five patterns, together

Iraq's payment landscape is the constraint that shapes everything below:
rails are fragmented and unstable (providers get added, drop out, or change
integrations often), credit/BNPL is a regulated activity distinct from
payment processing, and merchants will hit the reporting dashboard hard
enough that it can't be allowed to compete with live transaction writes.
Each pattern below exists to answer one of those pressures specifically —
they are not applied for their own sake.

### 1. Hexagonal (Ports & Adapters) — the payment core

`services/payment-service` never imports a vendor SDK into its core. The
core (`PaymentService`) depends only on the `PaymentPort` interface;
`QiCardAdapter`, `ZainCashAdapter`, `VisaMastercardAdapter` and
`CashAgentAdapter` implement it. Adding or retiring a payment rail is
"write one adapter file, register it" — zero changes to `PaymentService`
itself. `CashAgentAdapter` treats a field agent's cash-collection
confirmation as just another `charge()` call, so COD reconciliation goes
through the exact same core path as a card or wallet payment.

### 2. Microservices — isolate the risky/regulated parts

Five independently deployable services, split along compliance and
operational boundaries rather than by technical layer:

- `payment-service` — transaction processing (the PCI-scoped surface)
- `credit-service` — credit scoring, installment plans (its own compliance
  boundary, separate from card/wallet processing)
- `merchant-service` — onboarding, KYC
- `notification-service` — SMS/WhatsApp (email is unreliable in Iraq, so
  it isn't the primary channel at all)
- `merchant-dashboard-service` — the CQRS read side, described below

Each is its own npm workspace package with its own `package.json` and
`tsconfig.json`; in a real deployment each becomes its own container with
its own datastore, deployed and scaled independently.

### 3. Domain-Driven Design — the credit domain, modeled properly

`services/credit-service/src/domain` holds `CreditLimit`, `Installment`,
`RepaymentSchedule` and `Customer` as real domain objects that enforce
their own invariants (`CreditLimit.reserve` refuses to let a customer
spend more than they've been granted; `RepaymentSchedule.split` is the
only way to produce installments, so "installments sum to the total owed"
can't be violated by construction). This logic has no dependency on any
payment-processing type — the bounded context stays clean of the
transaction-technology concerns that most fintechs let leak into it.

### 4. CQRS — separate transaction writes from dashboard reads

`payment-service/src/infrastructure/TransactionWriteRepository` is the
write side: an append-only store optimized for the hot payment path.
`merchant-dashboard-service/src/read` is the read side: a denormalized
`MerchantAnalyticsProjection`, rebuilt asynchronously from published
events by `TransactionProjector`, queried through
`MerchantDashboardQueryService`. The dashboard never reads from the
transaction store directly — merchants hammering it for reports can never
slow down or lock a live payment write.

### 5. Event-Driven — the glue between all of the above

`packages/event-bus` defines the `EventBus` port (`InMemoryEventBus` here;
Kafka/RabbitMQ/SNS in production, swapped in behind the same interface).
`PaymentService` publishes `PaymentSucceeded` / `PaymentFailed`
(`packages/shared-kernel/src/events`) and has no idea who, if anyone, is
listening. Today three services do:

- `credit-service` reacts by improving the customer's credit score
- `notification-service` reacts by texting the merchant
- `merchant-dashboard-service` reacts by updating the read projection

None of those three know about each other, or that `payment-service`
exists beyond the shared event contract. `credit-service` also publishes
`CreditApproved` and `InstallmentScheduled`, which `notification-service`
reacts to independently (installment due-date reminders).

## Repo layout

```
local-pay-credit/
  packages/
    shared-kernel/       # DomainEvent + event payload contracts, Money value object
    event-bus/            # EventBus port + InMemoryEventBus
  services/
    payment-service/      # hexagonal core + 4 adapters + CQRS write side
    credit-service/       # DDD credit/BNPL domain
    merchant-service/      # merchant onboarding / KYC
    notification-service/ # SMS/WhatsApp adapters, reacts to events
    merchant-dashboard-service/ # CQRS read side (projection + query service)
  apps/
    demo/                 # composition root: wires every service to one event bus
```

## Running the scaffold

```
npm install
npm run typecheck   # tsc --noEmit across every workspace
npm run demo        # runs apps/demo/src/index.ts end to end
```

The demo onboards a merchant, grants a customer a BNPL credit limit,
processes a Zain Cash payment and a cash-on-delivery reconciliation, opts
the customer into a 3-installment plan, and prints the merchant dashboard's
read-model summary — showing the event chain (`PaymentSucceeded` →
credit score update, SMS/WhatsApp notification, dashboard projection
update) actually firing.

## What's mocked, and what production needs

This scaffold proves the shape, not the implementation. Before this is a
real platform:

- **Adapters** call real provider APIs (Qi Card, Zain Cash, a card
  acquirer) instead of always succeeding; each needs its own auth,
  retries, and idempotency handling.
- **Event bus** becomes a real broker (Kafka/RabbitMQ/SNS+SQS) so services
  can run as separate processes/containers with at-least-once delivery
  and replay.
- **Persistence**: each service gets its own datastore — `payment-service`
  likely a relational DB inside PCI scope, `merchant-dashboard-service` a
  store shaped for the read queries (could be the same DB with a
  materialized view, or a separate store entirely).
- **Credit scoring** in `CreditService.onPaymentSucceeded` is a placeholder
  (+5 points per successful payment); a real model needs a proper scoring
  service, likely still reacting to the same `PaymentSucceeded` event.
- **PCI/compliance scoping**: `payment-service` is deliberately the
  smallest, most locked-down service — nothing in `credit-service`,
  `merchant-service`, `notification-service` or
  `merchant-dashboard-service` ever needs to see card data.
