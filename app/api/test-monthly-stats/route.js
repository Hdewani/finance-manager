import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

async function getMonthlyStats(userId, month) {
  // Create proper start and end dates for the month
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);

  console.log(`🔍 Fetching transactions for user ${userId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      account: true,
    },
  });

  console.log(`📊 Found ${transactions.length} transactions for the month`);

  const stats = transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );

  console.log(`📈 Monthly stats:`, stats);
  return stats;
}

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Test for current month
    const currentMonth = new Date();
    const currentMonthStats = await getMonthlyStats(user.id, currentMonth);

    // Test for last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStats = await getMonthlyStats(user.id, lastMonth);

    // Get all transactions for debugging
    const allTransactions = await db.transaction.findMany({
      where: {
        userId: user.id,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 10, // Get last 10 transactions
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      currentMonth: {
        month: currentMonth.toLocaleString("default", { month: "long", year: "numeric" }),
        stats: currentMonthStats,
      },
      lastMonth: {
        month: lastMonth.toLocaleString("default", { month: "long", year: "numeric" }),
        stats: lastMonthStats,
      },
      recentTransactions: allTransactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount.toNumber(),
        category: t.category,
        date: t.date,
        accountName: t.account.name,
      })),
    });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 