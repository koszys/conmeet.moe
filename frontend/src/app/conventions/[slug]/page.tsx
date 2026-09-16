import { ConventionDetail } from '@/features/conventions/components/ConventionDetail';

export default async function ConventionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ConventionDetail slug={slug} />;
}