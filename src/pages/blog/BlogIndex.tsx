import React from 'react';
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { articles } from "./articles";

const BlogIndex = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Seo
        title="Blog — AI Grading, Written by a Working Professor | Allen Grade Assist"
        description="Practical guides on AI-assisted grading in Canvas — rubric design, feedback quality, and honest lessons from a full-time psychology professor who grades with AI every week."
        path="/blog"
      />

      <section className="bg-gradient-to-br from-indigo-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Notes From the Grading Stack</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Guides and honest lessons on AI-assisted grading in Canvas, written by a professor
            who grades his own courses with it — not a content team.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          {articles.map((a) => (
            <Link
              key={a.slug}
              to={`/blog/${a.slug}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow"
            >
              <p className="text-sm text-gray-500 mb-2">
                {new Date(`${a.datePublished}T00:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {a.readingTime}
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{a.title}</h2>
              <p className="text-gray-600 leading-relaxed">{a.description}</p>
              <p className="text-indigo-600 font-medium mt-4">Read article →</p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogIndex;
