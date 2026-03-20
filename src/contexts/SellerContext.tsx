import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ============= TYPES =============
export interface Seller {
  id: string;
  authUserId?: string; // Link to AuthContext user
  email: string;
  password: string;
  shopName: string;
  phone: string;
  address: string;
  warehouseAddress?: string;
  status: 'pending' | 'approved' | 'suspended';
  createdAt: string;
  approvedAt?: string;
  suspendedAt?: string;
  description?: string;
  logo?: string;
  banner?: string;
  businessLicense?: string;
  taxCode?: string;
}

export interface SellerProduct {
  id: string;
  sellerId: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  stock: number;
  image: string;
  gallery: string[];
  description: string;
  careLevel: 'Dễ' | 'Trung bình' | 'Khó';
  light: string;
  water: string;
  humidity: string;
  temperature: string;
  location?: string;
  benefits?: string;
  sold: number;
  rating: number;
  reviews: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface SubOrder {
  id: string;
  orderId: string; // Parent order ID
  sellerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  note?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerReview {
  id: string;
  sellerId: string;
  productId: string;
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface SellerVoucher {
  id: string;
  sellerId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sellerId: string;
  customerId: string;
  customerName: string;
  senderId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ChatConversation {
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface AuditLog {
  id: string;
  sellerId: string;
  action: string;
  details: string;
  performedBy: 'seller' | 'admin';
  performedByName: string;
  createdAt: string;
}

// ============= CONTEXT TYPE =============
interface SellerContextType {
  // Auth
  currentSeller: Seller | null;
  isSellerLoggedIn: boolean;
  loginSeller: (email: string, password: string) => { success: boolean; error?: string };
  loginSellerByUserId: (userId: string) => { success: boolean; error?: string };
  registerSeller: (data: Omit<Seller, 'id' | 'status' | 'createdAt'>) => { success: boolean; error?: string };
  createSellerFromAuth: (userId: string, shopName: string, email: string, phone: string) => { success: boolean; sellerId?: string };
  logoutSeller: () => void;
  updateSellerProfile: (updates: Partial<Seller>) => void;

  // Products
  sellerProducts: SellerProduct[];
  addProduct: (product: Omit<SellerProduct, 'id' | 'sellerId' | 'sold' | 'rating' | 'reviews' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<SellerProduct>) => void;
  deleteProduct: (id: string) => void;

  // Orders
  sellerOrders: SubOrder[];
  addSubOrder: (order: Omit<SubOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (orderId: string, status: SubOrder['status'], trackingNumber?: string) => void;

  // Reviews
  sellerReviews: SellerReview[];
  replyToReview: (reviewId: string, reply: string) => void;

  // Vouchers
  sellerVouchers: SellerVoucher[];
  addVoucher: (voucher: Omit<SellerVoucher, 'id' | 'sellerId' | 'usedCount' | 'createdAt'>) => void;
  updateVoucher: (id: string, updates: Partial<SellerVoucher>) => void;
  deleteVoucher: (id: string) => void;

  // Chat
  chatMessages: ChatMessage[];
  chatConversations: ChatConversation[];
  sendMessage: (customerId: string, customerName: string, message: string) => void;
  markMessagesAsRead: (customerId: string) => void;

  // Stats
  getSellerStats: () => {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalProducts: number;
    averageRating: number;
  };

  // Admin functions
  allSellers: Seller[];
  allSellerProducts: SellerProduct[];
  allSubOrders: SubOrder[];
  auditLogs: AuditLog[];
  approveSeller: (sellerId: string) => void;
  suspendSeller: (sellerId: string, reason: string) => void;
  unsuspendSeller: (sellerId: string) => void;
  getSellerById: (sellerId: string) => Seller | undefined;
  getProductsBySeller: (sellerId: string) => SellerProduct[];
  getOrdersBySeller: (sellerId: string) => SubOrder[];
}

const SellerContext = createContext<SellerContextType | undefined>(undefined);

// ============= INITIAL DATA =============
const createInitialProducts = (sellers: Seller[]): SellerProduct[] => {
  return [];
};

const createInitialSellers = (): Seller[] => [];

// ============= SUB-ORDERS =============
// Khởi tạo rỗng — đơn seller chỉ từ Checkout, lưu localStorage để thống kê admin khớp với data đơn hàng
const createInitialSubOrders = (): SubOrder[] => [];

// ============= PROVIDER =============
export const SellerProvider = ({ children }: { children: ReactNode }) => {
  // Wipe all mock data once to ensure a clean slate for the user
  useState(() => {
    if (!localStorage.getItem('seller_data_wiped_v3')) {
      localStorage.removeItem('sellers');
      localStorage.removeItem('currentSeller');
      localStorage.removeItem('sellerProducts');
      localStorage.removeItem('subOrders');
      localStorage.removeItem('sellerReviews');
      localStorage.removeItem('sellerVouchers');
      localStorage.removeItem('sellerChatMessages');
      localStorage.removeItem('sellerAuditLogs');
      localStorage.setItem('seller_data_wiped_v3', 'true');
    }
  });

  // Sellers
  const [sellers, setSellers] = useState<Seller[]>(() => {
    const saved = localStorage.getItem('sellers');
    return saved ? JSON.parse(saved) : createInitialSellers();
  });

  const [currentSeller, setCurrentSeller] = useState<Seller | null>(() => {
    const saved = localStorage.getItem('currentSeller');
    return saved ? JSON.parse(saved) : null;
  });

  // Products
  const [products, setProducts] = useState<SellerProduct[]>(() => {
    const saved = localStorage.getItem('sellerProducts');
    return saved ? JSON.parse(saved) : createInitialProducts(sellers);
  });

  // Sync sold quantities from global sales-stats API
  useEffect(() => {
    const loadSalesStats = async () => {
      try {
        const response = await fetch("https://69bce6272bc2a25b22acb171.mockapi.io/api/v1/sales-stats");
        if (response.ok) {
          const data = await response.json();
          const salesStats = Array.isArray(data) ? data[0] : data;
          if (salesStats && salesStats.topProducts) {
            setProducts(prevProducts => prevProducts.map(p => {
              // Convert "sp_2" -> 10002 to match logic in Checkout
              const plantId = parseInt(p.id.replace('sp_', '')) + 10000;
              const stats = salesStats.topProducts.find((sp: any) => sp.productId === plantId);
              if (stats) {
                return { ...p, sold: stats.sold };
              }
              return p;
            }));
          }
        }
      } catch (error) {
        console.warn("Failed to load sales stats for seller products:", error);
      }
    };
    loadSalesStats();
  }, []);

  // SubOrders — load từ localStorage để thống kê seller khớp với data đơn hàng mỗi khi thay đổi
  const [subOrders, setSubOrders] = useState<SubOrder[]>(() => {
    const saved = localStorage.getItem('subOrders');
    return saved ? JSON.parse(saved) : createInitialSubOrders();
  });

  // Reviews
  const [reviews, setReviews] = useState<SellerReview[]>(() => {
    const saved = localStorage.getItem('sellerReviews');
    return saved ? JSON.parse(saved) : [];
  });

  // Vouchers
  const [vouchers, setVouchers] = useState<SellerVoucher[]>(() => {
    const saved = localStorage.getItem('sellerVouchers');
    return saved ? JSON.parse(saved) : [];
  });

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('sellerChatMessages');
    return saved ? JSON.parse(saved) : [];
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('sellerAuditLogs');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('sellers', JSON.stringify(sellers));
  }, [sellers]);

  useEffect(() => {
    localStorage.setItem('currentSeller', currentSeller ? JSON.stringify(currentSeller) : '');
  }, [currentSeller]);

  useEffect(() => {
    localStorage.setItem('sellerProducts', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('subOrders', JSON.stringify(subOrders));
  }, [subOrders]);

  useEffect(() => {
    localStorage.setItem('sellerReviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('sellerVouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem('sellerChatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('sellerAuditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Helper: Add audit log
  const addAuditLog = (sellerId: string, action: string, details: string, performedBy: 'seller' | 'admin', performedByName: string) => {
    const log: AuditLog = {
      id: Date.now().toString(),
      sellerId,
      action,
      details,
      performedBy,
      performedByName,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // ============= AUTH =============
  const loginSeller = (email: string, password: string) => {
    const seller = sellers.find(s => s.email.toLowerCase() === email.toLowerCase() && s.password === password);
    if (!seller) {
      return { success: false, error: 'Email hoặc mật khẩu không đúng.' };
    }
    if (seller.status === 'pending') {
      return { success: false, error: 'Tài khoản đang chờ duyệt. Vui lòng liên hệ Admin.' };
    }
    if (seller.status === 'suspended') {
      return { success: false, error: 'Tài khoản đã bị khóa. Vui lòng liên hệ Admin.' };
    }
    setCurrentSeller(seller);
    addAuditLog(seller.id, 'LOGIN', 'Đăng nhập thành công', 'seller', seller.shopName);
    return { success: true };
  };

  const registerSeller = (data: Omit<Seller, 'id' | 'status' | 'createdAt'>) => {
    if (sellers.some(s => s.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'Email đã được đăng ký.' };
    }
    const newSeller: Seller = {
      ...data,
      id: `seller_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setSellers(prev => [...prev, newSeller]);
    addAuditLog(newSeller.id, 'REGISTER', 'Đăng ký tài khoản seller mới', 'seller', newSeller.shopName);
    return { success: true };
  };

  // Create seller from AuthContext registration
  const createSellerFromAuth = (userId: string, shopName: string, email: string, phone: string) => {
    // Check if seller already exists with this authUserId
    if (sellers.some(s => s.authUserId === userId)) {
      return { success: false };
    }
    
    const newSeller: Seller = {
      id: `seller_${Date.now()}`,
      authUserId: userId,
      email: email.toLowerCase(),
      password: '', // No password needed - linked to auth user
      shopName,
      phone,
      address: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    setSellers(prev => [...prev, newSeller]);
    setCurrentSeller(newSeller);
    addAuditLog(newSeller.id, 'REGISTER_VIA_AUTH', 'Đăng ký seller từ tài khoản người dùng', 'seller', newSeller.shopName);
    return { success: true, sellerId: newSeller.id };
  };

  // Login seller by auth user ID (for linked accounts)
  const loginSellerByUserId = (userId: string) => {
    const seller = sellers.find(s => s.authUserId === userId);
    if (!seller) {
      return { success: false, error: 'Không tìm thấy tài khoản seller.' };
    }
    if (seller.status === 'pending') {
      // Still allow login but with limited access
      setCurrentSeller(seller);
      return { success: true };
    }
    if (seller.status === 'suspended') {
      return { success: false, error: 'Tài khoản đã bị khóa. Vui lòng liên hệ Admin.' };
    }
    setCurrentSeller(seller);
    addAuditLog(seller.id, 'LOGIN', 'Đăng nhập thành công', 'seller', seller.shopName);
    return { success: true };
  };

  const logoutSeller = () => {
    if (currentSeller) {
      addAuditLog(currentSeller.id, 'LOGOUT', 'Đăng xuất', 'seller', currentSeller.shopName);
    }
    setCurrentSeller(null);
    localStorage.removeItem('currentSeller');
  };

  const updateSellerProfile = (updates: Partial<Seller>) => {
    if (!currentSeller) return;
    const updated = { ...currentSeller, ...updates };
    setCurrentSeller(updated);
    setSellers(prev => prev.map(s => s.id === currentSeller.id ? updated : s));
    addAuditLog(currentSeller.id, 'UPDATE_PROFILE', 'Cập nhật thông tin shop', 'seller', currentSeller.shopName);
  };

  // ============= PRODUCTS =============
  const addProduct = (product: Omit<SellerProduct, 'id' | 'sellerId' | 'sold' | 'rating' | 'reviews' | 'createdAt' | 'updatedAt'>) => {
    if (!currentSeller) return;
    const newProduct: SellerProduct = {
      ...product,
      id: `sp_${Date.now()}`,
      sellerId: currentSeller.id,
      sold: 0,
      rating: 0,
      reviews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
    addAuditLog(currentSeller.id, 'ADD_PRODUCT', `Thêm sản phẩm: ${product.name}`, 'seller', currentSeller.shopName);
  };

  const updateProduct = (id: string, updates: Partial<SellerProduct>) => {
    if (!currentSeller) return;
    setProducts(prev => prev.map(p => {
      if (p.id === id && p.sellerId === currentSeller.id) {
        return { ...p, ...updates, updatedAt: new Date().toISOString() };
      }
      return p;
    }));
    addAuditLog(currentSeller.id, 'UPDATE_PRODUCT', `Cập nhật sản phẩm ID: ${id}`, 'seller', currentSeller.shopName);
  };

  const deleteProduct = (id: string) => {
    if (!currentSeller) return;
    const product = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => !(p.id === id && p.sellerId === currentSeller.id)));
    addAuditLog(currentSeller.id, 'DELETE_PRODUCT', `Xóa sản phẩm: ${product?.name || id}`, 'seller', currentSeller.shopName);
  };

  // ============= ORDERS =============
  const addSubOrder = (order: Omit<SubOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newOrder: SubOrder = {
      ...order,
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };
    setSubOrders(prev => [newOrder, ...prev]);

    // Cập nhật thống kê sản phẩm của seller: tăng số lượng đã bán và giảm tồn kho
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const matchedItem = newOrder.items.find(item => item.productId === p.id);
        if (!matchedItem) return p;

        const newSold = (p.sold || 0) + matchedItem.quantity;
        const newStock =
          typeof p.stock === "number"
            ? Math.max(0, p.stock - matchedItem.quantity)
            : p.stock;

        return { ...p, sold: newSold, stock: newStock };
      })
    );
  };

  const updateOrderStatus = (orderId: string, status: SubOrder['status'], trackingNumber?: string) => {
    if (!currentSeller) return;
    setSubOrders(prev => prev.map(o => {
      if (o.id === orderId && o.sellerId === currentSeller.id) {
        return { ...o, status, trackingNumber: trackingNumber || o.trackingNumber, updatedAt: new Date().toISOString() };
      }
      return o;
    }));
    addAuditLog(currentSeller.id, 'UPDATE_ORDER', `Cập nhật đơn hàng ${orderId}: ${status}`, 'seller', currentSeller.shopName);
  };

  // ============= REVIEWS =============
  const replyToReview = (reviewId: string, reply: string) => {
    if (!currentSeller) return;
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId && r.sellerId === currentSeller.id) {
        return { ...r, reply, repliedAt: new Date().toISOString() };
      }
      return r;
    }));
  };

  // ============= VOUCHERS =============
  const addVoucher = (voucher: Omit<SellerVoucher, 'id' | 'sellerId' | 'usedCount' | 'createdAt'>) => {
    if (!currentSeller) return;
    const newVoucher: SellerVoucher = {
      ...voucher,
      id: `voucher_${Date.now()}`,
      sellerId: currentSeller.id,
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    setVouchers(prev => [...prev, newVoucher]);
    addAuditLog(currentSeller.id, 'ADD_VOUCHER', `Tạo mã giảm giá: ${voucher.code}`, 'seller', currentSeller.shopName);
  };

  const updateVoucher = (id: string, updates: Partial<SellerVoucher>) => {
    if (!currentSeller) return;
    setVouchers(prev => prev.map(v => v.id === id && v.sellerId === currentSeller.id ? { ...v, ...updates } : v));
  };

  const deleteVoucher = (id: string) => {
    if (!currentSeller) return;
    setVouchers(prev => prev.filter(v => !(v.id === id && v.sellerId === currentSeller.id)));
  };

  // ============= CHAT =============
  const sendMessage = (customerId: string, customerName: string, message: string) => {
    if (!currentSeller) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sellerId: currentSeller.id,
      customerId,
      customerName,
      senderId: currentSeller.id,
      message,
      createdAt: new Date().toISOString(),
      read: true,
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const markMessagesAsRead = (customerId: string) => {
    if (!currentSeller) return;
    setChatMessages(prev => prev.map(m => {
      if (m.customerId === customerId && m.sellerId === currentSeller.id && m.senderId !== currentSeller.id) {
        return { ...m, read: true };
      }
      return m;
    }));
  };

  // Chat conversations computed
  const chatConversations: ChatConversation[] = currentSeller
    ? Array.from(new Set(chatMessages.filter(m => m.sellerId === currentSeller.id).map(m => m.customerId)))
        .map(customerId => {
          const msgs = chatMessages.filter(m => m.sellerId === currentSeller.id && m.customerId === customerId);
          const lastMsg = msgs[msgs.length - 1];
          return {
            customerId,
            customerName: lastMsg?.customerName || 'Khách hàng',
            lastMessage: lastMsg?.message || '',
            lastMessageAt: lastMsg?.createdAt || '',
            unreadCount: msgs.filter(m => !m.read && m.senderId !== currentSeller.id).length,
          };
        })
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    : [];

  // ============= STATS =============
  const getSellerStats = () => {
    if (!currentSeller) {
      return { totalRevenue: 0, totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalProducts: 0, averageRating: 0 };
    }
    const myOrders = subOrders.filter(o => o.sellerId === currentSeller.id);
    const myProducts = products.filter(p => p.sellerId === currentSeller.id);
    const myReviews = reviews.filter(r => r.sellerId === currentSeller.id);
    
    return {
      totalRevenue: myOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0),
      totalOrders: myOrders.length,
      pendingOrders: myOrders.filter(o => o.status === 'pending').length,
      completedOrders: myOrders.filter(o => o.status === 'delivered').length,
      totalProducts: myProducts.length,
      averageRating: myReviews.length > 0 ? myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length : 0,
    };
  };

  // ============= ADMIN FUNCTIONS =============
  const approveSeller = (sellerId: string) => {
    setSellers(prev => prev.map(s => {
      if (s.id === sellerId) {
        return { ...s, status: 'approved' as const, approvedAt: new Date().toISOString() };
      }
      return s;
    }));
    const seller = sellers.find(s => s.id === sellerId);
    addAuditLog(sellerId, 'APPROVE_SELLER', 'Admin duyệt seller', 'admin', 'Admin');
  };

  const suspendSeller = (sellerId: string, reason: string) => {
    setSellers(prev => prev.map(s => {
      if (s.id === sellerId) {
        return { ...s, status: 'suspended' as const, suspendedAt: new Date().toISOString() };
      }
      return s;
    }));
    addAuditLog(sellerId, 'SUSPEND_SELLER', `Admin khóa seller: ${reason}`, 'admin', 'Admin');
  };

  const unsuspendSeller = (sellerId: string) => {
    setSellers(prev => prev.map(s => {
      if (s.id === sellerId && s.status === 'suspended') {
        return { ...s, status: 'approved' as const, suspendedAt: undefined };
      }
      return s;
    }));
    addAuditLog(sellerId, 'UNSUSPEND_SELLER', 'Admin mở khóa seller', 'admin', 'Admin');
  };

  const getSellerById = (sellerId: string) => sellers.find(s => s.id === sellerId);
  const getProductsBySeller = (sellerId: string) => products.filter(p => p.sellerId === sellerId);
  const getOrdersBySeller = (sellerId: string) => subOrders.filter(o => o.sellerId === sellerId);

  // Current seller's filtered data
  const sellerProducts = currentSeller ? products.filter(p => p.sellerId === currentSeller.id) : [];
  const sellerOrders = currentSeller ? subOrders.filter(o => o.sellerId === currentSeller.id) : [];
  const sellerReviews = currentSeller ? reviews.filter(r => r.sellerId === currentSeller.id) : [];
  const sellerVouchers = currentSeller ? vouchers.filter(v => v.sellerId === currentSeller.id) : [];

  return (
    <SellerContext.Provider value={{
      // Auth
      currentSeller,
      isSellerLoggedIn: !!currentSeller,
      loginSeller,
      loginSellerByUserId,
      registerSeller,
      createSellerFromAuth,
      logoutSeller,
      updateSellerProfile,
      // Products
      sellerProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      // Orders
      sellerOrders,
      addSubOrder,
      updateOrderStatus,
      // Reviews
      sellerReviews,
      replyToReview,
      // Vouchers
      sellerVouchers,
      addVoucher,
      updateVoucher,
      deleteVoucher,
      // Chat
      chatMessages: currentSeller ? chatMessages.filter(m => m.sellerId === currentSeller.id) : [],
      chatConversations,
      sendMessage,
      markMessagesAsRead,
      // Stats
      getSellerStats,
      // Admin
      allSellers: sellers,
      allSellerProducts: products,
      allSubOrders: subOrders,
      auditLogs,
      approveSeller,
      suspendSeller,
      unsuspendSeller,
      getSellerById,
      getProductsBySeller,
      getOrdersBySeller,
    }}>
      {children}
    </SellerContext.Provider>
  );
};

export const useSeller = () => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
};
