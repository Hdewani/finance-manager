import DashboardPage from "./page";
import { Suspense } from "react";
import { HamsterLoader } from "@/components/ui/hamster-loader";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <HamsterLoader />
              <p className="text-center mt-4 text-slate-600 font-medium">Loading your dashboard...</p>
            </div>
          </div>
        }
      >
        <DashboardPage />
      </Suspense>
    </div>
  );
}
