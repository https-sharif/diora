export interface PromotionRequest {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    username: string;
    avatar?: string;
  };
  businessName: string;
  businessDescription: string;
  businessType: string;
  yearsInBusiness?: string;
  expectedProducts?: string;
  additionalInfo?: string;
  proofDocuments: {
    filename: string;
    originalName: string;
    path: string;
    mimetype: string;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  reviewComments?: string;
  createdAt: string;
  updatedAt: string;
}
