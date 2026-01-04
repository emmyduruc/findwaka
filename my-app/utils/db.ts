const backendUrl = process.env.BACKEND_URL;

export const DBUtils = {
  auth: {
    bootstrap: `${backendUrl}/auth/bootstrap`,
  },
  users: {
    getMe: `${backendUrl}/users/me`,
    updateMe: `${backendUrl}/users/me`,
  },
  drivers: {
    createMe: `${backendUrl}/drivers/me`,
    getMe: `${backendUrl}/drivers/me`,
    updateMe: `${backendUrl}/drivers/me`,
    getPublic: `${backendUrl}/drivers/public`,
    documents: {
      create: `${backendUrl}/drivers/me/documents`,
      getAll: `${backendUrl}/drivers/me/documents`,
      update: (id: string) => `${backendUrl}/drivers/me/documents/${id}`,
    },
  },
  passengers: {
    getMe: `${backendUrl}/passengers/me`,
    updateMe: `${backendUrl}/passengers/me`,
  },
  presence: {
    setOnline: `${backendUrl}/presence/me/online`,
    setOffline: `${backendUrl}/presence/me/offline`,
    updateLocation: `${backendUrl}/presence/me/location`,
  },
  reviews: {
    create: (driverId: string) => `${backendUrl}/drivers/${driverId}/reviews`,
    getByDriver: (driverId: string) => `${backendUrl}/drivers/${driverId}/reviews`,
  },
  admin: {
    getPendingDocuments: `${backendUrl}/admin/drivers/pending-docs`,
    approveDocument: (id: string) => `${backendUrl}/admin/documents/${id}/approve`,
    rejectDocument: (id: string) => `${backendUrl}/admin/documents/${id}/reject`,
  },
};
