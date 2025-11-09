import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // 支援的語言列表
  locales,
  // 預設語言
  defaultLocale,
  // 語言偵測
  localeDetection: true,
  // 預設語言路徑策略：總是顯示語言前綴
  localePrefix: 'always'
});

export const config = {
  // 匹配所有路徑除了 api、_next/static、_next/image、favicon.ico 和 admin
  matcher: ['/', '/(zh-TW|en|ja)/:path*', '/((?!api|_next/static|_next/image|favicon.ico|admin|.*\\..*).*)']
};
