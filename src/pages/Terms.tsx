
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600">
            Please read these terms carefully before using A.L.L.E.N.'s AI-powered educational grading platform.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last Updated: January 27, 2025
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Please read these Terms and Conditions ("Terms") carefully before using A.L.L.E.N. (the "Service") provided by A.L.L.E.N. ("we," "us," or "our"). These Terms govern your access to and use of our AI Learning Led Evaluation & Navigation platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.
            </p>
          </div>

          {/* Terms Sections */}
          <div className="space-y-8">
            
            {/* 1. Use of Service */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Use of Service</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Eligibility</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You must be at least 18 years old or the age of majority in your jurisdiction to use the Service. If you are an educator using this Service in a professional capacity, you represent that you have the authority to bind your educational institution to these Terms. By using the Service, you represent and warrant that you meet these eligibility requirements.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.2 User Accounts</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use A.L.L.E.N., you must create a user account and provide Canvas LMS integration credentials. You are responsible for maintaining the confidentiality of your account information, including your username, password, and Canvas access tokens. You agree to provide accurate and complete information when creating an account and to update your information promptly if any changes occur. You are solely responsible for all activities that occur under your account.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.3 Acceptable Use</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree to use the Service only for lawful educational purposes and in compliance with all applicable laws, regulations, FERPA requirements, and these Terms. You will not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Use the Service for any purpose other than legitimate educational assessment and grading</li>
                <li>Attempt to circumvent security measures or gain unauthorized access to other users' data</li>
                <li>Use the Service to process non-educational content or inappropriate material</li>
                <li>Interfere with or disrupt the Service or its associated networks</li>
                <li>Share your Canvas credentials with unauthorized parties</li>
              </ul>
            </section>

            {/* 2. Educational Data and Canvas Integration */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Educational Data and Canvas Integration</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Canvas LMS Integration</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                A.L.L.E.N. integrates with Canvas LMS through secure API connections. By providing your Canvas credentials, you grant A.L.L.E.N. permission to access your courses, assignments, discussions, and student submissions solely for the purpose of providing AI-powered grading services. We do not store Canvas credentials permanently and use them only as needed to perform grading functions.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Student Data Protection</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                A.L.L.E.N. is committed to protecting student privacy in accordance with FERPA regulations. We process student submission data temporarily for grading purposes only and do not permanently store student work. All student data processing is conducted in compliance with educational privacy laws and institutional policies.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Educational Records</h3>
              <p className="text-gray-700 leading-relaxed">
                Assignment questions, rubrics, and grading criteria provided by educators are considered educational records. We maintain the confidentiality and integrity of these records in accordance with applicable educational privacy regulations.
              </p>
            </section>

            {/* 3. AI Services and Third-Party Integration */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. AI Services and Third-Party Integration</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 AI-Powered Grading</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                A.L.L.E.N. uses artificial intelligence, including OpenAI's services, to provide automated grading and feedback generation. While our AI systems are designed to provide accurate and helpful feedback, you acknowledge that AI-generated grades and comments are suggestions that should be reviewed by qualified educators before final submission.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Data Processing with AI Providers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To provide AI-powered grading services, we share anonymized assignment content with OpenAI. This data does not identify individual students and is used solely for generating educational feedback. Our AI service providers have agreed not to use this data for training their models.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 AI Accuracy and Limitations</h3>
              <p className="text-gray-700 leading-relaxed">
                While A.L.L.E.N. strives to provide accurate AI-generated grades and feedback, we do not guarantee the accuracy, completeness, or appropriateness of AI outputs. Educators are responsible for reviewing and validating all AI-generated content before using it for official grading purposes.
              </p>
            </section>

            {/* 4. Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Service Ownership</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Service, including all content, features, and functionality, is owned by A.L.L.E.N. and protected by intellectual property laws. You acknowledge and agree that A.L.L.E.N. retains all rights, title, and interest in and to the Service and its content.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Limited License</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Subject to your compliance with these Terms, A.L.L.E.N. grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for educational purposes. You may not reproduce, distribute, modify, or create derivative works of the Service without our prior written consent.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 User Content</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of educational content you provide to A.L.L.E.N., including assignment questions, rubrics, and grading criteria. By using the Service, you grant A.L.L.E.N. a limited license to process this content solely for the purpose of providing grading services.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.4 Feedback</h3>
              <p className="text-gray-700 leading-relaxed">
                If you provide feedback, suggestions, or ideas regarding the Service, you grant A.L.L.E.N. a non-exclusive, worldwide, perpetual, irrevocable, royalty-free right to use, copy, modify, and distribute such feedback for service improvement purposes.
              </p>
            </section>

            {/* 5. Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of the Service is subject to our Privacy Policy. By using the Service, you consent to the collection, use, and disclosure of your information as described in the Privacy Policy. We are committed to protecting student privacy in accordance with FERPA and other applicable educational privacy laws.
              </p>
            </section>

            {/* 6. Subscription and Billing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Subscription and Billing</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Subscription Plans</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                A.L.L.E.N. offers various subscription plans for individual educators and educational institutions. Subscription fees are billed in advance on a monthly or annual basis depending on your selected plan. All fees are non-refundable except as expressly provided in these Terms.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Payment Terms</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree to pay all fees associated with your subscription plan. If payment is not received by the due date, we may suspend or terminate your access to the Service. You are responsible for keeping your payment information current and accurate.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Changes to Pricing</h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify our pricing at any time. Price changes will take effect at the beginning of your next billing cycle, and we will provide at least 30 days' notice of any price increases.
              </p>
            </section>

            {/* 7. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Service Disclaimer</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Service is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the Service, including its accuracy, reliability, or availability. We disclaim all warranties to the fullest extent permitted by law.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Limitation of Liability</h3>
              <p className="text-gray-700 leading-relaxed">
                In no event shall A.L.L.E.N. be liable for any direct, indirect, incidental, consequential, special, or punitive damages, whether in contract, tort (including negligence), or otherwise, arising out of or in connection with your use of the Service. Our total liability shall not exceed the amount paid by you for the Service in the twelve months preceding the claim.
              </p>
            </section>

            {/* 8. Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless A.L.L.E.N. and its affiliates, directors, officers, employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses, including reasonable attorneys' fees, arising out of or in connection with your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
              </p>
            </section>

            {/* 9. Service Level Agreement */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Service Level Agreement</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                A.L.L.E.N. aims to maintain 99.9% uptime for our services. Scheduled maintenance will be announced at least 48 hours in advance through our platform or email notifications. In the event of unexpected service disruptions, we will provide updates through our status communications.
              </p>
            </section>

            {/* 10. Account Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Account Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may terminate your account at any time through your account settings. A.L.L.E.N. reserves the right to terminate accounts that violate these Terms of Service or engage in inappropriate use of the platform. In case of termination due to policy violations, no refunds will be provided. Users will be notified via email if their account is terminated.
              </p>
            </section>

            {/* 11. Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions. Any legal action or proceeding arising out of or relating to these Terms or the Service shall be brought exclusively in the courts of Delaware.
              </p>
            </section>

            {/* 12. Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. We will notify you of any material changes by posting the updated Terms on our platform or through email communication. By continuing to use the Service after such modifications, you agree to be bound by the revised Terms.
              </p>
            </section>

            {/* 13. Contact Us */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding these Terms, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> legal@allen-ai.com</p>
                <p className="text-gray-700"><strong>Support:</strong> support@allen-ai.com</p>
                <p className="text-gray-700"><strong>Response Time:</strong> We will respond to inquiries within 2 business days</p>
              </div>
            </section>

          </div>

          {/* A.L.L.E.N. Fulfillment Policy */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="text-2xl">A.L.L.E.N. Fulfillment Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Service Delivery</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Upon subscription purchase, your A.L.L.E.N. account will be activated within 24 hours</li>
                  <li>• Access to A.L.L.E.N. features will be granted immediately after account activation</li>
                  <li>• For institutional plans, onboarding sessions will be scheduled within 5 business days of purchase</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Subscription Terms</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Individual subscriptions are billed monthly or annually based on your selected plan</li>
                  <li>• Educational institution plans are billed annually</li>
                  <li>• All features included in your subscription tier will be available for the duration of your subscription period</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Refund Policy</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• If you are not satisfied with A.L.L.E.N., you may request a refund within 14 days of initial purchase</li>
                  <li>• To request a refund, please contact us at support@allen-ai.com</li>
                  <li>• Refunds will be processed within 5-7 business days and issued to the original payment method</li>
                  <li>• After the 14-day period, subscriptions are non-refundable for the current billing cycle</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Cancellation Policy</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• You may cancel your subscription at any time through your account settings</li>
                  <li>• For monthly subscriptions, cancellation will take effect at the end of the current billing cycle</li>
                  <li>• For annual subscriptions, cancellation will take effect at the end of the term</li>
                  <li>• No refunds will be issued for unused portions of the current billing cycle after the 14-day refund period</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Free Trial Terms</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Free trials provide full access to A.L.L.E.N. features for the specified trial period</li>
                  <li>• Canvas integration setup is required to access trial features</li>
                  <li>• You will receive email notifications before your trial expires</li>
                  <li>• If you choose not to subscribe after your trial, your account will be downgraded to limited functionality</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <p className="text-gray-700">
                  For any questions regarding this Fulfillment Policy, please contact us at:
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Email:</strong> support@allen-ai.com
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Final Agreement Statement */}
          <div className="mt-12 p-6 bg-indigo-50 rounded-lg">
            <p className="text-gray-800 font-medium text-center">
              By using the A.L.L.E.N. service, you acknowledge that you have read, understood, and agree to be bound by these Terms and any other agreements or policies referenced herein.
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
