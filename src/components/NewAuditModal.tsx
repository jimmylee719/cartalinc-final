
import React, { useState, useEffect } from 'react';
import { Profile, ChecklistTemplate } from '../types';
import api from '../services/api';
import { XCircleIcon } from './Icons';

interface NewAuditModalProps {
  buyer: Profile;
  onClose: () => void;
  onAuditCreated: () => void;
}

const NewAuditModal: React.FC<NewAuditModalProps> = ({ buyer, onClose, onAuditCreated }) => {
  const [title, setTitle] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  
  const [suppliers, setSuppliers] = useState<Profile[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);

  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customItems, setCustomItems] = useState<{ title: string; helpTextSupplier: string; helpTextBuyer: string }[]>([{ title: '', helpTextSupplier: '', helpTextBuyer: '' }]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [connectedSuppliers, allTemplates] = await Promise.all([
        api.getConnectedSuppliers(buyer.id),
        api.getTemplates(),
      ]);
      setSuppliers(connectedSuppliers);
      setTemplates(allTemplates);
      if (connectedSuppliers.length > 0) {
        setSelectedSupplierId(connectedSuppliers[0].id);
      }
    };
    fetchData();
  }, [buyer.id]);

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplateIds(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleCustomItemChange = (index: number, field: 'title' | 'helpTextSupplier' | 'helpTextBuyer', value: string) => {
    const newItems = [...customItems];
    newItems[index][field] = value;
    setCustomItems(newItems);
  };

  const addCustomItem = () => {
      setCustomItems([...customItems, { title: '', helpTextSupplier: '', helpTextBuyer: '' }]);
  };

  const removeCustomItem = (index: number) => {
      if (customItems.length > 1) {
          setCustomItems(customItems.filter((_, i) => i !== index));
      }
  };


  const handleSubmit = async () => {
    if (!title || !selectedSupplierId || (selectedTemplateIds.length === 0 && !isOtherSelected) || !dueDate) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.createAudit({
        buyerId: buyer.id,
        supplierId: selectedSupplierId,
        auditTitle: title,
        templateIds: selectedTemplateIds,
        dueDate,
        customItems: isOtherSelected ? customItems.filter(item => item.title.trim() !== '' && item.helpTextSupplier.trim() !== '') : [],
      });
      onAuditCreated();
    } catch (err) {
      setError('Failed to create audit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Start New Audit</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Audit Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Q4 2024 Compliance Check" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Select Supplier</label>
                <select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                </select>
                {suppliers.length === 0 && <p className="text-xs text-red-500 mt-1">No active suppliers found. Please add a supplier first.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Compliance Templates</label>
            <div className="grid grid-cols-1 gap-2 p-2 border rounded-md">
                {templates.map(t => (
                    <label key={t.id} className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition ${selectedTemplateIds.includes(t.id) ? 'bg-green-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <input type="checkbox" checked={selectedTemplateIds.includes(t.id)} onChange={() => handleTemplateToggle(t.id)} className="h-4 w-4 text-green-600 border-gray-300 rounded"/>
                        <span className="text-sm font-medium text-gray-800">{t.templateName}</span>
                    </label>
                ))}
            </div>
          </div>

           <div>
            <label className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition mt-2 ${isOtherSelected ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                <input type="checkbox" checked={isOtherSelected} onChange={e => setIsOtherSelected(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                <span className="text-sm font-medium text-blue-800">Other (Add Custom Items)</span>
            </label>
            {isOtherSelected && (
              <div className="space-y-3 mt-2 p-3 border rounded-md bg-gray-50 max-h-48 overflow-y-auto">
                {customItems.map((item, index) => (
                  <div key={index} className="p-2 border rounded-md bg-white relative">
                    <p className="text-xs font-bold mb-1 text-black">Custom Item #{index + 1}</p>
                     {customItems.length > 1 && <button onClick={() => removeCustomItem(index)} className="absolute top-1 right-1 text-gray-400 hover:text-red-500"><XCircleIcon className="w-5 h-5"/></button>}
                    <input type="text" placeholder="Item Name" value={item.title} onChange={e => handleCustomItemChange(index, 'title', e.target.value)} className="w-full text-sm p-1 border rounded-md mb-1"/>
                    <textarea placeholder="Instructions for Supplier" value={item.helpTextSupplier} onChange={e => handleCustomItemChange(index, 'helpTextSupplier', e.target.value)} className="w-full text-xs p-1 border rounded-md" rows={2}/>
                    <input type="hidden" value={item.helpTextBuyer} onChange={e => handleCustomItemChange(index, 'helpTextBuyer', e.target.value)} />
                  </div>
                ))}
                <button onClick={addCustomItem} className="text-sm text-green-600 hover:underline mt-2">+ Add another custom item</button>
              </div>
            )}
           </div>
        </div>
        
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading || (suppliers.length === 0)} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300">
            {loading ? 'Assigning Audit...' : 'Assign Audit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAuditModal;
