import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getPricingTierById } from "@/config/pricing";

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.log(`Error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  console.log("Success:", event.id);
  console.log("Event type:", event.type);
  console.log("Event data:", JSON.stringify(event.data.object, null, 2));

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "invoice.payment_succeeded",
  ];

  if (permittedEvents.includes(event.type)) {
    let data;

    try {
      switch (event.type) {
        case "checkout.session.completed":
          data = event.data.object as Stripe.Checkout.Session;
          console.log(`💰 CheckoutSession status: ${data.payment_status}`);
          console.log(`💰 CheckoutSession mode: ${data.mode}`);
          console.log(`💰 CheckoutSession subscription: ${data.subscription}`);
          console.log(`💰 CheckoutSession metadata:`, data.metadata);
          
          // Handle subscription creation after successful checkout
          if (data.mode === 'subscription' && data.subscription) {
            console.log(`🔄 Processing subscription creation for: ${data.subscription}`);
            await handleSubscriptionCreated(data.subscription as string);
          } else {
            console.log(`❌ Not a subscription checkout or no subscription ID`);
          }
          break;

        case "customer.subscription.created":
          data = event.data.object as Stripe.Subscription;
          console.log(`📅 Subscription created: ${data.id}`);
          console.log(`📅 Subscription metadata:`, data.metadata);
          await handleSubscriptionCreated(data.id);
          break;

        case "customer.subscription.updated":
          data = event.data.object as Stripe.Subscription;
          console.log(`📅 Subscription updated: ${data.id}`);
          await handleSubscriptionUpdated(data);
          break;

        case "customer.subscription.deleted":
          data = event.data.object as Stripe.Subscription;
          console.log(`📅 Subscription deleted: ${data.id}`);
          await handleSubscriptionDeleted(data.id);
          break;

        case "payment_intent.payment_failed":
          data = event.data.object as Stripe.PaymentIntent;
          console.log(`Payment failed: ${data.last_payment_error?.message}`);
          break;

        case "payment_intent.succeeded":
          data = event.data.object as Stripe.PaymentIntent;
          console.log(`PaymentIntent status: ${data.status}`);
          break;

        case "invoice.payment_succeeded":
          data = event.data.object as Stripe.Invoice;
          console.log(`💰 Invoice payment succeeded: ${data.id}`);
          console.log(`💰 Invoice subscription: ${data.subscription}`);
          console.log(`💰 Invoice metadata:`, data.metadata);
          
          // Handle subscription creation from invoice
          if (data.subscription && data.subscription_details?.metadata) {
            console.log(`🔄 Processing subscription from invoice: ${data.subscription}`);
            await handleSubscriptionCreated(data.subscription as string);
          } else {
            console.log(`❌ No subscription or metadata found in invoice`);
          }
          break;

        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      console.log("❌ Webhook handler error:", error);
      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ message: "Received" }, { status: 200 });
}

async function handleSubscriptionCreated(subscriptionId: string) {
  try {
    console.log(`🔄 Starting subscription creation for: ${subscriptionId}`);
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log(`📅 Retrieved subscription:`, subscription.id);
    console.log(`📅 Subscription metadata:`, subscription.metadata);
    
    const userId = subscription.metadata.userId;
    const tierId = subscription.metadata.tierId;

    if (!userId || !tierId) {
      console.error("❌ Missing userId or tierId in subscription metadata");
      console.error("❌ userId:", userId);
      console.error("❌ tierId:", tierId);
      return;
    }

    console.log(`✅ Found userId: ${userId}, tierId: ${tierId}`);

    const tier = getPricingTierById(tierId);
    if (!tier) {
      console.error(`❌ Invalid tier ID: ${tierId}`);
      return;
    }

    console.log(`✅ Found tier: ${tier.name}`);

    // Debug subscription object
    console.log(`🔍 Subscription object:`, JSON.stringify(subscription, null, 2));
    console.log(`🔍 current_period_start:`, (subscription as any).current_period_start);
    console.log(`🔍 current_period_end:`, (subscription as any).current_period_end);

    // Safely convert timestamps to dates
    const currentPeriodStart = (subscription as any).current_period_start 
      ? new Date((subscription as any).current_period_start * 1000)
      : new Date();
    const currentPeriodEnd = (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    console.log(`🔍 Converted currentPeriodStart:`, currentPeriodStart);
    console.log(`🔍 Converted currentPeriodEnd:`, currentPeriodEnd);

    // Create or update subscription in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbSubscription = await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscriptionId },
      update: {
        status: subscription.status,
        currentPeriodStart: currentPeriodStart,
        currentPeriodEnd: currentPeriodEnd,
      },
      create: {
        stripeSubscriptionId: subscriptionId,
        stripePriceId: subscription.items.data[0].price.id,
        stripeProductId: subscription.items.data[0].price.product as string,
        userId: userId,
        status: subscription.status,
        currentPeriodStart: currentPeriodStart,
        currentPeriodEnd: currentPeriodEnd,
        planName: tier.name,
        planFeatures: JSON.stringify(tier), // Convert to string for SQLite
      },
    });

    console.log(`✅ Created/updated subscription in database:`, dbSubscription.id);

    // Create or update usage tracking
    const usage = await prisma.subscriptionUsage.upsert({
      where: { userId: userId },
      update: {
        resumeReviewsLimit: tier.limits.resumeReviews,
        followUpQuestionsLimit: tier.limits.followUpQuestions,
        voiceNotesLimit: tier.limits.voiceNotes,
        liveMocksLimit: tier.limits.liveMocks,
        usageResetDate: new Date((subscription as any).current_period_end * 1000),
      },
      create: {
        userId: userId,
        resumeReviewsLimit: tier.limits.resumeReviews,
        followUpQuestionsLimit: tier.limits.followUpQuestions,
        voiceNotesLimit: tier.limits.voiceNotes,
        liveMocksLimit: tier.limits.liveMocks,
        usageResetDate: new Date((subscription as any).current_period_end * 1000),
      },
    });

    console.log(`✅ Created/updated usage tracking:`, usage.id);
    console.log(`✅ Subscription creation completed successfully`);
    
  } catch (error) {
    console.error("❌ Error handling subscription creation:", error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId;
    
    if (!userId) {
      console.error("❌ Missing userId in subscription metadata");
      return;
    }

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      },
    });

    // Reset usage if subscription is active and period has changed
    if (subscription.status === 'active') {
      await prisma.subscriptionUsage.updateMany({
        where: { userId: userId },
        data: {
          usageResetDate: new Date((subscription as any).current_period_end * 1000),
        },
      });
    }
  } catch (error) {
    console.error("❌ Error handling subscription update:", error);
  }
}

async function handleSubscriptionDeleted(subscriptionId: string) {
  try {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: 'canceled' },
    });
  } catch (error) {
    console.error("❌ Error handling subscription deletion:", error);
  }
}