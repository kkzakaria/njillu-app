import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ListDetailDemo } from './list-detail-demo';

export default async function ListDetailDemoPage() {
  const messages = await getMessages();
  const t = await getTranslations('metadata');

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="h-screen bg-background">
        <ListDetailDemo />
      </div>
    </NextIntlClientProvider>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: `List-Detail Layout Demo | ${t('app.name')}`,
    description: 'Interactive demo of the responsive list-detail layout system',
  };
}