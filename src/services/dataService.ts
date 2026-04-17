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

export interface Competition {
  id: string;
  name: string;
  type: string;
  maxPlayers: number;
  maxAge: string | number;
  teamQuota: number;
  entryFee: number;
  startDate: string;
  endDate: string;
  status: "Open" | "Closed";
  createdAt?: string;
}

export interface TeamRegistration {
  id: string;
  competitionId: string;
  teamName: string;
  managerName: string;
  phone: string;
  email: string;
  logoUrl: string;
  slipUrl: string;
  status: "Pending" | "Approved" | "Rejected";
  submittedAt: string;
}

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
  unit?: string;
  description?: string;
  features: string[];
  status: "Active" | "Inactive";
  popular?: boolean;
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
  logoUrl?: string;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  competition?: string;
  status?: string;
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
  createTeam: async (teamData: Partial<Team>): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db!, "teams"), teamData);
        return true;
      } catch (error) {
        console.error("Firebase createTeam Error:", error);
        return false;
      }
    }
    return false;
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

  createPackage: async (pkgData: Partial<Package>): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db!, "packages"), pkgData);
        return true;
      } catch (error) {
        console.error("Firebase createPackage Error:", error);
        return false;
      }
    }
    return false;
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

  deletePackage: async (pkgId: string): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db!, "packages", pkgId));
        return true;
      } catch (error) {
        console.error("Firebase deletePackage Error:", error);
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
  },

  // --- COMPETITIONS ---
  getCompetitions: async (): Promise<Competition[]> => {
    if (isFirebaseConfigured) {
      try {
        const snapshot = await getDocs(query(collection(db!, "competitions"), orderBy("createdAt", "desc")));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Competition));
      } catch (error) {
        console.error("Firebase getCompetitions Error:", error);
      }
    }
    return [];
  },

  createCompetition: async (compData: Partial<Competition>): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db!, "competitions"), {
          ...compData,
          createdAt: new Date().toISOString()
        });
        return true;
      } catch (error) {
        console.error("Firebase createCompetition Error:", error);
        return false;
      }
    }
    return false;
  },

  updateCompetition: async (compId: string, data: Partial<Competition>): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db!, "competitions", compId), data);
        return true;
      } catch (error) {
        console.error("Firebase updateCompetition Error:", error);
        return false;
      }
    }
    return false;
  },

  deleteCompetition: async (compId: string): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db!, "competitions", compId));
        return true;
      } catch (error) {
        console.error("Firebase deleteCompetition Error:", error);
        return false;
      }
    }
    return false;
  },

  // --- TEAM REGISTRATIONS ---
  getRegistrations: async (): Promise<TeamRegistration[]> => {
    if (isFirebaseConfigured) {
      try {
        const snapshot = await getDocs(query(collection(db!, "team_registrations"), orderBy("submittedAt", "desc")));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TeamRegistration));
      } catch (error) {
        console.error("Firebase getRegistrations Error:", error);
      }
    }
    return [];
  },

  submitRegistration: async (regData: Partial<TeamRegistration>): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db!, "team_registrations"), {
          ...regData,
          status: "Pending",
          submittedAt: new Date().toISOString()
        });
        return true;
      } catch (error) {
        console.error("Firebase submitRegistration Error:", error);
        return false;
      }
    }
    return false;
  },

  updateRegistrationStatus: async (regId: string, status: "Pending" | "Approved" | "Rejected"): Promise<boolean> => {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db!, "team_registrations", regId), { status });
        return true;
      } catch (error) {
        console.error("Firebase updateRegistrationStatus Error:", error);
        return false;
      }
    }
    return false;
  },
};




