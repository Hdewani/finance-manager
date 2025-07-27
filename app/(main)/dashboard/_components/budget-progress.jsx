"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, Target } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const getProgressColor = () => {
    if (percentUsed >= 90) return "#ef4444"; // red-500
    if (percentUsed >= 75) return "#eab308"; // yellow-500
    if (percentUsed >= 50) return "#3b82f6"; // blue-500
    return "#10b981"; // emerald-500
  };

  const getProgressText = () => {
    if (percentUsed >= 90) return "Critical";
    if (percentUsed >= 75) return "Warning";
    if (percentUsed >= 50) return "Moderate";
    return "Good";
  };

  const getProgressTextColor = () => {
    if (percentUsed >= 90) return "text-red-600";
    if (percentUsed >= 75) return "text-yellow-600";
    if (percentUsed >= 50) return "text-blue-600";
    return "text-emerald-600";
  };

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Monthly Budget
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Track your spending against your budget
            </CardDescription>
          </div>
        </div>

        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0 hover:bg-gray-100 cursor-pointer"
          >
            <Pencil className="h-4 w-4 text-gray-500" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="Enter budget amount"
                className="text-lg font-semibold"
                autoFocus
                disabled={isLoading}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpdateBudget}
              disabled={isLoading}
              className="h-8 w-8 p-0 hover:bg-emerald-100 cursor-pointer"
            >
              <Check className="h-4 w-4 text-emerald-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
              className="h-8 w-8 p-0 hover:bg-red-100 cursor-pointer"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <>
            {initialBudget ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">
                      ${(currentExpenses || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      of ${initialBudget.amount.toFixed(2)} spent
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${getProgressTextColor()}`}>
                      {getProgressText()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {percentUsed.toFixed(1)}% used
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress
                    value={percentUsed}
                    className="h-3"
                    indicatorStyle={{
                      backgroundColor: getProgressColor()
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">No budget set</p>
                <p className="text-sm text-gray-500">
                  Set a monthly budget to start tracking your spending
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
