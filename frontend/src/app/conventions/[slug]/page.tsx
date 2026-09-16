import { Footer } from '@/shared/components/layout/Footer';
import { Header } from '@/shared/components/layout/Header';
import { ConventionDetail } from '@/features/conventions/components/ConventionDetail';

export default async function ConventionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      <Header />
      <ConventionDetail slug={slug} />
      <Footer />
    </>
  );
}