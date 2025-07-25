import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en', 'es'],
  defaultLocale: 'fr',
  pathnames: {
    '/': '/',
    '/auth/login': {
      fr: '/auth/connexion',
      en: '/auth/login',
      es: '/auth/iniciar-sesion'
    },
    '/auth/sign-up': {
      fr: '/auth/inscription',
      en: '/auth/sign-up',
      es: '/auth/registro'
    },
    '/auth/forgot-password': {
      fr: '/auth/mot-de-passe-oublie',
      en: '/auth/forgot-password',
      es: '/auth/olvide-contrasena'
    },
    '/auth/update-password': {
      fr: '/auth/modifier-mot-de-passe',
      en: '/auth/update-password',
      es: '/auth/actualizar-contrasena'
    },
    '/protected': {
      fr: '/protege',
      en: '/protected', 
      es: '/protegido'
    }
  }
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];