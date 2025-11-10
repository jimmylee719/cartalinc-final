import React, { useState, useEffect } from 'react';
import { Audit, ChecklistTemplate, AuditItem } from '../types';
import api from '../services/api';
import { XCircleIcon } from './Icons';

interface AddItemsToAuditModalProps {
  audit: Audit;
  existingAuditItems: AuditItem[];
  onClose: () => void;
  onItemsAdded: () => void;
}

const AddItemsToAuditModal: React.FC<AddItemsToAuditModalProps> = ({ audit, existingAuditItems, onClose, onItemsAdded }) => {
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<ChecklistTemplate[]>([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customItems, setCustomItems] = useState<{ title: string; helpTextSupplier: string; helpTextBuyer: string }[]>([{ title: '', helpTextSupplier: '', helpTextBuyer: '' }]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      const allTemplates = await api.getTemplates();
      // In a real app, you might filter templates/items that are already fully present.
      // For this implementation, the API prevents adding duplicate items.
      setAvailableTemplates(allTemplates);
    };
    fetchTemplates();
  }, []);

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
    const validCustomItems = customItems.filter(item => item.title.trim() !== '' && item.helpTextSupplier.trim() !== '');
    if (selectedTemplateIds.length === 0 && (!isOtherSelected || validCustomItems.length === 0)) {
      setError('Please select at least one template item or add a valid custom item.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.addItemsToAudit(audit.id, {
        templateIds: selectedTemplateIds,
        customItems: isOtherSelected ? validCustomItems : [],
      });
      onItemsAdded();
    } catch (err) {
      setError('Failed to add items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Items to Audit: <span className="text-green-700">{audit.auditTitle}</span></h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Additional Templates/Items</label>
            <div className="grid grid-cols-1 gap-2 p-2 border rounded-md">
                {availableTemplates.map(t => (
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
          <button onClick={handleSubmit} disabled={loading} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300">
            {loading ? 'Adding Items...' : 'Add Items'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemsToAuditModal;
