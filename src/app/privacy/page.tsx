'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <p className="text-gray-600 mb-8">
              Last updated: August 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                When you use MyFirstResume, we collect the following information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Account information (email address, name) when you create an account</li>
                <li>Resume files that you upload to our service</li>
                <li>Usage data about how you interact with our service</li>
                <li>Technical information such as IP address, browser type, and device information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide AI-powered resume review and feedback services</li>
                <li>Improve and optimize our service</li>
                <li>Communicate with you about your account and our service</li>
                <li>Ensure the security and integrity of our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resume Data Protection</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                <p className="text-blue-800 font-medium mb-2">Important: We do not distribute your resumes</p>
                <p className="text-blue-700">
                  Your resume files are strictly confidential and are never shared, sold, or distributed to third parties. 
                  We use your resume data solely to provide AI-powered feedback and review services.
                </p>
              </div>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Resume files are encrypted and stored securely</li>
                <li>Access to your resume data is restricted to our AI processing systems</li>
                <li>We do not share your resume content with any companies or recruiters</li>
                <li>You maintain full ownership of your resume content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Company Affiliations</h2>
              <p className="text-gray-700 mb-4">
                MyFirstResume operates independently and is not affiliated with any of the companies mentioned 
                in our AI feedback or review content. Any references to specific companies are used solely for 
                educational and illustrative purposes to provide relevant career guidance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your 
                information only in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations or law enforcement requests</li>
                <li>To protect our rights, property, or safety, or that of our users</li>
                <li>With service providers who assist in operating our platform (under strict confidentiality agreements)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your personal information and resume data:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure data centers and infrastructure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access and review your personal information</li>
                <li>Correct or update your information</li>
                <li>Delete your account and associated data</li>
                <li>Download your resume files</li>
                <li>Opt out of communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal information and resume data for as long as your account is active or as 
                needed to provide our services. You may delete your account and associated data at any time 
                through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the updated policy on our website and updating the &quot;Last updated&quot; date above.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <p className="text-gray-700">
                  Email: <a href="mailto:contact@myfirstresume.com" className="text-blue-600 hover:text-blue-800">contact@myfirstresume.com</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
