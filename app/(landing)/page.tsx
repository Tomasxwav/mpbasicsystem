import HeroSection from './components/HeroSection';
import Navbar from './components/Navbar';

export default function Home() {
  return (
    <div className="mx-auto w-full">
      <Navbar/>
      <HeroSection/>
    </div>
  );
}
