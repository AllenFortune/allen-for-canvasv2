
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AboutFAQ = () => {
  const faqs = [
    {
      question: "Is this going to replace me as a teacher?",
      answer: "Absolutely not. A.L.L.E.N. is designed to assist you, not replace you. You make all final decisions about grades and feedback. The AI simply provides starting points and suggestions that you can edit, modify, or completely rewrite. Your teaching expertise, student relationships, and professional judgment remain irreplaceable."
    },
    {
      question: "How accurate are the AI suggestions?",
      answer: "A.L.L.E.N.'s suggestions are based on the criteria you provide (rubrics, assignment instructions, or custom guidelines). While the AI is quite capable, it's designed as a starting point for your review. You should always review and adjust suggestions based on your knowledge of the student and assignment context."
    },
    {
      question: "Can I customize the feedback style?",
      answer: "Yes! You can customize A.L.L.E.N. to match your teaching style, emphasize specific learning outcomes, choose between formative and summative feedback approaches, and set the tone and focus areas that matter most to your teaching goals."
    },
    {
      question: "What about student privacy and data?",
      answer: "Student privacy is paramount. A.L.L.E.N. integrates securely with Canvas through official APIs and follows educational data privacy standards. Student work is processed only for grading assistance and is not stored or used for any other purposes."
    },
    {
      question: "How does this save time?",
      answer: "A.L.L.E.N. provides initial grade suggestions and draft feedback based on your criteria, significantly reducing the time spent on the initial evaluation phase. You still review everything, but you start with a foundation rather than a blank page, making the process much more efficient."
    },
    {
      question: "Can I use this with my existing rubrics?",
      answer: "Yes! A.L.L.E.N. works with your existing rubrics and assignment instructions. You can also create custom grading criteria to emphasize specific learning outcomes or objectives that are important for each assignment."
    },
    {
      question: "Will students know AI was involved?",
      answer: "That's entirely up to you. A.L.L.E.N. assists in creating feedback, but all final comments come from you. You can choose whether or not to inform students about AI assistance in your grading process, and you can edit all feedback to match your voice completely."
    },
    {
      question: "What happens if I disagree with the AI suggestion?",
      answer: "That's perfectly normal and expected! You can edit any suggestion, change grades, rewrite feedback, or ignore AI recommendations entirely. The tool is designed to support your professional judgment, not override it."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Common questions from educators about A.L.L.E.N.
          </p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-white rounded-lg border border-gray-200"
            >
              <AccordionTrigger className="px-6 py-4 text-left">
                <span className="font-medium text-gray-900">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default AboutFAQ;
