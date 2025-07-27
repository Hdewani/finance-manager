"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Wallet, Settings } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createAccount } from "@/actions/dashboard";
import { accountSchema } from "@/app/lib/schema";

export function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    loading: createAccountLoading,
    fn: createAccountFn,
    error,
    data: newAccount,
  } = useFetch(createAccount);

  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  useEffect(() => {
    if (newAccount) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  const accountType = watch("type");

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-slate-50/95 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md flex flex-col justify-center items-center pb-8">
          <DrawerHeader className="text-center pb-6">
            <DrawerTitle className="text-xl font-semibold text-slate-900">
              Create New Account
            </DrawerTitle>
            <p className="text-sm text-slate-600 mt-1">
              Add a new account to start tracking your finances
            </p>
          </DrawerHeader>

          <div className="px-6 py-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Account Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Account Name
                </label>
                <Input
                  placeholder="e.g., Main Checking"
                  className="border-slate-300 focus:border-slate-500 focus:ring-slate-500 bg-white"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Account Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Account Type
                </label>
                <Select
                  onValueChange={(value) => setValue("type", value)}
                  defaultValue={accountType}
                >
                  <SelectTrigger className="border-slate-300 focus:border-slate-500 focus:ring-slate-500 bg-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CURRENT" className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4 text-slate-600" />
                      <span>Current Account</span>
                    </SelectItem>
                    <SelectItem value="SAVINGS" className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-slate-600" />
                      <span>Savings Account</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              {/* Initial Balance */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Initial Balance
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="border-slate-300 focus:border-slate-500 focus:ring-slate-500 bg-white"
                  {...register("balance")}
                />
                {errors.balance && (
                  <p className="text-sm text-red-500">{errors.balance.message}</p>
                )}
              </div>

              {/* Default Account Toggle */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900 cursor-pointer">
                    Set as Default
                  </label>
                  <p className="text-xs text-slate-600">
                    This account will be selected by default for transactions
                  </p>
                </div>
                <Switch
                  checked={watch("isDefault")}
                  onCheckedChange={(checked) => setValue("isDefault", checked)}
                  className="data-[state=checked]:bg-slate-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pb-8">
                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 cursor-pointer"
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                  disabled={createAccountLoading}
                >
                  {createAccountLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
