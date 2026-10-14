import Header from './components/Header';
import Footer from './components/Footer';
import HomeContent from './components/HomeContent';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <HomeContent />
      </main>
      <Footer />
    </>
  );
}