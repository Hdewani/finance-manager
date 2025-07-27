import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";
import { inngest } from "@/lib/inngest/client";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🧪 test-budget-alerts: Starting test for user:", userId);

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        accounts: {
          where: { isDefault: true },
        },
        budgets: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const defaultAccount = user.accounts[0];
    if (!defaultAccount) {
      return NextResponse.json({ error: "No default account found" }, { status: 404 });
    }

    const budget = user.budgets[0];
    if (!budget) {
      return NextResponse.json({ error: "No budget found" }, { status: 404 });
    }

    // Calculate current month expenses
    const startDate = new Date();
    startDate.setDate(1); // Start of current month

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        accountId: defaultAccount.id,
        type: "EXPENSE",
        date: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalExpenses = expenses._sum.amount?.toNumber() || 0;
    const budgetAmount = budget.amount.toNumber();
    const percentageUsed = (totalExpenses / budgetAmount) * 100;

    console.log("🧪 test-budget-alerts: Budget analysis:", {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      defaultAccount: defaultAccount.name,
      budgetAmount,
      totalExpenses,
      percentageUsed,
      threshold: 80,
      shouldSendAlert: percentageUsed >= 80,
    });

    // Option 1: Trigger Inngest function
    console.log("🧪 test-budget-alerts: Triggering Inngest manual budget alert function");
    const inngestResult = await inngest.send({
      name: "test/budget.alert",
      data: {
        userId: user.id,
        testMode: true
      }
    });

    console.log("🧪 test-budget-alerts: Inngest trigger result:", inngestResult);

    // Option 2: Direct email test
    console.log("🧪 test-budget-alerts: Sending direct test email");
    await sendEmail({
      to: user.email,
      subject: `DIRECT TEST - Budget Alert for ${defaultAccount.name}`,
      react: EmailTemplate({
        userName: user.name,
        type: "budget-alert",
        data: {
          percentageUsed,
          budgetAmount: budgetAmount.toFixed(1),
          totalExpenses: totalExpenses.toFixed(1),
          accountName: defaultAccount.name,
        },
      }),
    });

    console.log("🧪 test-budget-alerts: Direct email sent successfully");

    return NextResponse.json({
      success: true,
      message: "Budget alert tests completed",
      data: {
        budgetAmount,
        totalExpenses,
        percentageUsed,
        threshold: 80,
        shouldSendAlert: percentageUsed >= 80,
        inngestTriggered: true,
        directEmailSent: true,
        userEmail: user.email
      },
    });
  } catch (error) {
    console.error("❌ test-budget-alerts: Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 