export type Locale = 'fr' | 'en' | 'es';

export interface LocaleParams {
  locale: Locale;
}

export interface PageProps {
  params: Promise<LocaleParams>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface Messages {
  metadata: {
    title: string;
    description: string;
  };
  home: {
    welcome: string;
    description: string;
  };
  auth: {
    login: {
      title: string;
      description: string;
      email: string;
      password: string;
      forgotPassword: string;
      loginButton: string;
      loggingIn: string;
      noAccount: string;
      signUp: string;
      error: string;
    };
    signUp: {
      title: string;
      description: string;
      email: string;
      password: string;
      confirmPassword: string;
      signUpButton: string;
      signingUp: string;
      haveAccount: string;
      login: string;
      success: string;
    };
    forgotPassword: {
      title: string;
      description: string;
      email: string;
      sendButton: string;
      sending: string;
      success: string;
      backToLogin: string;
    };
    updatePassword: {
      title: string;
      description: string;
      newPassword: string;
      confirmPassword: string;
      updateButton: string;
      updating: string;
      success: string;
    };
    logout: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    back: string;
    next: string;
    previous: string;
    close: string;
  };
  navigation: {
    home: string;
    documentation: string;
    invoicing: string;
    settings: string;
    profile: string;
    logout: string;
  };
  customs: {
    fdi: {
      title: string;
      create: string;
      edit: string;
      status: string;
      number: string;
    };
    rfcv: {
      title: string;
      create: string;
      edit: string;
      status: string;
    };
  };
  language: {
    switch: string;
    current: string;
    fr: string;
    en: string;
    es: string;
  };
}