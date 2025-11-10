
import React from 'react';

const GuidelinesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Our Compliance Framework</h2>
        <p className="text-gray-600 mb-6">
          The templates within CartaLinc are built upon real-world regulatory standards from authorities in New Zealand and Australia. Our goal is to provide a credible, robust framework to help you meet your compliance obligations. This guide outlines the key bodies whose standards inform our templates.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-green-700">Food Safety & Biosecurity</h3>
            <p className="text-sm text-gray-600 mt-1">Ensuring food is safe for consumption and protecting our borders from pests and diseases are paramount.</p>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
              <li><strong>MPI (NZ) & FSANZ (AU/NZ):</strong> Our food safety templates align with the principles of the Food Act, managed by the Ministry for Primary Industries (MPI) in New Zealand, and the joint Food Standards Australia New Zealand (FSANZ) code. This covers traceability, pest control, and hygiene.</li>
              <li><strong>HACCP:</strong> We incorporate Hazard Analysis and Critical Control Point (HACCP) principles, a global standard for managing food safety risks, which is essential for most exporters.</li>
               <li><strong>Biosecurity:</strong> Templates reference MPI's Import Health Standards (IHS) and biosecurity protocols to ensure supply chain integrity.</li>
            </ul>
            <a href="https://www.mpi.govt.nz/food-safety-home/" target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline mt-2 inline-block">Learn about NZ Food Safety &rarr;</a>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-green-700">Workplace Health & Safety</h3>
            <p className="text-sm text-gray-600 mt-1">Creating a safe working environment is a legal and ethical responsibility for all businesses.</p>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
              <li><strong>WorkSafe (NZ) & Safe Work (AU):</strong> Our H&S templates are based on guidelines from WorkSafe New Zealand and Australian state bodies like Safe Work Australia. Key areas include hazard identification, risk management, emergency procedures, and staff training.</li>
            </ul>
             <a href="https://www.worksafe.govt.nz/" target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline mt-2 inline-block">Visit WorkSafe NZ &rarr;</a>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-green-700">Environmental & Chemical Management</h3>
            <p className="text-sm text-gray-600 mt-1">Responsible management of agricultural chemicals and environmental impact is critical for sustainable primary production.</p>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
              <li><strong>EPA (NZ & AU):</strong> Templates for agrichemical management are guided by the Environmental Protection Authority (EPA) in both countries, covering safe storage, handling, inventory management, and compliance with the HSNO Act in New Zealand.</li>
            </ul>
             <a href="https://www.epa.govt.nz/" target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline mt-2 inline-block">Visit EPA New Zealand &rarr;</a>
          </div>
           <div>
            <h3 className="text-lg font-semibold text-green-700">Employment & Social Practice</h3>
            <p className="text-sm text-gray-600 mt-1">Fair and lawful employment practices are a cornerstone of a responsible business and are often required for market access.</p>
             <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
               <li><strong>Employment Law:</strong> Our templates reference core requirements of the Employment Relations Act in NZ and the Fair Work Act in Australia, ensuring basics like employment agreements are covered.</li>
               <li><strong>NZGAP / Freshcare:</strong> We also draw from industry standards like NZGAP and Freshcare (Australia), which include modules on social practice and labour rights.</li>
            </ul>
          </div>
          
           <div>
            <h3 className="text-lg font-semibold text-gray-600 italic mt-4">Disclaimer</h3>
            <p className="text-xs text-gray-500">The templates provided in CartaLinc are for guidance purposes and to streamline the evidence-gathering process. They are not a substitute for legal advice or official certification. Always consult directly with regulatory bodies and industry auditors to ensure full compliance.</p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesModal;
