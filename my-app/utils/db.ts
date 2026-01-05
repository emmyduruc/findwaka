const backendUrl = process.env.EXPO_PUBLIC_BASE_URL;
console.log('backendUrl........s..', backendUrl);
export const DBUtils = {
  auth: {
    initialize: `/auth/initialize`,
  },
  users: {
    getMe: `/users/me`,
    updateMe: `/users/me`,
  },
  drivers: {
    createMe: `/drivers/me`,
    getMe: `/drivers/me`,
    updateMe: `/drivers/me`,
    getPublic: `/drivers/public`,
    documents: {
      create: `/drivers/me/documents`,
      getAll: `/drivers/me/documents`,
      update: (id: string) => `/drivers/me/documents/${id}`,
    },
  },
  passengers: {
    getMe: `/passengers/me`,
    updateMe: `/passengers/me`,
  },
  presence: {
    setOnline: `/presence/me/online`,
    setOffline: `/presence/me/offline`,
    updateLocation: `/presence/me/location`,
  },
  reviews: {
    create: (driverId: string) => `/drivers/${driverId}/reviews`,
    getByDriver: (driverId: string) => `/drivers/${driverId}/reviews`,
  },
  admin: {
    getPendingDocuments: `/admin/drivers/pending-docs`,
    approveDocument: (id: string) => `/admin/documents/${id}/approve`,
    rejectDocument: (id: string) => `/admin/documents/${id}/reject`,
  },
  chat: {
    conversations: `/chat/conversations`,
    getConversation: (id: string) => `/chat/conversations/${id}`,
    getOrCreateConversation: (otherUserId: string) => `/chat/conversations/${otherUserId}`,
    messages: `/chat/messages`,
    markAsRead: (id: string) => `/chat/conversations/${id}/read`,
  },
};
