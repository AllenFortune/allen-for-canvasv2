
import Header from "@/components/Header";
import Seo from "@/components/Seo";
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
      <Seo
        title={"About — Built by a Working Professor | Allen Grade Assist"}
        description={"Allen Grade Assist is built and used by Allen Fortune, a full-time psychology professor, on his own live courses. AI drafts feedback; the instructor always decides the final grade."}
        path="/about"
      />
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
