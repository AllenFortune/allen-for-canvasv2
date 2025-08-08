
import Header from "@/components/Header";
import FallPromotionBanner from "@/components/FallPromotionBanner";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import CanvasIntegrationBenefits from "@/components/CanvasIntegrationBenefits";
import WhyUseAllen from "@/components/WhyUseAllen";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <FallPromotionBanner />
      <Hero />
      <HowItWorks />
      <CanvasIntegrationBenefits />
      <WhyUseAllen />
      <Footer />
    </div>
  );
};

export default Index;
