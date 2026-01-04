
const backendUrl = process.env.BACKEND_URL;


export const DBUtils = {
    /**Auth */
    registerUser: `${backendUrl}/user/register`,
    payRideRemittance: `${backendUrl}/user/driver/pay-ride-remittance`,
    /** User */
    getUser: `${backendUrl}/user/get`,
    updateUser: `${backendUrl}/user/update`,
    /** Driver */
    createDriver: `${backendUrl}/driver/create`,
    getDriver: `${backendUrl}/driver/get`,
    updateDriver: `${backendUrl}/driver/update`,
    /** Passenger */
    createPassenger: `${backendUrl}/passenger/create`,
    getPassenger: `${backendUrl}/passenger/get`,
    updatePassenger: `${backendUrl}/passenger/update`,
    loginUser: `${backendUrl}/auth/login`,
}