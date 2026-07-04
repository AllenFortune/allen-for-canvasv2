
import Header from "@/components/Header";
import Seo from "@/components/Seo";
import FallPromotionBanner from "@/components/FallPromotionBanner";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import CanvasIntegrationBenefits from "@/components/CanvasIntegrationBenefits";
import WhyUseAllen from "@/components/WhyUseAllen";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <Header />
      <Seo
        title={"Allen Grade Assist — AI-Powered Canvas Grading Assistant"}
        description={"Save hours grading in Canvas. Allen Grade Assist generates rubric-aligned feedback for discussions, assignments, and quizzes, then passes grades back to SpeedGrader — built by a working psychology professor."}
        path="/"
      />
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
