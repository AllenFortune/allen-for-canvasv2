
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutHero from "@/components/about/AboutHero";
import NotAnAutoGrader from "@/components/about/NotAnAutoGrader";
import TeacherControl from "@/components/about/TeacherControl";
import GradingBias from "@/components/about/GradingBias";
import AboutFAQ from "@/components/about/AboutFAQ";
import TeacherBenefits from "@/components/about/TeacherBenefits";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AboutHero />
      <NotAnAutoGrader />
      <TeacherControl />
      <GradingBias />
      <AboutFAQ />
      <TeacherBenefits />
      <Footer />
    </div>
  );
};

export default About;
