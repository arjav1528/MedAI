'use client';

import { Fragment, useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Oleo_Script, Montserrat } from "next/font/google";
import { useNotifications } from '@/contexts/NotificationContext';
import { UserRole } from '@/types';

const oleo = Oleo_Script({
  weight: "400",
  display: "swap",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const { data: session } = useSession();
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/', current: pathname === '/' },
    { name: 'History', href: '/query-history', current: pathname === '/query-history' },
    ...(session?.user?.role === UserRole.CLINICIAN 
      ? [{ name: 'Clinician Portal', href: '/clinician', current: pathname === '/clinician' }] 
      : []),
  ];

  return (
    <Disclosure as="nav" className={`sticky top-0 z-50 backdrop-blur-md transition-all duration-300 ${
      isScrolled ? "bg-white/95 shadow-md" : "bg-white shadow"
    } ${montserrat.className}`}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              {/* Logo and main navigation */}
              <div className="flex items-center">
                <Link href="/" className="flex-shrink-0 group relative">
                  <div className="absolute -inset-1 rounded-lg opacity-20 bg-gradient-to-r from-blue-600 to-emerald-500 blur group-hover:opacity-30 transition-all duration-300"></div>
                  <h1 className={`${oleo.className} text-2xl relative font-bold`}>
                    <span className="text-blue-600">Med</span>
                    <span className="text-emerald-500">AI</span>
                  </h1>
                </Link>
                
                <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "border-blue-500 text-gray-900 font-medium"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                        "inline-flex items-center border-b-2 px-1 pt-1 text-sm transition-colors duration-200"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Centered query buttons */}
              
              
              {/* Right side menu items */}
              <div className="flex items-center space-x-3">
                {/* Desktop notification menu */}
                <div className="hidden sm:block">
                  <Menu as="div" className="relative">
                    <Menu.Button className="relative flex rounded-full bg-white p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none ring-1 ring-gray-200 hover:ring-gray-300 transition-all">
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white ring-1 ring-white animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                      <BellIcon className="h-5 w-5" aria-hidden="true" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-xl bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                        <div className="px-4 py-3 text-sm font-medium text-gray-700 border-b flex justify-between items-center">
                          <span>Notifications</span>
                          {notifications.length > 0 && (
                            <button 
                              className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-150"
                              onClick={() => notifications.forEach(n => markAsRead(n.id))}
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-gray-500 flex flex-col items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                              <p>No notifications</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <Menu.Item key={notification.id}>
                                {({ active }) => (
                                  <div
                                    className={classNames(
                                      active ? "bg-gray-50" : "",
                                      notification.read ? "bg-white" : "bg-blue-50",
                                      "px-4 py-3 text-sm text-gray-700 border-b cursor-pointer transition-colors duration-150"
                                    )}
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <div className="flex items-start">
                                      <div className="flex-shrink-0 mr-3 mt-1">
                                        {!notification.read && (
                                          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium leading-tight mb-1">
                                          {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Menu.Item>
                            ))
                          )}
                        </div>
                        <div className="px-4 py-2 text-center border-t">
                          <Link href="/notifications" className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors duration-150">
                            View all notifications
                          </Link>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                
                {/* Desktop profile menu */}
                <div className="hidden sm:block">
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex rounded-full bg-white ring-1 ring-gray-200 hover:ring-gray-300 text-sm transition-all focus:outline-none">
                      <span className="sr-only">Open user menu</span>
                      {session?.user?.image ? (
                        <Image
                          className="h-8 w-8 rounded-full"
                          src={session.user.image}
                          alt=""
                          width={32}
                          height={32}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                          <span className="font-medium">
                            {session?.user?.name?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-3 border-b">
                          <div className="flex items-center space-x-3">
                            {session?.user?.image ? (
                              <Image
                                className="h-10 w-10 rounded-full border border-gray-200"
                                src={session.user.image}
                                alt=""
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                                <span className="font-medium">
                                  {session?.user?.name?.charAt(0) || "U"}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-sm text-gray-900">
                                {session?.user?.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                {session?.user?.email}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center">
                              <div className="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-800 font-medium">
                                {session?.user?.role || "User"}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/profile"
                              className={classNames(
                                active ? "bg-gray-50" : "",
                                "flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              )}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Profile Settings
                            </Link>
                          )}
                        </Menu.Item>
                        
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => signOut()}
                              className={classNames(
                                active ? "bg-gray-50" : "",
                                "flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                              )}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                
                {/* Mobile menu button */}
                <div className="sm:hidden flex items-center">
                  <div className="relative mr-2">
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white animate-pulse"></span>
                    )}
                    <BellIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700",
                    "block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            
            {/* Query buttons section */}
            
            
            {/* Mobile profile section */}
            <div className="border-b border-gray-200 pb-3 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  {session?.user?.image ? (
                    <Image
                      className="h-10 w-10 rounded-full border border-gray-200"
                      src={session.user.image}
                      alt=""
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                      <span className="font-medium">
                        {session?.user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-base font-medium text-gray-800">
                    {session?.user?.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500 truncate max-w-[200px]">
                    {session?.user?.email}
                  </div>
                  <div className="mt-1">
                    <span className="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-800 font-medium">
                      {session?.user?.role || "User"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 space-y-1 px-4">
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Settings
                </Link>
                
                <Link
                  href="/notifications"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notifications
                </Link>
                
                <button
                  onClick={() => signOut()}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 rounded-md hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
