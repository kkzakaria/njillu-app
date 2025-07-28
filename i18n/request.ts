import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// Function to dynamically load and combine all translation modules for a locale
async function loadMessages(locale: string) {
  try {
    // Load all translation modules for the locale
    const [
      metadata,
      home,
      authLogin,
      authSignup,
      authForgotPassword,
      authUpdatePassword,
      authResetPasswordOtp,
      authLogout,
      commonUi,
      navigationMenu,
      customsFdi,
      customsRfcv,
      languageSwitcher
    ] = await Promise.all([
      import(`./messages/${locale}/metadata/app.json`),
      import(`./messages/${locale}/home/page.json`),
      import(`./messages/${locale}/auth/login.json`),
      import(`./messages/${locale}/auth/signup.json`),
      import(`./messages/${locale}/auth/forgot-password.json`),
      import(`./messages/${locale}/auth/update-password.json`),
      import(`./messages/${locale}/auth/reset-password-otp.json`),
      import(`./messages/${locale}/auth/logout.json`),
      import(`./messages/${locale}/common/ui.json`),
      import(`./messages/${locale}/navigation/menu.json`),
      import(`./messages/${locale}/customs/fdi.json`),
      import(`./messages/${locale}/customs/rfcv.json`),
      import(`./messages/${locale}/language/switcher.json`)
    ]);

    // Combine all modules into the expected namespace structure
    return {
      metadata: metadata.default,
      home: home.default,
      auth: {
        login: authLogin.default,
        signUp: authSignup.default,
        forgotPassword: authForgotPassword.default,
        updatePassword: authUpdatePassword.default,
        resetPasswordOtp: authResetPasswordOtp.default,
        logout: authLogout.default.logout // Extract the logout string
      },
      common: commonUi.default,
      navigation: navigationMenu.default,
      customs: {
        fdi: customsFdi.default,
        rfcv: customsRfcv.default
      },
      language: languageSwitcher.default
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    // Fallback to default locale if current locale fails
    if (locale !== routing.defaultLocale) {
      return loadMessages(routing.defaultLocale);
    }
    throw error;
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  // Check if the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: await loadMessages(locale)
  };
});