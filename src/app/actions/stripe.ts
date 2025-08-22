"use server";

import type { Stripe } from "stripe";
import { headers } from "next/headers";

import { CURRENCY } from "@/config";
import { formatAmountForStripe } from "@/utils/stripe-helpers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getPricingTierById } from "@/config/pricing";

export async function createCheckoutSession(
  data: FormData,
): Promise<{ client_secret: string | null; url: string | null }> {
  const ui_mode = data.get(
    "uiMode",
  ) as Stripe.Checkout.SessionCreateParams.UiMode;

  const headersList = await headers();
  const origin: string = headersList.get("origin") as string;

  const checkoutSession: Stripe.Checkout.Session =
    await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "donate",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: "Custom amount donation",
            },
            unit_amount: formatAmountForStripe(
              Number(data.get("customDonation") as string),
              CURRENCY,
            ),
          },
        },
      ],
      // TODO: Update these links
      ...(ui_mode === "hosted" && {
        success_url: `${origin}/donate-with-checkout/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/donate-with-checkout`,
      }),
      ...(ui_mode === "embedded" && {
        return_url: `${origin}/donate-with-embedded-checkout/result?session_id={CHECKOUT_SESSION_ID}`,
      }),
      ui_mode,
    });

  return {
    client_secret: checkoutSession.client_secret,
    url: checkoutSession.url,
  };
}

export async function createSubscriptionCheckoutSession(
  tierId: string,
  userId: string,
): Promise<{ url: string | null }> {
  const tier = getPricingTierById(tierId);
  if (!tier) {
    throw new Error("Invalid pricing tier");
  }

  // Get or create Stripe customer
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: user.name || undefined,
      metadata: {
        userId: user.id,
      },
    });

    customerId = customer.id;

    // Update user with Stripe customer ID
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId }
    });
  }

  const headersList = await headers();
  const origin = headersList.get("origin") as string;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: tier.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
    metadata: {
      userId: userId,
      tierId: tierId,
    },
    subscription_data: {
      metadata: {
        userId: userId,
        tierId: tierId,
      },
    },
  });

  return { url: checkoutSession.url };
}

export async function createPaymentIntent(
  data: FormData,
): Promise<{ client_secret: string }> {
  const paymentIntent: Stripe.PaymentIntent =
    await stripe.paymentIntents.create({
      amount: formatAmountForStripe(
        Number(data.get("customDonation") as string),
        CURRENCY,
      ),
      automatic_payment_methods: { enabled: true },
      currency: CURRENCY,
    });

  return { client_secret: paymentIntent.client_secret as string };
}

export async function createCustomerPortalSession(
  userId: string,
): Promise<{ url: string | null }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user?.stripeCustomerId) {
    throw new Error("No Stripe customer found");
  }

  const headersList = await headers();
  const origin = headersList.get("origin") as string;

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/dashboard`,
  });

  return { url: session.url };
}