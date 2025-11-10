import React, { useState, useEffect, useCallback, ChangeEvent, useMemo } from 'react';
import { Audit, Profile, AuditItem, TemplateItem, ChecklistTemplate, UserRole, AuditItemStatus, SupplierCustomItem, ItemComment, AuditStatus } from '../types';
import api from '../services/api';
import { CheckCircleIcon, ChevronDownIcon, ClockIcon, EyeIcon, PaperClipIcon, PlusCircleIcon, UploadIcon, XCircleIcon } from '../components/Icons';
import HelpTooltip from '../components/HelpTooltip';
import { generateCertificatePDF } from '../utils/pdfGenerator';
import AddItemsToAuditModal from '../components/AddItemsToAuditModal';

interface AuditDetailPageProps {
  auditId: string;
  user: Profile;
  onBack: () => void;
}

const statusInfo: Record<AuditItemStatus, { text: string; icon: React.ReactNode; color: string; }> = {
    [AuditItemStatus.Approved]: { text: 'Approved', icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />, color: 'text-green-600' },
    [AuditItemStatus.Rejected]: { text: 'Rejected', icon: <XCircleIcon className="w-5 h-5 text-red-500" />, color: 'text-red-600' },
    [AuditItemStatus.PendingReview]: { text: 'Pending Review', icon: <EyeIcon className="w-5 h-5 text-yellow-500" />, color: 'text-yellow-600' },
    [AuditItemStatus.PendingUpload]: { text: 'Pending Upload', icon: <ClockIcon className="w-5 h-5 text-gray-400" />, color: 'text-gray-500' },
};

const CommentThread: React.FC<{ itemId: string; isSupplierCustom: boolean; currentUser: Profile; onCommentAdded: () => void }> = ({ itemId, isSupplierCustom, currentUser, onCommentAdded }) => {
    const [comments, setComments] = useState<ItemComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [profiles, setProfiles] = useState<Record<string, string>>({});
    
    useEffect(() => {
        const fetchCommentsAndProfiles = async () => {
            const fetchedComments = await api.getCommentsForItem(itemId, isSupplierCustom);
            setComments(fetchedComments);
            const userIds = [...new Set(fetchedComments.map(c => c.userId))];
            const profilesData: Record<string, string> = {};
            for (const id of userIds) {
                const profile = await api.getProfileById(id);
                if (profile) profilesData[id] = profile.contactName;
            }
            setProfiles(profilesData);
        };
        fetchCommentsAndProfiles();
    }, [itemId, isSupplierCustom, onCommentAdded]);

    const handleAddComment = async () => {
        if (newComment.trim()) {
            await api.addComment(itemId, isSupplierCustom, currentUser.id, newComment);
            setNewComment('');
            onCommentAdded();
        }
    };

    return (
        <div className="mt-4 space-y-3 px-4 pb-4">
            {comments.map(comment => (
                <div key={comment.id} className="text-xs">
                    <p>
                        <span className="font-bold">{profiles[comment.userId] || '...'}</span>
                        <span className="text-gray-500 ml-2">{new Date(comment.timestamp).toLocaleString()}</span>
                    </p>
                    <p className="text-gray-700 bg-gray-100 p-2 rounded-md mt-1">{comment.commentText}</p>
                </div>
            ))}
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-grow border rounded-md px-2 py-1 text-sm"
                />
                <button onClick={handleAddComment} className="bg-green-600 text-white px-3 py-1 rounded-md text-sm">Send</button>
            </div>
        </div>
    );
};


const AuditItemCard: React.FC<{ item: AuditItem | SupplierCustomItem; templateItem?: TemplateItem; user: Profile; onUpdate: () => void; isSupplierCustom: boolean; }> = ({ item, templateItem, user, onUpdate, isSupplierCustom }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [notes, setNotes] = useState(item.supplierNotes || '');
    const [isUploading, setIsUploading] = useState(false);
    const [rejectionComment, setRejectionComment] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [evidenceText, setEvidenceText] = useState(item.supplierEvidenceText || '');
    
    const { itemTitle, helpText } = useMemo(() => {
        if (isSupplierCustom) {
            return { itemTitle: (item as SupplierCustomItem).itemTitle, helpText: undefined };
        }
        const auditItem = item as AuditItem;
        const title = auditItem.itemTitle || templateItem?.itemTitle || 'Unnamed Item';
        const ht = auditItem.itemHelpText || templateItem?.itemHelpText;
        const specificHelpText = ht ? (user.userRole === UserRole.Supplier ? ht.supplier : ht.buyer) : undefined;
        return { itemTitle: title, helpText: specificHelpText };
    }, [item, templateItem, user.userRole, isSupplierCustom]);

    const MAX_FILES = 10;
    const currentFileCount = (item.evidenceFiles?.length || 0) + newFiles.length;

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesToAdd = Array.from(e.target.files);
            if (currentFileCount + filesToAdd.length > MAX_FILES) {
                alert(`You can upload a maximum of ${MAX_FILES} files. You can add ${MAX_FILES - currentFileCount} more.`);
                return;
            }
            setNewFiles(prev => [...prev, ...filesToAdd]);
        }
    };
    
    const removeNewFile = (indexToRemove: number) => {
        setNewFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmitEvidence = async () => {
        setIsUploading(true);
        await api.submitEvidence(item.id, isSupplierCustom, {
            files: newFiles,
            evidenceText: evidenceText,
            notes: notes
        });
        setNewFiles([]);
        setIsUploading(false);
        onUpdate();
    };

    const handleStatusChange = async (status: AuditItemStatus) => {
        await api.updateAuditItemStatus(item.id, isSupplierCustom, status);
        if (status === AuditItemStatus.Rejected && rejectionComment.trim()) {
            await api.addComment(item.id, isSupplierCustom, user.id, `REJECTION: ${rejectionComment}`);
        }
        setIsRejecting(false);
        setRejectionComment('');
        onUpdate();
    }

    const renderSupplierView = () => (
        <div>
            <div className="p-4 space-y-4">
                <p className="text-sm font-semibold text-black">Your Task:</p>
                
                {/* File Upload Section */}
                <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Upload File(s)</p>
                    <input type="file" id={`file_${item.id}`} className="hidden" onChange={handleFileChange} multiple disabled={currentFileCount >= MAX_FILES}/>
                    <label htmlFor={`file_${item.id}`} className={`w-full bg-white border border-gray-300 rounded-md p-2 text-sm flex items-center justify-center space-x-2 text-gray-700 ${currentFileCount >= MAX_FILES ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:bg-gray-50'}`}>
                        <UploadIcon className="w-5 h-5 text-gray-500" />
                        <span>{currentFileCount >= MAX_FILES ? 'Maximum files reached' : 'Choose file(s)...'}</span>
                    </label>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                        You can upload up to {MAX_FILES} files. ({currentFileCount}/{MAX_FILES} uploaded)<br/>
                        For multi-page documents like PDFs, consider uploading clear photos of each page.
                    </div>

                    <div className="mt-2 space-y-1">
                        {item.evidenceFiles?.map((file, index) => (
                            <div key={index} className="text-xs bg-gray-100 p-1 rounded flex items-center">
                                <PaperClipIcon className="w-4 h-4 mr-2 text-gray-600" />
                                <span className="flex-grow text-black">{file.name} (Uploaded)</span>
                            </div>
                        ))}
                        {newFiles.map((file, index) => (
                            <div key={index} className="text-xs bg-green-50 p-1 rounded flex items-center">
                                <PaperClipIcon className="w-4 h-4 mr-2 text-green-600" />
                                <span className="flex-grow text-black">{file.name}</span>
                                <button onClick={() => removeNewFile(index)} className="text-red-500 hover:text-red-700 ml-2 font-bold">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Text Evidence Section */}
                <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Or/And Write Evidence</p>
                    <textarea 
                        value={evidenceText} 
                        onChange={(e) => setEvidenceText(e.target.value)}
                        placeholder="Provide your written evidence here..."
                        className="w-full border rounded-md p-2 text-sm"
                        rows={4}
                    />
                </div>
               
                {/* Notes Section */}
                <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Optional Notes</p>
                    <textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add optional notes for the reviewer..."
                        className="w-full border rounded-md p-2 text-sm"
                        rows={2}
                    />
                </div>
                
                <button 
                    onClick={handleSubmitEvidence} 
                    disabled={isUploading || (newFiles.length === 0 && evidenceText === (item.supplierEvidenceText || ''))} 
                    className="w-full bg-green-600 text-white py-2 rounded-md text-sm font-semibold disabled:bg-gray-300 flex items-center justify-center"
                >
                    {isUploading ? 'Submitting...' : 'Submit Evidence for Review'}
                </button>
            </div>
        </div>
    );
    
    const renderBuyerView = () => (
       <div className="p-4">
            <p className="text-sm font-semibold mb-2">Supplier Evidence:</p>
            {(item.evidenceFiles && item.evidenceFiles.length > 0) ? (
                <div className="border rounded-md p-2 space-y-1">
                    {item.evidenceFiles.map((file, index) => (
                         <a key={index} href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline flex items-center space-x-2">
                            <PaperClipIcon className="w-4 h-4" />
                            <span>{file.name}</span>
                        </a>
                    ))}
                </div>
            ) : item.supplierEvidenceText ? null : <p className="text-sm text-gray-500 italic">No files provided yet.</p>}
            
            {item.supplierEvidenceText && (
                <div className="border rounded-md p-2 bg-gray-50 mt-2">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.supplierEvidenceText}</p>
                </div>
            )}
            
            {item.supplierNotes && <p className="text-xs text-gray-600 bg-yellow-50 p-2 rounded mt-2"><strong>Supplier Notes:</strong> {item.supplierNotes}</p>}

            {item.status === AuditItemStatus.PendingReview && (
                <div className="mt-4 flex space-x-2">
                    <button onClick={() => handleStatusChange(AuditItemStatus.Approved)} className="flex-1 bg-green-500 text-white text-sm py-2 rounded-md hover:bg-green-600">Approve</button>
                    <button onClick={() => setIsRejecting(true)} className="flex-1 bg-red-500 text-white text-sm py-2 rounded-md hover:bg-red-600">Reject</button>
                </div>
            )}
            {isRejecting && (
                <div className="mt-3 bg-red-50 p-3 rounded-md">
                    <textarea value={rejectionComment} onChange={(e) => setRejectionComment(e.target.value)} placeholder="Reason for rejection (required)..." className="w-full text-sm border p-2 rounded-md" rows={2}/>
                    <div className="flex space-x-2 mt-2">
                         <button onClick={() => handleStatusChange(AuditItemStatus.Rejected)} disabled={!rejectionComment.trim()} className="flex-1 bg-red-600 text-white text-sm py-1 rounded-md disabled:bg-red-300">Confirm Rejection</button>
                         <button onClick={() => setIsRejecting(false)} className="flex-1 bg-black text-white text-sm py-1 rounded-md">Cancel</button>
                    </div>
                </div>
            )}
       </div>
    );

    const status = statusInfo[item.status];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center">
                    <div className="mr-3">{status.icon}</div>
                    <div>
                        <h4 className="font-semibold text-gray-800 flex items-center">
                            {itemTitle}
                            {helpText && <HelpTooltip text={helpText} />}
                        </h4>
                        <p className={`text-sm font-medium ${status.color}`}>{status.text}</p>
                    </div>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            {isExpanded && (
                <div className="border-t border-gray-200">
                    {user.userRole === UserRole.Supplier ? renderSupplierView() : renderBuyerView()}
                    {user.userRole === UserRole.Buyer && (
                      <CommentThread itemId={item.id} isSupplierCustom={isSupplierCustom} currentUser={user} onCommentAdded={onUpdate} />
                    )}
                </div>
            )}
        </div>
    );
};

const AddCustomItem: React.FC<{ auditId: string, onUpdate: () => void }> = ({ auditId, onUpdate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [notes, setNotes] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const MAX_FILES = 10;

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesToAdd = Array.from(e.target.files);
            if (files.length + filesToAdd.length > MAX_FILES) {
                 alert(`You can upload a maximum of ${MAX_FILES} files.`);
                return;
            }
            setFiles(prev => [...prev, ...filesToAdd]);
        }
    };

    const removeFile = (indexToRemove: number) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async () => {
        if (!title.trim() || files.length === 0) return;
        setIsUploading(true);
        await api.addCustomItem(auditId, title, files, notes);
        setIsUploading(false);
        setTitle('');
        setFiles([]);
        setNotes('');
        setIsAdding(false);
        onUpdate();
    };

    if (!isAdding) {
        return (
            <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-green-500 hover:text-green-600 transition">
                <PlusCircleIcon className="w-6 h-6"/>
                <span className="font-semibold">Add Other Evidence</span>
            </button>
        )
    }

    return (
        <div className="bg-white p-4 rounded-lg border-2 border-green-500 shadow-lg">
            <h4 className="font-bold mb-2">Add Custom Evidence</h4>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Evidence Title (e.g. 'All Staff Photo')" className="w-full border rounded-md p-2 text-sm mb-2" />
            
            <input type="file" id="custom_file" className="hidden" onChange={handleFileChange} multiple disabled={files.length >= MAX_FILES}/>
            <label htmlFor="custom_file" className={`w-full bg-white border border-gray-300 rounded-md p-2 text-sm flex items-center justify-center space-x-2 text-gray-700 mb-2 ${files.length >= MAX_FILES ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:bg-gray-50'}`}>
                 <UploadIcon className="w-5 h-5 text-gray-500" />
                 <span>{files.length >= MAX_FILES ? 'Maximum files reached' : 'Choose file(s)...'}</span>
            </label>
             <div className="mb-2 space-y-1">
                {files.map((file, index) => (
                    <div key={index} className="text-xs bg-green-50 p-1 rounded flex items-center">
                        <PaperClipIcon className="w-4 h-4 mr-2 text-green-600" />
                        <span className="flex-grow text-black">{file.name}</span>
                        <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 ml-2">&times;</button>
                    </div>
                ))}
            </div>

            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" className="w-full border rounded-md p-2 text-sm mb-2" rows={2}/>
            <div className="flex space-x-2">
                <button onClick={handleSubmit} disabled={!title.trim() || files.length === 0 || isUploading} className="flex-1 bg-green-600 text-white text-sm py-2 rounded-md disabled:bg-gray-300">
                    {isUploading ? 'Uploading...' : 'Add Evidence'}
                </button>
                <button onClick={() => setIsAdding(false)} className="flex-1 bg-black text-white text-sm py-2 rounded-md">Cancel</button>
            </div>
        </div>
    );
};


const AuditDetailPage: React.FC<AuditDetailPageProps> = ({ auditId, user, onBack }) => {
    const [audit, setAudit] = useState<Audit | null>(null);
    const [buyer, setBuyer] =useState<Profile | null>(null);
    const [supplier, setSupplier] =useState<Profile | null>(null);
    const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
    const [templateItems, setTemplateItems] = useState<TemplateItem[]>([]);
    const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
    const [customItems, setCustomItems] = useState<SupplierCustomItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isAddItemsModalOpen, setIsAddItemsModalOpen] = useState(false);
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        const details = await api.getAuditDetails(auditId);
        if (details) {
            setAudit(details.audit);
            setBuyer(details.buyer);
            setSupplier(details.supplier);
        }
        
        const [allTemplates, allTemplateItems, allAuditItems, allCustomItems] = await Promise.all([
            api.getTemplates(),
            api.getTemplateItems(),
            api.getAuditItemsForAudit(auditId),
            api.getCustomItemsForAudit(auditId)
        ]);
        setTemplates(allTemplates);
        setTemplateItems(allTemplateItems);
        setAuditItems(allAuditItems);
        setCustomItems(allCustomItems);
        
        setLoading(false);
    }, [auditId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleUpdate = useCallback(() => {
        fetchData();
        api.checkAndFinalizeAudit(auditId).then(finalized => {
            if (finalized) fetchData();
        });
    }, [fetchData, auditId]);
    
    const handleItemsAdded = () => {
        setIsAddItemsModalOpen(false);
        fetchData();
    };

    const handlePdfGeneration = async () => {
        if (!audit || !buyer || !supplier) return;
        setIsGeneratingPdf(true);

        const isPreview = user.userRole === UserRole.Supplier && audit.status !== AuditStatus.Approved;
        await generateCertificatePDF({
            audit, buyer, supplier, templates, templateItems, auditItems, customItems
        }, isPreview);
        setIsGeneratingPdf(false);
    }
    
    if (loading) return <div>Loading audit details...</div>;
    if (!audit || !buyer || !supplier) return <div>Audit not found.</div>;
    
    const canSubmitForReview = user.userRole === UserRole.Supplier && audit.status === AuditStatus.Pending && auditItems.every(i => i.status !== AuditItemStatus.PendingUpload);
    const allItems = [...auditItems, ...customItems];
    const completedItems = allItems.filter(i => i.status === AuditItemStatus.Approved).length;
    const progress = allItems.length > 0 ? (completedItems / allItems.length) * 100 : 0;
    
    const groupedAuditItems = audit.templateIds.map(tid => {
        const template = templates.find(t => t.id === tid);
        const items = auditItems.filter(ai => templateItems.find(ti => ti.id === ai.templateItemId)?.templateId === tid);
        return { template, items };
    });
    
    const buyerCustomItems = auditItems.filter(ai => !ai.templateItemId);

    const showPdfButton = audit.status === AuditStatus.Approved || (user.userRole === UserRole.Supplier && audit.status === AuditStatus.InReview);
    const pdfButtonText = () => {
        if (isGeneratingPdf) return 'Generating...';
        if (audit.status === AuditStatus.Approved) return 'Download PDF Report';
        if (user.userRole === UserRole.Supplier) return 'Preview PDF Report';
        return 'Download PDF Report';
    }


    return (
        <div>
            <button onClick={onBack} className="text-sm text-green-600 hover:underline mb-4">&larr; Back to Dashboard</button>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{audit.auditTitle}</h2>
                        <p className="text-gray-500">For: <span className="font-semibold">{supplier.companyName}</span></p>
                        <p className="text-gray-500">From: <span className="font-semibold">{buyer.companyName}</span></p>
                    </div>
                     <div className="flex flex-col sm:flex-row items-end space-y-2 sm:space-y-0 sm:space-x-2">
                        {user.userRole === UserRole.Buyer && audit.status === AuditStatus.Pending && (
                            <button onClick={() => setIsAddItemsModalOpen(true)} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                                Add Items to Audit
                            </button>
                        )}
                        {showPdfButton && (
                            <button onClick={handlePdfGeneration} disabled={isGeneratingPdf} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center disabled:bg-blue-300">
                               {pdfButtonText()}
                            </button>
                        )}
                    </div>
                </div>
                 <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-medium text-green-700">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-6">
                {groupedAuditItems.map(({template, items}) => (
                    template && <div key={template.id}>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">{template.templateName}</h3>
                        <div className="space-y-3">
                            {items.map(item => {
                                    const templateItem = templateItems.find(ti => ti.id === item.templateItemId);
                                    return <AuditItemCard key={item.id} item={item} templateItem={templateItem} user={user} onUpdate={handleUpdate} isSupplierCustom={false} />;
                                })}
                        </div>
                    </div>
                ))}
                
                {buyerCustomItems.length > 0 && (
                     <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Other Requirements</h3>
                        <div className="space-y-3">
                            {buyerCustomItems.map(item => (
                                <AuditItemCard key={item.id} item={item} user={user} onUpdate={handleUpdate} isSupplierCustom={false} />
                            ))}
                        </div>
                    </div>
                )}
                
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Supplier Added Evidence</h3>
                    <div className="space-y-3">
                        {customItems.map(item => (
                             <AuditItemCard key={item.id} item={item} user={user} onUpdate={handleUpdate} isSupplierCustom={true} />
                        ))}
                        {user.userRole === UserRole.Supplier && audit.status !== AuditStatus.Approved && <AddCustomItem auditId={auditId} onUpdate={handleUpdate} />}
                    </div>
                </div>
                 {canSubmitForReview && (
                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={() => api.submitAuditForReview(auditId).then(handleUpdate)} 
                            className="bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700"
                        >
                            Submit All Items for Final Review
                        </button>
                    </div>
                )}
            </div>
            {isAddItemsModalOpen && audit && (
                <AddItemsToAuditModal
                    audit={audit}
                    existingAuditItems={auditItems}
                    onClose={() => setIsAddItemsModalOpen(false)}
                    onItemsAdded={handleItemsAdded}
                />
            )}
        </div>
    );
};

export default AuditDetailPage;