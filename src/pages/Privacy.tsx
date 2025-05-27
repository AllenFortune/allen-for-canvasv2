
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, X } from 'lucide-react';

const Privacy = () => {
  const commitments = {
    willNot: [
      "We will not collect, maintain, use or share Student PII beyond that needed for authorized educational/school purposes, or as authorized by the parent/student.",
      "We will not sell student PII.",
      "We will not use or disclose student information collected through an educational/school service for behavioral targeting of advertisements to students.",
      "We will not build a personal profile of a student other than for supporting authorized educational/school purposes or as authorized by the parent/student.",
      "We will not make material changes to A.L.L.E.N. education privacy policies without first providing prominent notice to users and allowing them choices before data is used inconsistently with initial terms.",
      "We will not knowingly retain Student PII beyond the time period required to support the authorized educational/school purposes, or as authorized by the parent/student."
    ],
    will: [
      "We will collect, use, share, and retain Student PII only for purposes for which we were authorized by the educational institution/agency, teacher or the parent/student.",
      "We will disclose clearly in contracts or privacy policies what types of Student PII we collect, if any, and the purposes for which the information is used or shared with third parties.",
      "We will support access to and correction of Student PII by the student or their authorized parent, either by assisting the educational institution or directly when information is collected with student/parent consent.",
      "We will maintain a comprehensive security program reasonably designed to protect the security, confidentiality, and integrity of Student PII through administrative, technological, and physical safeguards.",
      "We will provide resources to support educational institutions, teachers, or parents/students to protect the security and privacy of Student PII while using A.L.L.E.N.",
      "We will require that our vendors with whom Student PII is shared are obligated to follow these same commitments for the given Student PII.",
      "We will allow a successor entity to maintain Student PII in case of merger or acquisition, provided the successor entity is subject to these same commitments.",
      "We will incorporate privacy and security when developing or improving our educational products and comply with applicable laws."
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600">
            Your privacy and data security are our top priorities. Learn how A.L.L.E.N. protects student and educator information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last Updated: January 27, 2025
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Student Privacy Commitments */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Our Commitment to Student Privacy</CardTitle>
              <p className="text-gray-600 text-center">
                A.L.L.E.N. is committed to protecting student privacy and complying with educational privacy laws including FERPA and COPPA.
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* We Will Not Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <X className="w-6 h-6 text-red-500 mr-2" />
                  We Will Not:
                </h3>
                <ul className="space-y-3">
                  {commitments.willNot.map((commitment, index) => (
                    <li key={index} className="flex items-start">
                      <X className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{commitment}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* We Will Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  We Will:
                </h3>
                <ul className="space-y-3">
                  {commitments.will.map((commitment, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{commitment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Privacy Policy */}
          <div className="space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                A.L.L.E.N. ("we," "us," or "our") is committed to protecting the privacy of users ("you" or "your") who use our AI-powered grading and educational platform. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use A.L.L.E.N.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Please read this Privacy Policy carefully. By accessing or using A.L.L.E.N., you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with this Privacy Policy, please do not use our services.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Teacher Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account, we collect personal information such as your name, email address, school affiliation, and Canvas LMS credentials (instance URL and access token) necessary to integrate with your learning management system.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.2 Student Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not directly collect personal information from students. We temporarily process student assignment submissions and discussion posts retrieved from your Canvas LMS solely for the purpose of AI-powered grading and feedback generation. This data is processed temporarily and is not permanently stored in our systems.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.3 Educational Content</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Teachers provide assignment questions, rubrics, and grading criteria to A.L.L.E.N. for grading purposes. We consider this data as educational records and treat it in accordance with FERPA regulations.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.4 Usage Information</h3>
              <p className="text-gray-700 leading-relaxed">
                We collect non-personal information about your interactions with A.L.L.E.N., such as your IP address, device information, browser type, and usage patterns. This information is used to improve our services, enhance user experience, and ensure system security.
              </p>
            </section>

            {/* Use of Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Collected Information</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Providing Educational Services</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the collected information to provide AI-powered grading services, generate feedback for student submissions, integrate with Canvas LMS, and deliver educational analytics to help teachers improve their instruction.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Service Improvement</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may use aggregated and anonymized data for research and development purposes to improve our AI grading accuracy, features, and overall user experience. We do not use student data to train AI models.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Communications</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may use your email address to send important notifications, updates, and relevant information about our services.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.4 Legal Compliance</h3>
              <p className="text-gray-700 leading-relaxed">
                We may disclose personal information if required by law, legal process, or to protect the rights, property, or safety of A.L.L.E.N., our users, or others.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Third-Party Services</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Canvas LMS Integration</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                A.L.L.E.N. integrates with Canvas LMS to retrieve assignments, discussions, and student submissions. We use secure API connections and do not store Canvas credentials permanently.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 OpenAI Services</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To provide AI-powered grading and feedback, we share anonymized assignment content with OpenAI. This data does not identify individual students and is used solely for generating educational feedback. OpenAI has agreed not to use this data for training their models.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Infrastructure Providers</h3>
              <p className="text-gray-700 leading-relaxed">
                We use Supabase for secure authentication and data storage infrastructure. All service providers are obligated to maintain data confidentiality and security standards consistent with this privacy policy.
              </p>
            </section>

            {/* Data Security and Retention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security and Retention</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Data Security</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement comprehensive security measures including encryption, secure access controls, and regular security audits to protect personal information from unauthorized access, disclosure, alteration, or destruction.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Data Retention</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain teacher account information for as long as necessary to provide our services. Student submission data is processed temporarily and is not permanently stored. We retain educational records in accordance with FERPA regulations and institutional requirements.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Data Minimization</h3>
              <p className="text-gray-700 leading-relaxed">
                We collect and process only the minimum amount of data necessary to provide our educational services effectively.
              </p>
            </section>

            {/* User Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights and Choices</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Access and Update</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Teachers can access and update their personal information by logging into their A.L.L.E.N. account or by contacting us directly.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Data Deletion</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may request deletion of your personal information by contacting us. Please note that we may be required to retain certain information for legal or legitimate educational purposes.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Communication Preferences</h3>
              <p className="text-gray-700 leading-relaxed">
                You may opt-out of receiving non-essential communications by following the instructions in those communications or by contacting us directly.
              </p>
            </section>

            {/* Legal Compliance */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Legal Compliance</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                A.L.L.E.N. is designed to comply with relevant educational privacy laws including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Family Educational Rights and Privacy Act (FERPA)</li>
                <li>Children's Online Privacy Protection Act (COPPA)</li>
                <li>Student Data Privacy Consortium commitments</li>
                <li>State-specific student privacy laws</li>
              </ul>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated Privacy Policy on our website and providing prominent notice to users. Please review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> privacy@allen-ai.com</p>
                <p className="text-gray-700"><strong>Privacy Officer:</strong> A.L.L.E.N. Privacy Team</p>
                <p className="text-gray-700"><strong>Response Time:</strong> We will respond to privacy inquiries within 30 days</p>
              </div>
            </section>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
