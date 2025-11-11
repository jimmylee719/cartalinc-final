
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Audit, Profile, TemplateItem, ChecklistTemplate, AuditItem, SupplierCustomItem, AuditItemStatus, AuditStatus } from '../types';

interface PdfData {
    audit: Audit;
    buyer: Profile;
    supplier: Profile;
    templates: ChecklistTemplate[];
    templateItems: TemplateItem[];
    auditItems: AuditItem[];
    customItems: SupplierCustomItem[];
}

export const generateCertificatePDF = async (data: PdfData, isPreview: boolean = false): Promise<void> => {
  const { audit, buyer, supplier, templates, templateItems, auditItems, customItems } = data;

  // Helper Functions
  const getTemplateItem = (itemId: string, allTemplateItems: TemplateItem[]): TemplateItem | undefined => {
      return allTemplateItems.find(ti => ti.id === itemId);
  };

  const documentSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline-block text-gray-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>`;

  const renderEvidenceTextAndDocs = (item: AuditItem | SupplierCustomItem) => {
      let filesContent = '';
      let textContent = '';

      if (item.supplierEvidenceText) {
          textContent += `<p class="text-xs mt-1 italic bg-gray-50 p-2 rounded text-black whitespace-pre-wrap">"${item.supplierEvidenceText}"</p>`;
      }

      const otherFiles = (item.evidenceFiles || []).filter(file => !/\.(jpe?g|png|gif|webp)$/i.test(file.name));
      
      if (otherFiles.length > 0) {
          filesContent += `<ul class="list-none text-xs mt-2 space-y-1">`;
          otherFiles.forEach(file => {
              filesContent += `<li class="text-black flex items-center bg-gray-100 p-1 rounded">${documentSvg} ${file.name}</li>`;
          });
          filesContent += `</ul>`;
      }

      if (!filesContent && !textContent) {
          return `<p class="text-xs text-gray-500 italic">No text or document evidence provided.</p>`;
      }
      
      return `${textContent}${filesContent}`;
  };
  
  const renderImageEvidence = (file: { url: string; name: string }) => {
    return `
      <div class="mt-2 border p-1 rounded bg-gray-50">
          <img src="${file.url}" class="w-full max-h-[800px] h-auto object-contain" style="display: block;"/>
      </div>
    `;
  };

  const renderItemHeader = (item: AuditItem | SupplierCustomItem) => {
    let itemTitle, basisText, statusText, statusClass;

    if ('templateItemId' in item && item.templateItemId) {
        const templateItem = getTemplateItem(item.templateItemId!, templateItems)!;
        itemTitle = templateItem.itemTitle;
        basisText = templateItem.basis || 'N/A';
    } else {
        itemTitle = item.itemTitle || 'Custom Item';
        basisText = 'Custom Supplier Item';
    }

    const statusDisplayMap: Record<AuditItemStatus, { text: string; bg: string }> = {
        [AuditItemStatus.Approved]: { text: 'Approved', bg: 'bg-green-600' },
        [AuditItemStatus.Rejected]: { text: 'Rejected', bg: 'bg-red-600' },
        [AuditItemStatus.PendingReview]: { text: 'Pending Review', bg: 'bg-yellow-500' },
        [AuditItemStatus.PendingUpload]: { text: 'Pending Upload', bg: 'bg-gray-400' },
    };
    
    const statusInfo = statusDisplayMap[item.status];
    if (isPreview) {
        statusText = statusInfo ? statusInfo.text : 'Unknown';
        statusClass = statusInfo ? statusInfo.bg : 'bg-gray-400';
    } else {
        statusText = 'Approved';
        statusClass = 'bg-green-600';
    }
    
    return `
        <div class="flex justify-between items-start mb-3">
            <div>
                <h3 class="text-xl font-bold text-gray-800">${itemTitle}</h3>
                <h5 class="text-sm text-gray-500">Source: ${basisText}</h5>
            </div>
            <span class="${statusClass} text-white text-xs font-bold px-3 py-1 rounded-full">${statusText}</span>
        </div>
    `;
  };


  // --- HTML Content Generation ---
  const approvalDateText = audit.approvalDate 
      ? new Date(audit.approvalDate).toLocaleDateString() 
      : (isPreview ? 'Pending Approval' : 'N/A');

  const coverPageHtml = `
    <div class="page h-[1123px] relative flex flex-col p-10 border-4 border-gray-700 bg-white">
      <div class="text-left"><h1 class="text-3xl font-bold text-green-700">CartaLinc</h1></div>
      <div class="flex-grow flex flex-col justify-center items-center text-center pb-12">
        <h2 class="text-5xl font-bold text-gray-800 mb-6">Supply Chain Compliance<br/>Audit Report</h2>
        <p class="text-base text-gray-600 max-w-2xl mx-auto mb-12">
          This document certifies that ${supplier.companyName} has successfully met the compliance standards required by ${buyer.companyName} for the audit "${audit.auditTitle}". All evidence has been reviewed and approved by the auditor.
        </p>
        <div class="grid grid-cols-2 gap-8 w-full max-w-3xl text-left text-sm">
          <div class="border-t-2 border-gray-300 pt-4">
            <h3 class="font-bold text-gray-500 mb-2 uppercase tracking-wider">Auditing Party (Buyer)</h3>
            <p><strong>Company:</strong> ${buyer.companyName}</p><p><strong>Contact:</strong> ${buyer.contactName}</p><p><strong>Phone:</strong> ${buyer.contactPhone}</p><p><strong>Email:</strong> ${buyer.contactEmail}</p>
          </div>
          <div class="border-t-2 border-gray-300 pt-4">
            <h3 class="font-bold text-gray-500 mb-2 uppercase tracking-wider">Audited Party (Supplier)</h3>
            <p><strong>Company:</strong> ${supplier.companyName}</p><p><strong>Contact:</strong> ${supplier.contactName}</p><p><strong>Phone:</strong> ${supplier.contactPhone}</p><p><strong>Email:</strong> ${supplier.contactEmail}</p>
          </div>
        </div>
      </div>
      <div class="text-center text-xs text-gray-500 border-t pt-4">
        <strong>Audit Title:</strong> ${audit.auditTitle} | <strong>Approval Date:</strong> ${approvalDateText} | <strong>Report ID:</strong> ${audit.id}
      </div>
    </div>`;

  const allItemGroups = [
    ...audit.templateIds.map(tid => ({
        title: `Details: ${templates.find(t => t.id === tid)?.templateName || 'Unknown Template'}`,
        items: auditItems.filter(ai => templateItems.find(ti => ti.id === ai.templateItemId)?.templateId === tid)
    })),
    { title: 'Other Requirements (Buyer-defined)', items: auditItems.filter(ai => !ai.templateItemId) },
    { title: 'Supplier-Added Evidence', items: customItems }
  ].filter(group => group.items.length > 0);
  
  // Summary Page HTML
  const checkmarkSvg = `<svg class="w-5 h-5 text-green-600 inline-block mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>`;

  let summaryItemsHtml = '';
    allItemGroups.forEach(group => {
        summaryItemsHtml += `<h3 class="text-xl font-bold text-gray-800 mt-6 mb-3 border-b pb-2">${group.title}</h3>`;
        summaryItemsHtml += `<ul class="space-y-4">`;
        group.items.forEach(item => {
            let itemTitle, itemPurpose;
            if ('templateItemId' in item && item.templateItemId) {
                const templateItem = getTemplateItem(item.templateItemId, templateItems);
                itemTitle = templateItem?.itemTitle || 'Unknown Item';
                itemPurpose = templateItem?.itemHelpText.buyer || 'No purpose description available.';
            } else {
                itemTitle = item.itemTitle || 'Custom Item';
                itemPurpose = 'Custom evidence provided by the supplier to support the audit.';
            }

            summaryItemsHtml += `
                <li class="flex items-start">
                    ${checkmarkSvg}
                    <div>
                        <p class="font-semibold text-gray-900">${itemTitle}</p>
                        <p class="text-sm text-gray-600 mt-1">${itemPurpose}</p>
                    </div>
                </li>
            `;
        });
        summaryItemsHtml += `</ul>`;
    });

  const summaryPageHtml = `
  <div class="page p-10 bg-white">
      <h2 class="text-3xl font-bold text-gray-800 border-b-2 border-gray-200 pb-4">Audit Summary</h2>
      <p class="text-gray-600 mt-4">The following compliance items have been successfully verified for ${supplier.companyName}.</p>
      <div class="mt-4 overflow-y-auto" style="height: 950px;">
        ${summaryItemsHtml}
      </div>
  </div>`;
  
  let finalPageHtml = '';
  if (!isPreview && audit.status === AuditStatus.Approved && audit.approvalDate) {
    finalPageHtml = `
    <div class="page h-[1123px] relative flex flex-col p-10 justify-center items-center text-center bg-gray-50 pb-20">
      <svg class="w-32 h-32 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      <h1 class="text-7xl font-bold text-green-600 mt-4" style="font-size: 6rem; line-height: 1; margin-top: 1rem;">VERIFIED</h1>
      <h3 class="text-xl text-gray-700 mt-6">Date of Final Approval: ${new Date(audit.approvalDate).toLocaleDateString()}</h3>
      <div class="absolute bottom-10 left-0 right-0 text-center text-lg text-black font-semibold" style="font-size: 1.25rem; line-height: 1.75rem;">
        <p>Report ID: ${audit.id}</p>
        <p class="mt-1">Powered by CartaLinc</p>
      </div>
    </div>`;
  }
  
  // --- PDF Generation ---
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: [800, 1123],
    putOnlyUsedFonts: true,
    compress: true,
  });

  const tempElement = document.createElement('div');
  tempElement.className = 'w-[800px] bg-white font-sans text-gray-800';
  tempElement.style.position = 'fixed';
  tempElement.style.top = '-9999px';
  tempElement.style.left = '0';
  document.body.appendChild(tempElement);
  
  const addPageToPdf = async (htmlContent: string, pageNumber: number | null) => {
      tempElement.innerHTML = `<div class="w-[800px] h-[1123px] bg-white flex flex-col">${htmlContent}</div>`;
      const canvas = await html2canvas(tempElement.firstElementChild as HTMLElement, { scale: 2, useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      doc.addImage(imgData, 'JPEG', 0, 0, 800, 1123);
      if (pageNumber) {
          doc.setFontSize(10);
          doc.setTextColor(128, 128, 128);
          doc.text(`Page ${pageNumber}`, 750, 1100);
      }
  };
  
  // 1. Cover Page
  tempElement.innerHTML = coverPageHtml;
  const coverCanvas = await html2canvas(tempElement.firstElementChild as HTMLElement, { scale: 2, useCORS: true, allowTaint: true });
  const coverImgData = coverCanvas.toDataURL('image/jpeg', 0.8);
  doc.addImage(coverImgData, 'JPEG', 0, 0, 800, 1123);
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Page 1`, 750, 1100);

  // 2. Summary Page
  doc.addPage();
  await addPageToPdf(summaryPageHtml, 2);

  // 3. Detail Pages
  let pageNumber = 3;
    if (allItemGroups.length > 0) {
        for (const group of allItemGroups) {
            for (const item of group.items) {
                const itemHeaderHtml = renderItemHeader(item);
                const evidenceTextAndDocsHtml = renderEvidenceTextAndDocs(item);
                const images = (item.evidenceFiles || []).filter(file => /\.(jpe?g|png|gif|webp)$/i.test(file.name));
                const hasTextOrDocEvidence = item.supplierEvidenceText || (item.evidenceFiles || []).some(file => !/\.(jpe?g|png|gif|webp)$/i.test(file.name));

                if (images.length === 0) {
                    if (hasTextOrDocEvidence) {
                        const mainContentHtml = `
                            <div class="p-10 bg-white">
                                <div class="flex justify-between items-center border-b-2 border-gray-200 pb-2 mb-6">
                                    <h2 class="text-2xl font-bold">${group.title}</h2>
                                </div>
                                ${itemHeaderHtml}
                                <div class="pl-4 border-l-2 border-gray-200 ml-1">
                                    <h4 class="text-base font-semibold text-gray-700 mb-2">Evidence Submitted</h4>
                                    ${evidenceTextAndDocsHtml}
                                </div>
                            </div>
                        `;
                        doc.addPage();
                        await addPageToPdf(mainContentHtml, pageNumber);
                        pageNumber++;
                    }
                } else {
                    for (const imageFile of images) {
                        const imagePageHtml = `
                            <div class="p-10 bg-white">
                                <div class="flex justify-between items-center border-b-2 border-gray-200 pb-2 mb-6">
                                    <h2 class="text-2xl font-bold">${group.title}</h2>
                                </div>
                                ${itemHeaderHtml}
                                <div class="pl-4 border-l-2 border-gray-200 ml-1">
                                    <h4 class="text-base font-semibold text-gray-700 mb-2">Evidence Submitted</h4>
                                    ${evidenceTextAndDocsHtml}
                                    <hr class="my-4"/>
                                    <h4 class="text-base font-semibold text-gray-700 mb-2">Attached File: ${imageFile.name}</h4>
                                    ${renderImageEvidence(imageFile)}
                                </div>
                            </div>
                        `;
                        doc.addPage();
                        await addPageToPdf(imagePageHtml, pageNumber);
                        pageNumber++;
                    }
                }
            }
        }
    }

  // 4. Final Page
  if (finalPageHtml) {
      doc.addPage();
      await addPageToPdf(finalPageHtml, null);
  }

  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `CartaLinc_Report_${supplier.companyName.replace(/ /g, '_')}_${audit.approvalDate || 'DRAFT'}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);

  document.body.removeChild(tempElement);
};
