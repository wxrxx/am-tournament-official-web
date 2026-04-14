// Data Service
// Supports Firebase Firestore & Storage
// Cleaned: Removed all mock data fallbacks

import { db, isFirebaseConfigured } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy,
  limit
} from "firebase/firestore";

export interface Match {
  id: string;
  date: string;
  time?: string;
  home?: string;
  away?: string;
  venue?: string;
  teamA?: string;
  teamB?: string;
  score: string | null;
  status: "upcoming" | "completed";
}

export interface Photo {
  id: string;
  url: string;
  price: number;
}

export interface GalleryAlbum {
  albumId: string;
  matchId: string;
  title: string;
  date: string;
  coverUrl: string;
  isProtected: boolean;
  password?: string;
  photos: Photo[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  features: string[];
  status: "Active" | "Inactive";
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  region: string;
  since: number;
  points: number;
  logoColor: string;
  bgColor: string;
}

export const DataService = {
  // --- TEAMS ---
  getTeams: async (): Promise<Team[]> => {
    if (isFirebaseConfigured) {
      try {
        const snapshot = await getDocs(query(collection(db!, "teams"), orderBy("points", "desc")));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team));
      } catch (error) {
        console.error("Firebase getTeams Error:", error);
      }
    }
    return [];
  },
  // --- MATCHES ---
  getMatches: async (): Promise<Match[]> => {
    if (isFirebaseConfigured) {
      try {
        const snapshot = await getDocs(query(collection(db!, "matches"), orderBy("date", "desc")));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match));
      } catch (error) {
        console.error("Firebase getMatches Error:", error);
      }
    }
    return [];
  },

  // --- GALLERY ---
  getGalleryAlbums: async (): Promise<GalleryAlbum[]> => {
    if (isFirebaseConfigured) {
      try {
        const snapshot = await getDocs(query(collection(db!, "albums"), orderBy("date", "desc")));
        return snapshot.docs.map(d => ({ albumId: d.id, ...d.data() } as GalleryAlbum));
      } catch (error) {
        console.error("Firebase getGalleryAlbums Error:", error);
      }
    }
    return [];
  },

  getAlbumById: async (albumId: string): Promise<GalleryAlbum | undefined> => {
    if (isFirebaseConfigured) {
      try {
        const docSnap = await getDoc(doc(db!, "albums", albumId));
        if (docSnap.exists()) return { albumId: docSnap.id, ...docSnap.data() } as GalleryAlbum;
      } catch (error) {
        console.error("Firebase getAlbumById Error:", error);
      }
    }
    return undefined;
  },

  createAlbum: async (albumData: Partial<GalleryAlbum>): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db!, "albums"), { 
          ...albumData, 
          photos: albumData.photos || [] 
        });
        return true;
      } catch (error) {
        console.error("Firebase createAlbum Error:", error);
        return false;
      }
    }
    return false;
  },

  deleteAlbum: async (albumId: string): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db!, "albums", albumId));
        return true;
      } catch (error) {
        console.error("Firebase deleteAlbum Error:", error);
        return false;
      }
    }
    return false;
  },

  // --- SHOP ---
  getProducts: async (): Promise<Product[]> => {
    if (isFirebaseConfigured) {
      try {
        const snapshot = await getDocs(collection(db!, "products"));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      } catch (error) {
        console.error("Firebase getProducts Error:", error);
      }
    }
    return [];
  },

  createProduct: async (productData: Partial<Product>): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db!, "products"), productData);
        return true;
      } catch (error) {
        console.error("Firebase createProduct Error:", error);
        return false;
      }
    }
    return false;
  },

  deleteProduct: async (productId: string): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db!, "products", productId));
        return true;
      } catch (error) {
        console.error("Firebase deleteProduct Error:", error);
        return false;
      }
    }
    return false;
  },

  updateProduct: async (productId: string, data: Partial<Product>): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db!, "products", productId), data);
        return true;
      } catch (error) {
        console.error("Firebase updateProduct Error:", error);
        return false;
      }
    }
    return false;
  },

  // --- PACKAGES ---
  getPackages: async (): Promise<Package[]> => {
    if (isFirebaseConfigured) {
      try {
        const snapshot = await getDocs(collection(db!, "packages"));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Package));
      } catch (error) {
        console.error("Firebase getPackages Error:", error);
      }
    }
    return [];
  },

  updatePackage: async (pkgId: string, data: Partial<Package>): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db!, "packages", pkgId), data);
        return true;
      } catch (error) {
        console.error("Firebase updatePackage Error:", error);
        return false;
      }
    }
    return false;
  },

  // --- ORDERS ---
  getOrders: async (count?: number): Promise<any[]> => {
    if (isFirebaseConfigured) {
      try {
        const q = count 
          ? query(collection(db!, "orders"), orderBy("date", "desc"), limit(count))
          : query(collection(db!, "orders"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (error) {
        console.error("Firebase getOrders Error:", error);
      }
    }
    return [];
  },

  updateOrder: async (orderId: string, data: any): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db!, "orders", orderId), data);
        return true;
      } catch (error) {
        console.error("Firebase updateOrder Error:", error);
        return false;
      }
    }
    return false;
  },

  submitPaymentSlip: async (orderDetails: any, slipUrl: string): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db!, "orders"), { 
          ...orderDetails, 
          slipUrl, 
          status: "Pending", 
          date: new Date().toISOString() 
        });
        return true;
      } catch (error) {
        console.error("Firebase submitPayment Error:", error);
        return false;
      }
    }
    return false;
  }
};




