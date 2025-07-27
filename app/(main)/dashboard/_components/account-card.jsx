"use client";

import { ArrowUpRight, ArrowDownRight, CreditCard, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { updateDefaultAccount } from "@/actions/account";
import { toast } from "sonner";

export function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault(); // Prevent navigation

    if (isDefault) {
      toast.warning("You need atleast 1 default account");
      return; // Don't allow toggling off the default account
    }

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully! This account will now be selected by default for new transactions.");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  const getAccountIcon = () => {
    return type === "CURRENT" ? (
      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
        <CreditCard className="h-5 w-5 text-white" />
      </div>
    ) : (
      <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
        <Settings className="h-5 w-5 text-white" />
      </div>
    );
  };

  const getAccountTypeColor = () => {
    return type === "CURRENT" ? "text-blue-600" : "text-emerald-600";
  };

  return (
    <Card className={`group relative overflow-hidden backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
      isDefault 
        ? 'bg-slate-100/80 border-2 border-slate-400' 
        : 'bg-white/80'
    }`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100/50 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 relative z-10">
          <div className="flex items-center space-x-3">
            {getAccountIcon()}
            <div>
              <CardTitle className="text-base whitespace-nowrap  font-semibold text-gray-900 capitalize">
                {name}
              </CardTitle>
              <p className={`text-xs font-medium whitespace-nowrap ${getAccountTypeColor()}`}>
                {type.charAt(0) + type.slice(1).toLowerCase()} Account
              </p>
            </div>
          </div>
          
          <div className="flex items-center flex-col justify-end space-y-1 items-end">
           
            <Switch
              checked={isDefault}
              onClick={handleDefaultChange}
              disabled={updateDefaultLoading}
              className="scale-95 bg-slate-200"
            />
          </div>
        </CardHeader>
        
        <CardContent className="pb-3 relative z-10">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            ${parseFloat(balance).toFixed(2)}
          </div>
          <p className="text-xs text-gray-500">
            Available balance
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-between text-xs text-gray-500 pt-0 relative z-10">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Income</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Expense</span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
