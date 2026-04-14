// Mock Data Service
// Designed to be easily replaced by Supabase / external API in the future

export interface Match {
  id: string;
  date: string;
  teamA: string;
  teamB: string;
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

export const DataService = {
  getMatches: async (): Promise<Match[]> => {
    // Dynamic import to avoid SSR fetch absolute URL errors
    const data = await import("../../public/data/schedule.json");
    return data.default as Match[];
  },

  getGalleryAlbums: async (): Promise<GalleryAlbum[]> => {
    const data = await import("../../public/data/gallery.json");
    return data.default as GalleryAlbum[];
  },

  getAlbumById: async (albumId: string): Promise<GalleryAlbum | undefined> => {
    const albums = await DataService.getGalleryAlbums();
    return albums.find((a) => a.albumId === albumId);
  },

  // Mock functions for payment/mutations
  submitPaymentSlip: async (orderDetails: any, slipImageBase64: string): Promise<boolean> => {
    console.log("Mock Submit Payment:", orderDetails);
    // TODO: Future Supabase Integration - Save order to 'orders' table
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // Always succeeds in mock
      }, 1000);
    });
  },

  // Admin Methods (Mock)
  createAlbum: async (album: Partial<GalleryAlbum>): Promise<boolean> => {
    console.log("Mock Admin: Creating Album", album);
    // TODO: Future Supabase Integration - Insert to 'albums' table
    return true;
  },

  deleteAlbum: async (albumId: string): Promise<boolean> => {
    console.log("Mock Admin: Deleting Album", albumId);
    // TODO: Future Supabase Integration - Delete from 'albums' table
    return true;
  },

  updateProduct: async (productId: string, data: any): Promise<boolean> => {
    console.log("Mock Admin: Updating Product", productId, data);
    // TODO: Future Supabase Integration - Update 'products' table
    return true;
  },

  getOrders: async (): Promise<any[]> => {
    // TODO: Future Supabase Integration - Fetch from 'orders' table
    return [
      { id: "ORD001", user: "John Doe", type: "Photo", item: "Final Match 2026", price: 100, status: "Pending", date: "2026-05-15" },
      { id: "ORD002", user: "Jane Smith", type: "Product", item: "Jersey (Home)", price: 490, status: "Confirmed", date: "2026-05-16" },
      { id: "ORD003", user: "Bob Builder", type: "Package", item: "Professional", price: 4500, status: "Pending", date: "2026-05-16" },
    ];
  }
};

