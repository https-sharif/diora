export interface Report {
  _id: string;
  reporter: {
    _id: string;
    username: string;
    displayName: string;
    profilePicture?: string;
    email?: string;
  };
  // Backend structure
  reportedItem?: {
    itemType: 'user' | 'post' | 'product' | 'shop';
    itemId: string;
  };
  type?: string; // Backend field name
  // Frontend-compatible fields (mapped from backend)
  itemType: 'user' | 'post' | 'product' | 'shop';
  reason: string; // Mapped from backend 'type' field
  description?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  adminNotes?: string;
  reviewedBy?: {
    _id: string;
    username: string;
    displayName: string;
  };
  reviewedAt?: string;
  actionTaken?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields based on itemType
  reportedUser?: {
    _id: string;
    displayName: string;
    username: string;
    profilePicture?: string;
    email?: string;
    bio?: string;
  };
  reportedPost?: {
    _id: string;
    title: string;
    content: string;
    images?: string[];
    user: {
      _id: string;
      displayName: string;
      username: string;
      profilePicture?: string;
    };
  };
  reportedProduct?: {
    _id: string;
    name: string;
    description: string;
    price: number;
    images?: string[];
    shop: {
      _id: string;
      name: string;
      description?: string;
    };
  };
  reportedShop?: {
    _id: string;
    name: string;
    displayName: string;
    username: string;
    profilePicture?: string;
    email?: string;
    bio?: string;
    type: string;
  };
}

export interface ReportStats {
  pending: number;
  underReview: number;
  resolved: number;
  dismissed: number;
  urgent: number;
  high: number;
  last24Hours: number;
  byType: { _id: string; count: number }[];
}