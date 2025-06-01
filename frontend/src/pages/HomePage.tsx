import { Helmet } from 'react-helmet';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CtaSection from '../components/home/CtaSection';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>DermaSense | AI Skin Cancer Detection</title>
        <meta 
          name="description" 
          content="DermaSense uses advanced AI to analyze skin conditions and detect potential signs of skin cancer. Upload a photo for instant analysis."
        />
      </Helmet>
      
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
// will add more tommrow 