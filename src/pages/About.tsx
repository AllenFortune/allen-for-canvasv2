
import Header from "@/components/Header";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import AboutHero from "@/components/about/AboutHero";
import NotAnAutoGrader from "@/components/about/NotAnAutoGrader";
import TeacherControl from "@/components/about/TeacherControl";
import GradingBias from "@/components/about/GradingBias";
import AboutFAQ from "@/components/about/AboutFAQ";
import TeacherBenefits from "@/components/about/TeacherBenefits";

const founderJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: "Allen Fortune",
    jobTitle: "Full-Time Psychology Faculty",
    worksFor: {
      "@type": "CollegeOrUniversity",
      name: "Lemoore College (West Hills Community College District)",
    },
    knowsAbout: ["Psychology", "AI-assisted grading", "Canvas LMS", "Higher education"],
    image: "https://allengradeassist.com/lovable-uploads/d644e2ea-e597-4168-bff4-35ee20a31995.png",
    url: "https://allengradeassist.com/about",
    description:
      "Full-time psychology professor and founder of Allen Grade Assist, an AI grading assistant for Canvas LMS that he uses on his own live courses.",
  },
};

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Seo
        title={"About — Built by a Working Professor | Allen Grade Assist"}
        description={"Allen Grade Assist is built and used by Allen Fortune, a full-time psychology professor, on his own live courses. AI drafts feedback; the instructor always decides the final grade."}
        path="/about"
        jsonLd={founderJsonLd}
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
