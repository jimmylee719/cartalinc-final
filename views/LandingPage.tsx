import React, { useState } from 'react';
import { UserRole } from '../types';
import InfoModal from '../components/InfoModal';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);

  const aboutContent = (
    <div className="space-y-4 text-gray-700">
      <p>CartaLinc is a purpose-built tool designed to eliminate the friction in supply chain compliance. Our platform provides a clear, direct line of communication for audits, replacing inefficient email chains with a streamlined, accountable workflow.</p>
      <p><strong>Our Mission:</strong> We believe that proving compliance should be simple. By providing a shared, transparent platform, we help Suppliers and Buyers save time, reduce errors, and build stronger, more trusted partnerships. The result is a faster, more reliable compliance cycle for everyone.</p>
      <p>For inquiries, please contact us at <a href="mailto:skadoosh.ai.lab@gmail.com" className="text-green-600 hover:underline">skadoosh.ai.lab@gmail.com</a>.</p>
    </div>
  );

  const privacyContent = (
    <div className="space-y-4 text-gray-700">
      <p>Your privacy and data security are fundamental to our service. CartaLinc is designed as a secure communication and workflow tool, not a data collection platform.</p>
      <h3 className="font-bold">Our Data Philosophy</h3>
      <p>We do not collect or store any corporate or personal data beyond what is strictly necessary to facilitate the audit process between you and your connected business partners. The platform's purpose is to improve your business efficiency, and our data practices reflect that singular goal.</p>
      <h3 className="font-bold">How Your Information is Used</h3>
      <p>The information you provide—such as your company name, contact details, and uploaded audit evidence—is used exclusively to power the core features of the platform. It enables you to connect with partners, manage audits, and generate compliance reports. We will never sell, share, or monetize your data.</p>
    </div>
  );

  const howToUseContent = (
    <div className="space-y-6 text-gray-700">
        <div>
            <h3 className="font-bold text-lg text-green-700">1. Create Your Account & Get Your Code</h3>
            <p>Select your role—<span className="font-semibold">Supplier</span> (e.g., a grower) or <span className="font-semibold">Buyer</span> (e.g., an exporter). After registering, you'll receive a unique company code (e.g., "KIWI456"). This code is how you connect with your business partners on the platform.</p>
        </div>
        <div>
            <h3 className="font-bold text-lg text-green-700">2. Connect with Your Partner</h3>
            <p>To start an audit, you must first connect with your partner. From your dashboard, click "Add Supplier" or "Add Buyer" and enter their unique code. Once they accept your request, you can begin working together.</p>
        </div>
        <div>
            <h3 className="font-bold text-lg text-green-700">3. A Buyer Assigns an Audit</h3>
            <p>A Buyer initiates an audit by selecting a connected Supplier, choosing the required compliance templates (like "Health & Safety"), and setting a due date. The Supplier is instantly notified that a new audit is ready.</p>
        </div>
        <div>
            <h3 className="font-bold text-lg text-green-700">4. A Supplier Submits Evidence</h3>
            <p>The Supplier sees the audit as a simple to-do list. For each item, you can upload evidence (photos, documents) and add notes. Once all items are complete, you submit the entire package for review with a single click.</p>
        </div>
        <div>
            <h3 className="font-bold text-lg text-green-700">5. A Buyer Reviews and Approves</h3>
            <p>The Buyer reviews the submitted evidence. If an item is correct, you click "Approve". If it's incorrect (e.g., a blurry photo), you click "Reject" and add a comment explaining what to fix. This targeted feedback eliminates guesswork for the Supplier.</p>
        </div>
        <div>
            <h3 className="font-bold text-lg text-green-700">6. Generate Your Final Report</h3>
            <p>Once the Buyer has approved every item, the audit is complete. A final, professional PDF report is automatically generated. Both parties can download this report as a permanent record of successful compliance.</p>
        </div>
    </div>
  );


  return (
    <>
      <div className="min-h-screen bg-green-50 flex flex-col justify-center items-center p-4">
        <div className="max-w-2xl text-center">
           <h1 className="text-4xl sm:text-5xl font-bold text-green-700 mb-4">CartaLinc</h1>
          <p className="text-xl text-gray-600">
             Stop the email chaos. CartaLinc streamlines supply chain compliance. Our mobile-first platform gives Suppliers clear checklists and Buyers the power to approve or reject with specific feedback. No more wasted time on resubmissions. Get the right data, get it approved, and get your final PDF report. Faster.
          </p>
          <div className="mt-4">
             <button 
                onClick={() => setModalContent({ title: 'How to Use CartaLinc', content: howToUseContent })} 
                className="text-green-600 font-semibold hover:underline"
              >
                  Learn how to use CartaLinc &rarr;
              </button>
          </div>
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-800">What problem do we solve?</h2>
            <p className="mt-2 text-gray-600">
              We streamline the audit process between agricultural suppliers (like you!) and buyers, making it easy to prove compliance with standards like WorkSafe, MPI, and NZGAP. No more lost documents or endless back-and-forth. Just a simple to-do list for suppliers and a clear dashboard for buyers.
            </p>
          </div>

          <div className="mt-12">
            <p className="text-lg font-semibold text-gray-800 mb-4">Choose your role to get started:</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => onSelectRole(UserRole.Supplier)}
                className="bg-white border-2 border-green-600 text-green-700 font-bold py-3 px-8 rounded-lg shadow-md hover:bg-green-600 hover:text-white transition-all duration-300 text-lg"
              >
                I'm a Supplier
                <span className="block text-sm font-normal">(Farmer, Grower, Orchard)</span>
              </button>
              <button
                onClick={() => onSelectRole(UserRole.Buyer)}
                className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 text-lg"
              >
                I'm a Buyer
                <span className="block text-sm font-normal">(Exporter, Retailer, Processor)</span>
              </button>
            </div>
          </div>
        </div>
        <footer className="text-center text-gray-500 text-sm mt-16">
            <div className="flex space-x-4 justify-center">
                 <button onClick={() => setModalContent({ title: 'Privacy Policy', content: privacyContent })} className="hover:underline">Privacy</button>
                 <span>|</span>
                 <button onClick={() => setModalContent({ title: 'About CartaLinc', content: aboutContent })} className="hover:underline">About</button>
            </div>
            <p className="mt-4">CartaLinc &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
      {modalContent && <InfoModal title={modalContent.title} onClose={() => setModalContent(null)}>{modalContent.content}</InfoModal>}
    </>
  );
};

export default LandingPage;