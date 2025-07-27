import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, User, Loader2 } from "lucide-react";
import Link from "next/link";

export default async function AccountPage({ params }) {
  try {
    const { id } = await params;
    const accountData = await getAccountWithTransactions(id);

    if (!accountData) {
      notFound();
    }

    const { transactions, ...account } = accountData;

    // Calculate account statistics
    const totalIncome = transactions
      .filter(t => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    const netFlow = totalIncome - totalExpenses;

    // Get recent transactions for quick overview
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    const getAccountIcon = () => {
      return (
        <div className="h-16 w-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center">
          <User className="h-8 w-8 text-white" />
        </div>
      );
    };

    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                {getAccountIcon()}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 capitalize mb-1">
                    {account.name}
                  </h1>
                  <p className="text-slate-600 font-medium">
                    {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                  ${parseFloat(account.balance).toFixed(2)}
                </div>
                <p className="text-sm text-slate-600">
                  {account._count.transactions} transactions
                </p>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Income</p>
                    <p className="text-2xl font-bold text-emerald-600">${totalIncome.toFixed(2)}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Net Flow</p>
                    <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {netFlow >= 0 ? '+' : ''}${netFlow.toFixed(2)}
                    </p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    netFlow >= 0 
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
                      : 'bg-gradient-to-br from-red-500 to-red-600'
                  }`}>
                    {netFlow >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-white" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-white" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Preview */}
          {recentTransactions.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm mb-8">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          transaction.type === "EXPENSE" ? "bg-red-100" : "bg-emerald-100"
                        }`}>
                          {transaction.type === "EXPENSE" ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {transaction.description || "Untitled Transaction"}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            {transaction.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          transaction.type === "EXPENSE" ? "text-red-600" : "text-emerald-600"
                        }`}>
                          {transaction.type === "EXPENSE" ? "-" : "+"}${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chart Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Account Analytics</h2>
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                  <div className="text-center space-y-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center mx-auto">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                    <p className="text-slate-600 font-medium">Loading analytics...</p>
                  </div>
                </div>
              }
            >
              <AccountChart transactions={transactions} />
            </Suspense>
          </div>

          {/* Transactions Table */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">All Transactions</h2>
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                  <div className="text-center space-y-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center mx-auto">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                    <p className="text-slate-600 font-medium">Loading transactions...</p>
                  </div>
                </div>
              }
            >
              <TransactionTable transactions={transactions} />
            </Suspense>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading account:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Error Loading Account</h1>
          <p className="text-slate-600">Something went wrong while loading the account details.</p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }
}
