"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCurrentBudget(accountId) {
  console.log("🔍 getCurrentBudget called with accountId:", accountId);
  
  try {
    const { userId } = await auth();
    console.log("🔐 Auth userId:", userId);
    
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    console.log("👤 Found user:", user ? { id: user.id, name: user.name, email: user.email } : "null");

    if (!user) {
      throw new Error("User not found");
    }

    const budget = await db.budget.findFirst({
      where: {
        userId: user.id,
      },
    });

    console.log("💰 Found budget:", budget ? { 
      id: budget.id, 
      amount: budget.amount.toNumber(), 
      userId: budget.userId,
      createdAt: budget.createdAt 
    } : "null");

    // Get current month's expenses
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    console.log("📅 Date range for expenses:", {
      startOfMonth: startOfMonth.toISOString(),
      endOfMonth: endOfMonth.toISOString(),
      accountId
    });

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        accountId,
      },
      _sum: {
        amount: true,
      },
    });

    const currentExpenses = expenses._sum.amount
      ? expenses._sum.amount.toNumber()
      : 0;

    console.log("💸 Current month expenses:", {
      totalExpenses: currentExpenses,
      accountId,
      transactionCount: expenses._count || "N/A"
    });

    const result = {
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      currentExpenses,
    };

    console.log("✅ getCurrentBudget result:", result);
    return result;
  } catch (error) {
    console.error("❌ Error in getCurrentBudget:", error);
    throw error;
  }
}

export async function updateBudget(amount) {
  console.log("🔄 updateBudget called with amount:", amount);
  
  try {
    const { userId } = await auth();
    console.log("🔐 Auth userId:", userId);
    
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    console.log("👤 Found user:", user ? { id: user.id, name: user.name, email: user.email } : "null");

    if (!user) throw new Error("User not found");

    console.log("💾 Attempting to upsert budget:", {
      userId: user.id,
      amount,
      operation: "upsert"
    });

    // Update or create budget
    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      update: {
        amount,
      },
      create: {
        userId: user.id,
        amount,
      },
    });

    console.log("✅ Budget upsert successful:", {
      id: budget.id,
      amount: budget.amount.toNumber(),
      userId: budget.userId,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt
    });

    revalidatePath("/dashboard");
    
    const result = {
      success: true,
      data: { ...budget, amount: budget.amount.toNumber() },
    };

    console.log("🎉 updateBudget result:", result);
    return result;
  } catch (error) {
    console.error("❌ Error in updateBudget:", error);
    return { success: false, error: error.message };
  }
}
