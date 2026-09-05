import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { Landing } from '@/features/landing';

export default function Home() {
  return (
    <>
      <Header />
      <Landing />
      <Footer />
    </>
  );
}
