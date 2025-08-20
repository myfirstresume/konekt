'use client';

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100">
      {/* Logo and Brand */}
      <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
        <Image
          src="/mfr_logo.png"
          alt="MyFirstResume Logo"
          width={32}
          height={32}
          className="w-6 h-6 sm:w-8 sm:h-8"
        />
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">MyFirstResume</h1>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
        <a href="/features" className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base">
          Features
        </a>
        <a href="/pricing" className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base">
          Pricing
        </a>
        
        {isLoading ? (
          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
        ) : isAuthenticated ? (
          <>
            <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base">
              Dashboard
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base"
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base">
              Log in
            </Link>
            <Link 
              href="/pricing"
              className="bg-mfr-primary text-white px-4 sm:px-6 py-2 rounded-md hover:bg-mfr-primary/80 transition-colors text-sm lg:text-base"
            >
              Sign up
            </Link>
          </>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 md:hidden z-50 shadow-lg">
          <nav className="flex flex-col px-4 py-4 space-y-4">
            <a 
              href="/features" 
              className="text-gray-700 hover:text-gray-900 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="/pricing" 
              className="text-gray-700 hover:text-gray-900 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            
            {isLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
            ) : isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-gray-900 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="py-2">
                  <span className="text-sm text-gray-600">
                    {user?.name || user?.email}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-gray-900 transition-colors py-2 text-left"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-gray-900 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  href="/pricing"
                  className="bg-mfr-primary text-white px-6 py-3 rounded-md hover:bg-mfr-primary/80 transition-colors text-left"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
