import React from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard, Menu } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";
import Image from "next/image";

const Header = async () => {
  await checkUser();

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-200/50 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <img src="/logo (2).png" alt="logo" className="w-12 h-12 scale-145" />
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          <SignedOut>
            <a
              href="#features"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Testimonials
            </a>
          </SignedOut>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <SignedIn>
            <Link
              href="/dashboard"
              className="hidden sm:block"
            >
              <Button
                variant="outline"
                className="border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
              >
                <LayoutDashboard size={18} className="mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/transaction/create">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer">
                <PenBox size={18} className="mr-2" />
                <span className="hidden sm:inline">Add Transaction</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button
                variant="outline"
                className="border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 ring-2 ring-gray-200 hover:ring-blue-400 transition-all duration-200",
                  userButtonPopoverCard: "shadow-xl border border-gray-200",
                },
              }}
            />
          </SignedIn>

          {/* Mobile menu button */}
          <SignedIn>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 hover:bg-gray-100 cursor-pointer"
            >
              <Menu size={20} />
            </Button>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
