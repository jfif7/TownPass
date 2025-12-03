import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use the default locale for the root path
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  // Skip: _next, _vercel, static files, admin, and design-system
  matcher: [
    '/((?!api|_next|_vercel|admin|design-system|.*\\..*).*)'
  ]
};
