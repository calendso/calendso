import Link from 'next/link';
import {useContext, useEffect, useState} from "react";
import { useRouter } from "next/router";
import { signOut, useSession } from 'next-auth/client';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import {collectPageParameters, telemetryEventTypes, useTelemetry} from "../lib/telemetry";
import ChangeLanguage from './ChangeLanguage';
import { useTranslation } from 'next-i18next';
import { RTL_LANGUAGES } from '../config';

export default function Shell(props) {
    const router = useRouter();
    const [ session, loading ] = useSession();
    const [ profileDropdownExpanded, setProfileDropdownExpanded ] = useState(false);
    const [ mobileMenuExpanded, setMobileMenuExpanded ] = useState(false);
    let telemetry = useTelemetry();

    useEffect(() => {
        telemetry.withJitsu((jitsu) => {
            return jitsu.track(telemetryEventTypes.pageView, collectPageParameters(router.pathname))
        });
    }, [telemetry])

    const { i18n, t } = useTranslation('common');
    const locale = i18n.language;

    const toggleProfileDropdown = () => {
        setProfileDropdownExpanded(!profileDropdownExpanded);
    }

    const toggleMobileMenu = () => {
        setMobileMenuExpanded(!mobileMenuExpanded);
    }

    const logoutHandler = () => {
        signOut({ redirect: false }).then( () => router.push('/auth/logout') );
    }

    if ( ! loading && ! session ) {
        router.replace('/auth/login');
    }

    return session && (
        <div>
            <div className="bg-gradient-to-b from-blue-600 via-blue-600 to-blue-300 pb-32">
                <nav className="bg-blue-600">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="border-b border-blue-500">
                            <div className="flex items-center justify-between h-16 px-4 sm:px-0">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <img className="h-6" src="/calendso-white.svg" alt="Calendso" />
                                    </div>
                                    <div className="hidden md:block">
                                        <div className="mis-10 flex items-baseline space-x-4">
                                            <Link href="/">
                                                <a className={router.pathname == "/" ? "bg-blue-500 transition-colors duration-300 ease-in-out text-white px-3 py-2 rounded-md text-sm font-medium" : "text-white hover:bg-blue-500 transition-colors duration-300 ease-in-out hover:text-white px-3 py-2 rounded-md text-sm font-medium"}>{t('page_title_dashboard')}</a>
                                            </Link>
                                            {/* <Link href="/">
                                                <a className={router.pathname.startsWith("/bookings") ? "bg-blue-500 transition-colors duration-300 ease-in-out text-white px-3 py-2 rounded-md text-sm font-medium" : "text-white hover:bg-blue-500 transition-colors duration-300 ease-in-out hover:text-white px-3 py-2 rounded-md text-sm font-medium"}>Bookings</a>
                                            </Link> */}
                                            <Link href="/availability">
                                                <a className={router.pathname.startsWith("/availability") ? "bg-blue-500 transition-colors duration-300 ease-in-out text-white px-3 py-2 rounded-md text-sm font-medium" : "text-white hover:bg-blue-500 transition-colors duration-300 ease-in-out hover:text-white px-3 py-2 rounded-md text-sm font-medium"}>{t('page_title_availability')}</a>
                                            </Link>
                                            <Link href="/integrations">
                                                <a className={router.pathname.startsWith("/integrations") ? "bg-blue-500 transition-colors duration-300 ease-in-out text-white px-3 py-2 rounded-md text-sm font-medium" : "text-white hover:bg-blue-500 transition-colors duration-300 ease-in-out hover:text-white px-3 py-2 rounded-md text-sm font-medium"}>{t('page_title_integrations')}</a>
                                            </Link>
                                            <Link href="/settings/profile">
                                                <a className={router.pathname.startsWith("/settings") ? "bg-blue-500 transition-colors duration-300 ease-in-out text-white px-3 py-2 rounded-md text-sm font-medium" : "text-white hover:bg-blue-500 transition-colors duration-300 ease-in-out hover:text-white px-3 py-2 rounded-md text-sm font-medium"}>{t('page_title_settings')}</a>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <ChangeLanguage/>
                                    <div className="hidden md:block">
                                        <div className="mis-4 flex items-center md:mis-6">
                                            <div className="mis-3 relative">
                                                <div>
                                                    <button onClick={toggleProfileDropdown} type="button" className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white" id="user-menu" aria-expanded="false" aria-haspopup="true">
                                                        <span className="sr-only">Open user menu</span>
                                                        <img className="h-8 w-8 rounded-full" src={session.user.image ? session.user.image : "https://eu.ui-avatars.com/api/?background=fff&color=039be5&name=" + encodeURIComponent(session.user.name || "")} alt="" />
                                                    </button>
                                                </div>
                                                {
                                                    profileDropdownExpanded && (
                                                        <div className={(RTL_LANGUAGES.includes(locale) ? "left-0" : "right-0") + " origin-top-right absolute mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"} role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                                                            <Link href={"/" + session.user.username}><a target="_blank" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">{t('page_menu_item_profile')}</a></Link>
                                                            <Link href="/settings/profile"><a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">{t('page_menu_item_login_and_security')}</a></Link>
                                                            <button onClick={logoutHandler} className="w-full text-start block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">{t('page_menu_item_sign_out')}</button>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="-mr-2 flex md:hidden">
                                        <button onClick={toggleMobileMenu} type="button" className=" inline-flex items-center justify-center p-2 rounded-md text-white focus:outline-none" aria-controls="mobile-menu" aria-expanded="false">
                                            <span className="sr-only">Open main menu</span>
                                            { !mobileMenuExpanded && <MenuIcon className="block h-6 w-6" /> }
                                            { mobileMenuExpanded && <XIcon className="block h-6 w-6" /> }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    { mobileMenuExpanded && <div className="border-b border-gray-700 md:hidden bg-gray-700" id="mobile-menu">
                        <div className="px-2 py-3 space-y-1 sm:px-3">
                            <Link href="/">
                                <a className={router.pathname == "/" ? "bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium" : "text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"}>{t('page_title_dashboard')}</a>
                            </Link>
                            <Link href="/availability">
                                <a className={router.pathname.startsWith("/availability") ? "bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium" : "text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"}>{t('page_title_availability')}</a>
                            </Link>
                            <Link href="/integrations">
                                <a className={router.pathname.startsWith("/integrations") ? "bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium" : "text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"}>{t('page_title_integrations')}</a>
                            </Link>
                        </div>
                        <div className="pt-4 pb-3 border-t border-gray-800">
                            <div className="flex items-center px-5">
                                <div className="flex-shrink-0">
                                    <img className="h-10 w-10 rounded-full" src={"https://eu.ui-avatars.com/api/?background=039be5&color=fff&name=" + encodeURIComponent(session.user.name || session.user.username)} alt="" />
                                </div>
                                <div className="mis-3">
                                    <div className="text-base font-medium leading-none text-white">{session.user.name || session.user.username}</div>
                                    <div className="text-sm font-medium leading-none text-gray-400">{session.user.email}</div>
                                </div>
                            </div>
                            <div className="mt-3 px-2 space-y-1">
                                <Link href="/settings/profile">
                                    <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">{t('page_menu_item_profile')}</a>
                                </Link>
                                <Link href="/settings">
                                    <a className={router.pathname.startsWith("/settings") ? "bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium" : "text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"}>{t('page_title_settings')}</a>
                                </Link>
                                <button onClick={logoutHandler} className="block w-full text-start px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">{t('page_menu_item_sign_out')}</button>
                            </div>
                        </div>
                    </div>
                    }
                </nav>
                <header className="py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-white">
                            {props.heading}
                        </h1>
                    </div>
                </header>
            </div>

            <main className="-mt-32">
                <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
                    {props.children}
                </div>
            </main>
        </div>
);
}