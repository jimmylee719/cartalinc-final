import { Profile, Audit, ChecklistTemplate, TemplateItem, AuditItem, UserRole, AuditItemStatus, SupplierCustomItem, ItemComment, AuditStatus, Connection } from '../types';
import { PROFILES as MOCK_PROFILES, TEMPLATES, TEMPLATE_ITEMS, AUDITS, AUDIT_ITEMS, SUPPLIER_CUSTOM_ITEMS, ITEM_COMMENTS, CONNECTIONS } from '../data/mockData';

const SIMULATED_DELAY = 500;

// Use a mutable in-memory store to simulate database changes
let profilesStore = [...MOCK_PROFILES];
let auditsStore = [...AUDITS];
let auditItemsStore = [...AUDIT_ITEMS];
let customItemsStore = [...SUPPLIER_CUSTOM_ITEMS];
let commentsStore = [...ITEM_COMMENTS];
let connectionsStore = [...CONNECTIONS];


const api = {
  loginByEmail: async (email: string, role: UserRole): Promise<Profile | undefined> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const user = profilesStore.find(p => p.contactEmail.toLowerCase() === email.toLowerCase() && p.userRole === role);
            resolve(user);
        }, SIMULATED_DELAY);
    });
  },
  
  getProfileById: async (userId: string): Promise<Profile | undefined> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const user = profilesStore.find(p => p.id === userId);
        resolve(user);
      }, SIMULATED_DELAY);
    });
  },

  updateProfile: async (userId: string, data: Partial<Profile>): Promise<Profile | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const profileIndex = profilesStore.findIndex(p => p.id === userId);
            if (profileIndex > -1) {
                profilesStore[profileIndex] = { ...profilesStore[profileIndex], ...data };
                resolve(profilesStore[profileIndex]);
            } else {
                resolve(undefined);
            }
        }, SIMULATED_DELAY);
    });
  },

  register: async (userData: Omit<Profile, 'id' | 'uniqueCode' | 'companyPhotoUrl'>): Promise<Profile> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newUser: Profile = {
                ...userData,
                id: `user_${userData.companyName.toLowerCase().replace(/\s/g, '_')}_${Date.now()}`,
                uniqueCode: `${userData.companyName.substring(0, 4).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
                companyPhotoUrl: 'default_cat_avatar',
            };
            profilesStore.push(newUser);
            resolve(newUser);
        }, SIMULATED_DELAY);
    });
  },
  
  addConnectionByCode: async (initiatorId: string, targetUniqueCode: string): Promise<Connection> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const initiator = profilesStore.find(p => p.id === initiatorId);
            const target = profilesStore.find(p => p.uniqueCode.toLowerCase() === targetUniqueCode.toLowerCase());

            if (!initiator || !target) {
                return reject(new Error("User with that code not found."));
            }
            if (initiator.userRole === target.userRole) {
                return reject(new Error("Cannot connect with a user of the same role."));
            }
            if (initiator.id === target.id) {
                return reject(new Error("Cannot connect with yourself."));
            }
            
            const existingConnection = connectionsStore.find(c => 
                (c.buyerProfileId === initiator.id && c.supplierProfileId === target.id) ||
                (c.buyerProfileId === target.id && c.supplierProfileId === initiator.id)
            );
            
            if (existingConnection) {
                 return reject(new Error("A connection or request already exists with this user."));
            }
            
            const buyerId = initiator.userRole === UserRole.Buyer ? initiator.id : target.id;
            const supplierId = initiator.userRole === UserRole.Supplier ? initiator.id : target.id;

            const newConnection: Connection = {
                id: `conn_${Date.now()}`,
                buyerProfileId: buyerId,
                supplierProfileId: supplierId,
                status: 'pending',
                initiatorId: initiatorId,
            };
            connectionsStore.push(newConnection);
            resolve(newConnection);
        }, SIMULATED_DELAY);
    });
  },

  getConnectionsForUser: async (userId: string): Promise<{connection: Connection, profile: Profile, isInitiator: boolean}[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = profilesStore.find(p => p.id === userId);
            if (!user) return resolve([]);

            const userConnections = connectionsStore.filter(c => c.buyerProfileId === userId || c.supplierProfileId === userId);
            
            const connectionsWithProfiles = userConnections.map(c => {
                const otherUserId = c.buyerProfileId === userId ? c.supplierProfileId : c.buyerProfileId;
                const profile = profilesStore.find(p => p.id === otherUserId);
                const isInitiator = c.initiatorId === userId;
                return { connection: c, profile: profile!, isInitiator };
            }).filter(item => item.profile);
            
            resolve(connectionsWithProfiles);
        }, SIMULATED_DELAY);
    });
  },

  updateConnectionStatus: async (connectionId: string, status: 'active' | 'rejected'): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const connectionIndex = connectionsStore.findIndex(c => c.id === connectionId);
            if (connectionIndex > -1) {
                if (status === 'rejected') {
                    connectionsStore.splice(connectionIndex, 1);
                } else {
                    connectionsStore[connectionIndex].status = status;
                }
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
  },

  getAuditsForUser: async (userId: string, role: UserRole): Promise<Audit[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const userAudits = auditsStore.filter(audit => 
          role === UserRole.Buyer ? audit.buyerId === userId : audit.supplierId === userId
        );
        resolve(JSON.parse(JSON.stringify(userAudits)));
      }, SIMULATED_DELAY);
    });
  },
  
  getConnectedSuppliers: async (buyerId: string): Promise<Profile[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const supplierIds = connectionsStore
            .filter(c => c.buyerProfileId === buyerId && c.status === 'active')
            .map(c => c.supplierProfileId);
        const suppliers = profilesStore.filter(p => supplierIds.includes(p.id));
        resolve(suppliers);
      }, SIMULATED_DELAY);
    });
  },
  
  createAudit: async(data: {buyerId: string; supplierId: string; auditTitle: string; templateIds: string[]; dueDate: string; customItems: { title: string; helpTextSupplier: string; helpTextBuyer: string }[] }): Promise<Audit> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newAudit: Audit = {
                id: `audit_${Date.now()}`,
                status: AuditStatus.Pending,
                buyerId: data.buyerId,
                supplierId: data.supplierId,
                auditTitle: data.auditTitle,
                templateIds: data.templateIds,
                dueDate: data.dueDate,
            };
            auditsStore.push(newAudit);

            const newItems: AuditItem[] = [];
            
            data.templateIds.forEach(templateId => {
                TEMPLATE_ITEMS.filter(item => item.templateId === templateId).forEach(templateItem => {
                    newItems.push({
                        id: `audit_item_${Date.now()}_${templateItem.id}`,
                        auditId: newAudit.id,
                        templateItemId: templateItem.id,
                        status: AuditItemStatus.PendingUpload,
                    });
                });
            });

            data.customItems.forEach((customItem, index) => {
              newItems.push({
                  id: `audit_item_custom_${Date.now()}_${index}`,
                  auditId: newAudit.id,
                  itemTitle: customItem.title,
                  itemHelpText: {
                      supplier: customItem.helpTextSupplier,
                      buyer: customItem.helpTextBuyer
                  },
                  status: AuditItemStatus.PendingUpload,
              });
            });

            auditItemsStore.push(...newItems);

            resolve(newAudit);
        }, SIMULATED_DELAY);
    });
  },

  getAuditDetails: async (auditId: string): Promise<{ audit: Audit; buyer: Profile; supplier: Profile; } | undefined> => {
     return new Promise(resolve => {
      setTimeout(() => {
        const audit = auditsStore.find(a => a.id === auditId);
        if (!audit) {
          resolve(undefined);
          return;
        }
        const buyer = profilesStore.find(p => p.id === audit.buyerId);
        const supplier = profilesStore.find(p => p.id === audit.supplierId);
        if (!buyer || !supplier) {
            const placeholderBuyer = { id: audit.buyerId, companyName: 'Unknown Buyer', contactName: 'Unknown', fullName: 'Unknown', companyPhotoUrl: '', userRole: UserRole.Buyer, uniqueCode: '', contactPhone: '', contactEmail: '' };
            const placeholderSupplier = { id: audit.supplierId, companyName: 'Unknown Supplier', contactName: 'Unknown', fullName: 'Unknown', companyPhotoUrl: '', userRole: UserRole.Supplier, uniqueCode: '', contactPhone: '', contactEmail: '' };
            resolve({ audit: JSON.parse(JSON.stringify(audit)), buyer: buyer || placeholderBuyer, supplier: supplier || placeholderSupplier });
            return;
        }
        resolve({ audit: JSON.parse(JSON.stringify(audit)), buyer, supplier });
      }, SIMULATED_DELAY);
    });
  },

  getAuditItemsForAudit: async (auditId: string): Promise<AuditItem[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const items = auditItemsStore.filter(item => item.auditId === auditId);
        resolve(JSON.parse(JSON.stringify(items)));
      }, SIMULATED_DELAY);
    });
  },
  
  getTemplates: async (): Promise<ChecklistTemplate[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(TEMPLATES), SIMULATED_DELAY/2);
    });
  },

  getTemplateItems: async (): Promise<TemplateItem[]> => {
     return new Promise(resolve => {
        setTimeout(() => resolve(TEMPLATE_ITEMS), SIMULATED_DELAY/2);
    });
  },

  getCustomItemsForAudit: async (auditId: string): Promise<SupplierCustomItem[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const items = customItemsStore.filter(item => item.auditId === auditId);
        resolve(JSON.parse(JSON.stringify(items)));
      }, SIMULATED_DELAY);
    });
  },
  
  getCommentsForItem: async (itemId: string, isCustom: boolean): Promise<ItemComment[]> => {
      return new Promise(resolve => {
          setTimeout(() => {
              const comments = commentsStore.filter(c => isCustom ? c.customItemId === itemId : c.auditItemId === itemId);
              resolve(JSON.parse(JSON.stringify(comments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()))));
          }, SIMULATED_DELAY / 2);
      });
  },

  addComment: async (itemId: string, isCustom: boolean, userId: string, commentText: string): Promise<ItemComment> => {
      return new Promise(resolve => {
          setTimeout(() => {
              const newComment: ItemComment = {
                  id: `comment_${Date.now()}`,
                  auditItemId: isCustom ? undefined : itemId,
                  customItemId: isCustom ? itemId : undefined,
                  userId,
                  commentText,
                  timestamp: new Date().toISOString()
              };
              commentsStore.push(newComment);
              resolve(newComment);
          }, SIMULATED_DELAY);
      });
  },
  
  updateAuditItemStatus: async (itemId: string, isCustom: boolean, status: AuditItemStatus): Promise<boolean> => {
      return new Promise(resolve => {
          setTimeout(() => {
              const store = isCustom ? customItemsStore : auditItemsStore;
              const item = store.find(i => i.id === itemId);
              if (item) {
                  item.status = status;
                  resolve(true);
              } else {
                  resolve(false);
              }
          }, SIMULATED_DELAY);
      });
  },
  
  submitEvidence: async (itemId: string, isCustom: boolean, submission: { files?: File[] | null; notes: string; evidenceText: string }): Promise<boolean> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const store = isCustom ? customItemsStore : auditItemsStore;
        const item = store.find(i => i.id === itemId);
        if (item) {
          if (submission.files && submission.files.length > 0) {
            const newEvidenceFiles = submission.files.map(file => ({
                url: URL.createObjectURL(file), // Simulate upload
                name: file.name,
            }));
            
            if (!item.evidenceFiles) item.evidenceFiles = [];
            item.evidenceFiles.push(...newEvidenceFiles); // Append new files
          }
          
          item.supplierEvidenceText = submission.evidenceText;
          item.supplierNotes = submission.notes;
          item.status = AuditItemStatus.PendingReview;
          resolve(true);
        } else {
          resolve(false)
        }
      }, SIMULATED_DELAY * 2); // Longer delay for "upload"
    });
  },

  addCustomItem: async (auditId: string, title: string, files: File[], notes: string): Promise<SupplierCustomItem> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newEvidenceFiles = files.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name,
        }));

        const newItem: SupplierCustomItem = {
          id: `custom_${Date.now()}`,
          auditId,
          itemTitle: title,
          evidenceFiles: newEvidenceFiles,
          supplierNotes: notes,
          status: AuditItemStatus.PendingReview,
        };
        customItemsStore.push(newItem);
        resolve(newItem);
      }, SIMULATED_DELAY * 2);
    })
  },
  
  addItemsToAudit: async (auditId: string, data: { templateIds: string[]; customItems: { title: string; helpTextSupplier: string; helpTextBuyer: string }[] }): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const audit = auditsStore.find(a => a.id === auditId);
            if (!audit || audit.status !== AuditStatus.Pending) {
                resolve(false);
                return;
            }

            const existingTemplateIds = new Set(audit.templateIds);
            const newItems: AuditItem[] = [];

            // Add items from new templates
            data.templateIds.forEach(templateId => {
                if (!existingTemplateIds.has(templateId)) {
                    audit.templateIds.push(templateId); // Update audit's templates
                }
                TEMPLATE_ITEMS.filter(item => item.templateId === templateId).forEach(templateItem => {
                    // Check if item already exists in audit
                    const itemExists = auditItemsStore.some(ai => ai.auditId === auditId && ai.templateItemId === templateItem.id);
                    if (!itemExists) {
                        newItems.push({
                            id: `audit_item_${Date.now()}_${templateItem.id}`,
                            auditId: auditId,
                            templateItemId: templateItem.id,
                            status: AuditItemStatus.PendingUpload,
                        });
                    }
                });
            });

            // Add new custom items
            data.customItems.forEach((customItem, index) => {
              newItems.push({
                  id: `audit_item_custom_added_${Date.now()}_${index}`,
                  auditId: auditId,
                  itemTitle: customItem.title,
                  itemHelpText: {
                      supplier: customItem.helpTextSupplier,
                      buyer: customItem.helpTextBuyer
                  },
                  status: AuditItemStatus.PendingUpload,
              });
            });

            auditItemsStore.push(...newItems);
            resolve(true);
        }, SIMULATED_DELAY);
    });
  },

  submitAuditForReview: async (auditId: string): Promise<boolean> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const audit = auditsStore.find(a => a.id === auditId);
        if (audit) {
          audit.status = AuditStatus.InReview;
          resolve(true);
        } else {
          resolve(false);
        }
      }, SIMULATED_DELAY);
    })
  },

  checkAndFinalizeAudit: async (auditId: string): Promise<boolean> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const audit = auditsStore.find(a => a.id === auditId);
        if (!audit) return resolve(false);

        const items = auditItemsStore.filter(i => i.auditId === auditId);
        const customItems = customItemsStore.filter(i => i.auditId === auditId);

        const allItems = [...items, ...customItems];
        const allApproved = allItems.every(i => i.status === AuditItemStatus.Approved);

        if (allApproved && allItems.length > 0) {
          audit.status = AuditStatus.Approved;
          audit.approvalDate = new Date().toISOString().split('T')[0];
          resolve(true);
        } else {
          resolve(false);
        }
      }, SIMULATED_DELAY / 2);
    });
  }

};

export default api;