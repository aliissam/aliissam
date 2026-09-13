import { InMemoryEventBus } from '@lpc/event-bus';
import {
  PaymentService,
  TransactionWriteRepository,
  QiCardAdapter,
  ZainCashAdapter,
  VisaMastercardAdapter,
  CashAgentAdapter,
} from '@lpc/payment-service';
import { CreditService, registerCreditEventHandlers } from '@lpc/credit-service';
import { MerchantOnboardingService } from '@lpc/merchant-service';
import {
  NotificationService,
  SmsAdapter,
  WhatsAppAdapter,
  registerNotificationEventHandlers,
} from '@lpc/notification-service';
import {
  MerchantAnalyticsProjection,
  MerchantDashboardQueryService,
  registerDashboardProjector,
} from '@lpc/merchant-dashboard-service';

export interface Platform {
  eventBus: InMemoryEventBus;
  paymentService: PaymentService;
  creditService: CreditService;
  merchantOnboarding: MerchantOnboardingService;
  dashboard: MerchantDashboardQueryService;
}

// The composition root: the only place in the whole platform that knows
// about every bounded context at once. Each service itself only knows the
// shared event contracts in @lpc/shared-kernel and the EventBus port --
// never each other's internals, and often not even each other's existence.
// Both the CLI demo (apps/demo) and the HTTP API (apps/api) call this to
// get an identically-wired platform instance.
export function wirePlatform(): Platform {
  const eventBus = new InMemoryEventBus();

  const paymentService = new PaymentService(eventBus, new TransactionWriteRepository());
  paymentService.registerProvider(new QiCardAdapter());
  paymentService.registerProvider(new ZainCashAdapter());
  paymentService.registerProvider(new VisaMastercardAdapter());
  paymentService.registerProvider(new CashAgentAdapter());

  const creditService = new CreditService(eventBus);
  registerCreditEventHandlers(eventBus, creditService);

  const merchantOnboarding = new MerchantOnboardingService();

  const notificationService = new NotificationService([new SmsAdapter(), new WhatsAppAdapter()]);
  registerNotificationEventHandlers(eventBus, notificationService);

  const analyticsProjection = new MerchantAnalyticsProjection();
  registerDashboardProjector(eventBus, analyticsProjection);
  const dashboard = new MerchantDashboardQueryService(analyticsProjection);

  return { eventBus, paymentService, creditService, merchantOnboarding, dashboard };
}
