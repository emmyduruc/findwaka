import {autorun, makeAutoObservable, runInAction, toJS} from "mobx";
import {router} from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { IRootStore } from "./root";
import { ILoggerService } from "@/services/logger";
import { AuthService } from "@/services/auth";
import { storageService } from "@/services/storage";

const ONBOARDING_STORAGE_KEYS = {
  ONBOARDING_SEEN: 'onboardingSeen',
  AUTH_STATUS: 'authStatus',
  ROLE: 'role',
  DRIVER_ONBOARDING_COMPLETE: 'driverOnboardingComplete',
};

type AuthStatus = 'guest' | 'loggedOut' | 'loggedIn';
type Role = 'passenger' | 'driver';


export const createAuthStore = (
    root: IRootStore,
        logger: ILoggerService,
    authService: AuthService,
) => {

    const persist = async () => {
        try {
            // const firebaseIdToken = toJS(store.firebaseIdToken);
            // const userLoginEmail = toJS(store.userLoginEmail);
            // const referralCode = toJS(store.referralCode);
            // await storageService.setItem(
            //     "authStore.firebaseIdToken",
            //     JSON.stringify(firebaseIdToken)
            // );
            // await storageService.setItem(
            //     "authStore.userLoginEmail",
            //     userLoginEmail
            // );
            // await storageService.setItem(
            //     "authStore.referralCode",
            //     referralCode
            // );
            
        } catch (error) {
            logger.error("Error occurred persisting store");
        }
    };

    // const hydrate = async () => {
    //     try {
    //         const firebaseIdToken = await storageService.getItem(
    //             "authStore.firebaseIdToken"
    //         );
    //         const userLoginEmail = await storageService.getItem(
    //             "authStore.userLoginEmail"
    //         );
    //         const referralCode = await storageService.getItem(
    //             "authStore.referralCode"
    //         );

    //         if (firebaseIdToken) {
    //             runInAction(() => {
    //                 store.firebaseIdToken = JSON.parse(firebaseIdToken);
    //             });
    //         }

    //         if (userLoginEmail) {
    //             runInAction(() => {
    //                 store.userLoginEmail = userLoginEmail;
    //             });
    //         }

    //         if (referralCode) {
    //             runInAction(() => {
    //                 store.referralCode = referralCode;
    //             });
    //         }

    //         const onboardingSeen = await SecureStore.getItemAsync(ONBOARDING_STORAGE_KEYS.ONBOARDING_SEEN);
    //         const authStatus = await SecureStore.getItemAsync(ONBOARDING_STORAGE_KEYS.AUTH_STATUS);
    //         const role = await SecureStore.getItemAsync(ONBOARDING_STORAGE_KEYS.ROLE);
    //         const driverOnboardingComplete = await SecureStore.getItemAsync(ONBOARDING_STORAGE_KEYS.DRIVER_ONBOARDING_COMPLETE);

    //         runInAction(() => {
    //             if (onboardingSeen !== null && onboardingSeen !== undefined) {
    //                 store.onboardingSeen = typeof onboardingSeen === 'string' ? onboardingSeen === 'true' : !!onboardingSeen;
    //             }
    //             if (authStatus) {
    //                 store.authStatus = authStatus as AuthStatus;
    //             }
    //             if (role) {
    //                 store.role = role as Role;
    //             }
    //             if (driverOnboardingComplete !== null && driverOnboardingComplete !== undefined) {
    //                 store.driverOnboardingComplete = typeof driverOnboardingComplete === 'string' ? driverOnboardingComplete === 'true' : !!driverOnboardingComplete;
    //             }
    //             store.isHydrated = true;
    //         });
    //     } catch (error) {
    //         logger.error("Error occured hydrating store");
    //         runInAction(() => {
    //             store.isHydrated = true;
    //         });
    //     }
    // };
    const store = makeAutoObservable({
        //    ____  _                              _     _
        //   / __ \| |                            | |   | |
        //  | |  | | |__  ___  ___ _ ____   ____ _| |__ | | ___  ___
        //  | |  | | '_ \/ __|/ _ \ '__\ \ / / _` | '_ \| |/ _ \/ __|
        //  | |__| | |_) \__ \  __/ |   \ V / (_| | |_) | |  __/\__ \
        //   \____/|_.__/|___/\___|_|    \_/ \__,_|_.__/|_|\___||___/

        isLoading: false,
        // authUser: null as FirebaseAuthTypes.UserCredential | null,
        // currentUser: null as null | IUser as Record<string, any>,
        firebaseIdToken: "" as string,
        firebaseIdTokenTemp: "" as string,
        currentUserToken: "" as string,
        // loggedInUser: null as null | FirebaseAuthTypes.User,
        isAuthLoading: false,
        // confirmation: null as null | FirebaseAuthTypes.ConfirmationResult,
        // zeroBounceResponse: null as null | ZeroBounceResponse,
        userLoginEmail: "" as string,
        referralCode: "" as string,
        onboardingSeen: false,
        authStatus: 'loggedOut' as AuthStatus,
        role: 'passenger' as Role,
        driverOnboardingComplete: false,
        isHydrated: false,

        //                _   _
        //      /\       | | (_)
        //     /  \   ___| |_ _  ___  _ __  ___
        //    / /\ \ / __| __| |/ _ \| '_ \/ __|
        //   / ____ \ (__| |_| | (_) | | | \__ \
        //  /_/    \_\___|\__|_|\___/|_| |_|___/

        setIsAuthLoading: (value: boolean) => {
            runInAction(() => {
                store.isAuthLoading = value;
            });
        },

        setPhoneAuthConfirmation: (confirmation:  null) => {
            // store.confirmation = confirmation;
        },

        setZeroBounceResponse: (response:  null) => {
            runInAction(() => {
                // store.zeroBounceResponse = response;
            });
        },

        clearZeroBounceResponse: () => {
            runInAction(() => {
                // store.zeroBounceResponse = null;
            });
        },

        setUserLoginEmail: (email: string) => {
            runInAction(() => {
                store.userLoginEmail = email;
            });
        },

        clearUserLoginEmail: () => {
            runInAction(() => {
                store.userLoginEmail = "";
            });
        },

        setReferralCode: (code: string) => {
            runInAction(() => {
                store.referralCode = code;
            });
            persist();
        },

        clearReferralCode: () => {
            runInAction(() => {
                store.referralCode = "";
            });
            persist();
        },

        updateFirebaseIdTokenTemp: (token: string) => {
            runInAction(() => {
                store.firebaseIdTokenTemp = token;
            });
        },

        // onGoogleSignIn: async () => {
        //     store.setIsAuthLoading(true);

        //     try {
        //         try {
        //             const webClientId = "831637222092-0f7fkqj02noqst7trhkul5f5897fkikd.apps.googleusercontent.com"
        //             if (webClientId) {
        //                 GoogleSignin.configure({ webClientId });
        //             }
        //         } catch (e) {
        //             // proceed without explicit configuration if not available
        //         }
        //         const {data, type} = await GoogleSignin.signIn();
        //         if (data) {
        //             const googleCredential = authFirebase.GoogleAuthProvider.credential(
        //                 data.idToken
        //             );
        //             const user_sign_in = await auth.signInWithCredential(
        //                 googleCredential
        //             );
        //             const user = user_sign_in.user;

        //             const firebaseIdToken = await user_sign_in.user.getIdToken(true);
        //             await setStorage("@firebase-id-token", firebaseIdToken);

        //             store.updateFirebaseIdTokenTemp(firebaseIdToken);

        //             analyticsService.trackEvent({
        //                 name: AnalyticsEvent.AUTH_GOOGLE_SIGN_IN,
        //                 params: {
        //                     is_new_user: user_sign_in.additionalUserInfo?.isNewUser || false,
        //                     provider: 'google'
        //                 }
        //             });

        //             if (user_sign_in.additionalUserInfo?.isNewUser) {
        //                 const registrationData: any = {
        //                     type: UserType.DRIVER,
        //                 };
                        
        //                 // Include referral code if available
        //                 if (store.referralCode && store.referralCode.trim().length > 0) {
        //                     registrationData.referralCode = store.referralCode;
        //                 }
                        
        //                 return store.registerUser(firebaseIdToken, registrationData);
        //             }

        //             return store.loginUser(firebaseIdToken);
        //         }
        //     } catch (error: any) {
        //         console.log("Google auth error....", error);
        //         root.gui.renderToast({
        //             text: getFirebaseAuthError(error.message) || root.gui.translate("error_signing_up_contact_support"),
        //             type: "error",
        //             id: "reset-password-error",
        //         });
        //         logger.error(
        //             "Error registering user:",
        //             logger.templateMessages.STORE
        //         );
        //     } finally {
        //         store.setIsAuthLoading(false);
        //     }
        // },

        // onFacebookSignIn: async () => {
        //     store.setIsAuthLoading(true);

        //     try {
        //         await LoginManager.logInWithPermissions(['public_profile', 'email']);
        //         const accessToken = await AccessToken.getCurrentAccessToken();

        //         if (accessToken) {
        //             const facebookCredential = authFirebase.FacebookAuthProvider.credential(accessToken.accessToken);
        //             const user_sign_in = await auth.signInWithCredential(
        //                 facebookCredential
        //             );
        //             const user = user_sign_in.user;

        //             const firebaseIdToken = await user_sign_in.user.getIdToken(true);
        //             await setStorage("@firebase-id-token", firebaseIdToken);

        //             store.updateFirebaseIdTokenTemp(firebaseIdToken);

        //             analyticsService.trackEvent({
        //                 name: AnalyticsEvent.AUTH_FACEBOOK_SIGN_IN,
        //                 params: {
        //                     is_new_user: user_sign_in.additionalUserInfo?.isNewUser || false,
        //                     provider: 'facebook'
        //                 }
        //             });

        //             if (user_sign_in.additionalUserInfo?.isNewUser) {
        //                 return store.registerUser(firebaseIdToken, {});
        //             }

        //             return store.loginUser(firebaseIdToken);
        //         }
        //     } catch (error: any) {
        //         root.gui.renderToast({
        //             text: getFirebaseAuthError(error.message) || root.gui.translate("error_signing_up_contact_support"),
        //             type: "error",
        //             id: "reset-password-error",
        //         });
        //         logger.error(
        //             "Error registering user:",
        //             logger.templateMessages.STORE
        //         );
        //     } finally {
        //         store.setIsAuthLoading(false);
        //     }
        // },

        // onAppleSignIn: async () => {
        //     store.setIsAuthLoading(true);

        //     try {
        //         const isAvailable = await AppleAuthentication.isAvailableAsync();
        //         if (!isAvailable) {
        //             throw new Error('Apple Sign-In is not available on this device');
        //         }

        //         const credential = await AppleAuthentication.signInAsync({
        //             requestedScopes: [
        //                 AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        //                 AppleAuthentication.AppleAuthenticationScope.EMAIL,
        //             ],
        //         });

        //         if (!credential.identityToken) {
        //             throw new Error('Apple Sign-In failed - no identity token');
        //         }

        //         const { identityToken } = credential;
        //         const appleCredential = authFirebase.AppleAuthProvider.credential(identityToken);
        //         const user_sign_in = await auth.signInWithCredential(appleCredential);
        //         const user = user_sign_in.user;

        //         const firebaseIdToken = await user_sign_in.user.getIdToken(true);
        //         await setStorage("@firebase-id-token", firebaseIdToken);

        //         store.updateFirebaseIdTokenTemp(firebaseIdToken);

        //         analyticsService.trackEvent({
        //             name: AnalyticsEvent.AUTH_APPLE_SIGN_IN,
        //             params: {
        //                 is_new_user: user_sign_in.additionalUserInfo?.isNewUser || false,
        //                 provider: 'apple'
        //             }
        //         });

        //         if (user_sign_in.additionalUserInfo?.isNewUser) {
        //             const registrationData: any = {
        //                 type: UserType.DRIVER,
        //             };
                    
        //             if (store.referralCode && store.referralCode.trim().length > 0) {
        //                 registrationData.referralCode = store.referralCode;
        //             }
                    
        //             return store.registerUser(firebaseIdToken, registrationData);
        //         }

        //         return store.loginUser(firebaseIdToken);
        //     } catch (error: any) {
        //         if (error.code === 'ERR_REQUEST_CANCELED' || error.code === 'ERR_INVALID_RESPONSE') {
        //             return;
        //         }
                
        //         let errorMessage = root.gui.translate("error_signing_up_contact_support");
                
        //         if (error.code === -7026 || error.code === 1000) {
        //             errorMessage = "Apple Sign-In is not properly configured. Please ensure the app is configured in Apple Developer Portal with Sign in with Apple capability enabled.";
        //         } else if (error.message) {
        //             errorMessage = error.message;
        //         }
                
        //         root.gui.renderToast({
        //             text: errorMessage,
        //             type: "error",
        //             id: "apple-signin-error",
        //         });
        //         logger.error(
        //             `Error with Apple Sign-In: ${error.message || error.code || 'Unknown error'}`,
        //             logger.templateMessages.STORE
        //         );
        //     } finally {
        //         store.setIsAuthLoading(false);
        //     }
        // },

        // onPhoneVerify: async (code: string, mode: 'signin' | 'signup' = 'signin') => {
        //     store.setIsAuthLoading(true);

        //     if (!store.confirmation) {
        //         return root.gui.renderToast({
        //             text: root.gui.translate("unable_to_verify_phone"),
        //             type: "error",
        //             id: "verify-phone-error",
        //         })
        //     }

        //     try {
        //         root.gui.setGlobalModalVisibility(true);

        //         const phoneCredential = authFirebase.PhoneAuthProvider.credential(
        //             store.confirmation.verificationId, code
        //         );

        //         const user_sign_in = await auth.signInWithCredential(
        //             phoneCredential
        //         );

        //         runInAction(() => {
        //             store.authUser = user_sign_in;
        //         })

        //         const firebaseIdToken = await user_sign_in.user.getIdToken(true);
        //         await setStorage("@firebase-id-token", firebaseIdToken);

        //         store.updateFirebaseIdTokenTemp(firebaseIdToken);

        //         analyticsService.trackEvent({
        //             name: AnalyticsEvent.AUTH_PHONE_VERIFY,
        //             params: {
        //                 mode,
        //                 is_new_user: mode === 'signup'
        //             }
        //         });

        //         if (mode === 'signup') {
        //             await store.registerUser(firebaseIdToken, {
        //                 type: UserType.DRIVER,
        //             });
        //         } else {
        //             await store.loginUser(firebaseIdToken);
        //         }

        //     } catch (error: any) {
        //         store.setIsAuthLoading(false);
        //         root.gui.setGlobalModalVisibility(false);
        //         root.gui.renderToast({
        //             text: error?.message ? getFirebaseAuthError(error.message) : root.gui.translate("error_signing_up_contact_support"),
        //             type: "error",
        //             id: "reset-password-error",
        //         });

        //         if (store.authUser?.additionalUserInfo?.isNewUser) {
        //             await store.authUser.user.delete();
        //         }

        //         logger.error(
        //             "Error registering user: " + (error.message || error),
        //             logger.templateMessages.STORE,
        //         );
        //     } finally {
        //         store.setPhoneAuthConfirmation(null);
        //         store.setIsAuthLoading(false);
        //         root.gui.setGlobalModalVisibility(false);
        //     }
        // },

        // onEmailPasswordSignIn: async (email: string, password: string) => {
        //     store.setIsAuthLoading(true);

        //     // let didTimeout = false;
        //     // const timeoutId = setTimeout(() => {
        //     //     didTimeout = true;
        //     //     store.setIsAuthLoading(false);
        //     //     root.gui.setGlobalModalVisibility(false);
        //     //     root.gui.renderToast({
        //     //         text: "The request is taking longer than expected. Please check your connection and try again.",
        //     //         type: "error",
        //     //         id: "email-signin-timeout",
        //     //     });
        //     // }, 45000);

        //     try {
        //         root.gui.setGlobalModalVisibility(true);

        //         const user_sign_in = await auth.signInWithEmailAndPassword(email, password);

        //         runInAction(() => {
        //             store.authUser = user_sign_in;
        //         });

        //         const firebaseIdToken = await user_sign_in.user.getIdToken(true);
        //         await setStorage("@firebase-id-token", firebaseIdToken);

        //         store.updateFirebaseIdTokenTemp(firebaseIdToken);

        //         // Store the login email for future use
        //         store.setUserLoginEmail(email);

        //         analyticsService.trackEvent({
        //             name: AnalyticsEvent.AUTH_EMAIL_SIGN_IN,
        //             params: {
        //                 provider: 'email'
        //             }
        //         });

        //         await store.loginUser(firebaseIdToken);

        //     } catch (error: any) {
        //         if (!didTimeout) {
        //             store.setIsAuthLoading(false);
        //             root.gui.setGlobalModalVisibility(false);
                    
        //             const errorType = getAuthErrorType(error.message);
        //             let errorMessage = getFirebaseAuthError(error.message) || root.gui.translate("error_signing_in_user");

        //             if (errorType === AuthErrorType.ACCOUNT_EXISTS_WITH_DIFFERENT_PROVIDER) {
        //                 errorMessage = "This account was created with a different sign-in method. Please use the original method to sign in.";
        //             } else if (errorType === AuthErrorType.ACCOUNT_NOT_FOUND) {
        //                 errorMessage = "No account found with this email address. Please sign up first.";
        //             }

        //             root.gui.renderToast({
        //                 text: errorMessage,
        //                 type: "error",
        //                 id: "email-signin-error",
        //             });

        //             logger.error(
        //                 "Error signing in with email/password: " + (error.message || error),
        //                 logger.templateMessages.STORE,
        //             );
        //         }
        //     } finally {
        //         clearTimeout(timeoutId);
        //         store.setIsAuthLoading(false);
        //         root.gui.setGlobalModalVisibility(false);
        //     }
        // },

        // onEmailPasswordSignUp: async (email: string, password: string) => {
        //     store.setIsAuthLoading(true);

        //     try {
        //         root.gui.setGlobalModalVisibility(true);

        //         // Validate email with ZeroBounce before proceeding (conditionally blocking)
        //         try {
        //             const emailValidationService = createEmailValidationService();
        //             const validationResult = await emailValidationService.validateEmail(email);

        //             if (!validationResult.isValid) {
        //                 // Proceed silently when out of credits
        //                 if (validationResult.status === "out_of_credits") {
                        
        //                 } else {
        //                     // Block for genuine invalids
        //                 root.gui.renderToast({
        //                     text: `Email validation failed: ${validationResult.message}`,
        //                     type: "error",
        //                     id: "email-validation-error",
        //                 });
        //                 root.gui.setGlobalModalVisibility(false);
        //                 store.setIsAuthLoading(false);
        //                 return;
        //             }
        //             }

        //             // Prefill only when valid
        //             if (validationResult?.isValid && validationResult.fullResponse) {
        //                 store.setZeroBounceResponse(validationResult.fullResponse);
        //             }
        //         } catch (_) {
        //             // Fail silently – do not block signup
        //         }

        //         const user_sign_up = await auth.createUserWithEmailAndPassword(email, password);

        //         runInAction(() => {
        //             store.authUser = user_sign_up;
        //         });

        //         const firebaseIdToken = await user_sign_up.user.getIdToken(true);
        //         await setStorage("@firebase-id-token", firebaseIdToken);

        //         store.updateFirebaseIdTokenTemp(firebaseIdToken);

        //         analyticsService.trackEvent({
        //             name: AnalyticsEvent.AUTH_EMAIL_SIGN_UP,
        //             params: {
        //                 provider: 'email',
        //                 user_type: UserType.DRIVER
        //             }
        //         });

        //         const registrationData: any = {
        //             type: UserType.DRIVER,
        //         };
                
        //         // Include referral code if available
        //         if (store.referralCode && store.referralCode.trim().length > 0) {
        //             registrationData.referralCode = store.referralCode;
        //         }
                
        //         await store.registerUser(firebaseIdToken, registrationData);

        //     } catch (error: any) {
        //         store.setIsAuthLoading(false);
        //         root.gui.setGlobalModalVisibility(false);
                
        //         const errorType = getAuthErrorType(error.message);
        //         let errorMessage = getFirebaseAuthError(error.message) || root.gui.translate("error_registering_user");

        //         // Handle specific error cases
        //         if (errorType === AuthErrorType.EMAIL_ALREADY_IN_USE) {
        //             errorMessage = "An account with this email already exists. Please sign in instead.";
        //         } else if (errorType === AuthErrorType.WEAK_PASSWORD) {
        //             errorMessage = "Password is too weak. Please choose a stronger password.";
        //         }

        //         root.gui.renderToast({
        //             text: errorMessage,
        //             type: "error",
        //             id: "email-signup-error",
        //         });

        //         // Clean up the created user if registration fails
        //         if (store.authUser?.additionalUserInfo?.isNewUser) {
        //             await store.authUser.user.delete();
        //         }

        //         logger.error(
        //             "Error signing up with email/password: " + (error.message || error),
        //             logger.templateMessages.STORE,
        //         );
        //     } finally {
        //         store.setIsAuthLoading(false);
        //         root.gui.setGlobalModalVisibility(false);
        //     }
        // },

        // onForgotPassword: async (email: string) => {
        //     store.setIsAuthLoading(true);

        //     try {
        //         root.gui.setGlobalModalVisibility(true);

        //         // Validate email with ZeroBounce before proceeding (non-blocking)
        //         try {
        //             const emailValidationService = createEmailValidationService();
        //             await emailValidationService.validateEmail(email);
        //             // Regardless of validity, proceed with sending reset email
        //         } catch (_) {
        //             // Fail silently
        //         }

        //         await auth.sendPasswordResetEmail(email);

        //         analyticsService.trackEvent({
        //             name: AnalyticsEvent.AUTH_PASSWORD_RESET,
        //             params: {
        //                 email
        //             }
        //         });

        //         root.gui.renderToast({
        //             text: "Password reset email sent. Please check your inbox.",
        //             type: "success",
        //             id: "forgot-password-success",
        //         });

        //     } catch (error: any) {
        //         store.setIsAuthLoading(false);
        //         root.gui.setGlobalModalVisibility(false);
                
        //         const errorType = getAuthErrorType(error.message);
        //         let errorMessage = getFirebaseAuthError(error.message) || "Failed to send password reset email. Please try again.";

        //         if (errorType === AuthErrorType.ACCOUNT_NOT_FOUND) {
        //             errorMessage = "No account found with this email address.";
        //         }

        //         root.gui.renderToast({
        //             text: errorMessage,
        //             type: "error",
        //             id: "forgot-password-error",
        //         });

        //         logger.error(
        //             "Error sending password reset email: " + (error.message || error),
        //             logger.templateMessages.STORE,
        //         );
        //     } finally {
        //         store.setIsAuthLoading(false);
        //         root.gui.setGlobalModalVisibility(false);
        //     }
        // },


        // onRegistrationSuccess: async () => {
        //     store.setIsAuthLoading(true);
        //     try {
        //         await root.profile.getUser();

        //         runInAction(() => {
        //             store.firebaseIdToken = store.firebaseIdTokenTemp;
        //         });

        //         root.gui.renderToast({
        //             text: root.gui.translate("you_are_welcome_to_booqar_ride"),
        //             type: "success",
        //             id: "welcome",
        //         });

        //         root.profile.init().then(() => {
        //             router.replace("/(guarded)/(drawer)/personal-info");
        //         }).finally(() => {
        //             store.setIsAuthLoading(false);
        //             root.gui.setGlobalModalVisibility(false);
        //         });
        //     } catch (error: any) {
        //         store.setIsAuthLoading(false);
        //         root.gui.setGlobalModalVisibility(false);
        //         root.gui.renderToast({
        //             text: root.gui.translate("error_signing_up_contact_support"),
        //             type: "error",
        //             id: "register-error",
        //         });
        //         logger.error(
        //             `Error onRegistrationSuccess user: ${error.message}`,
        //             logger.templateMessages.SERVICE
        //         );
        //     } finally {
        //         store.setIsAuthLoading(false);
        //         root.gui.setGlobalModalVisibility(false);
        //     }
        // },

        // loginUser: async (firebaseIdToken: string) => {
        //     try {
        //         root.gui.setGlobalModalVisibility(true);

        //         const response = await authService.loginUser(firebaseIdToken);

        //         await _setToken(response.token);

        //         runInAction(() => {
        //             root.profile.userInDb = response.data;
        //             store.currentUser = response.data;
        //             store.currentUserToken = response.token;
        //             store.loggedInUser = auth.currentUser;
        //             store.firebaseIdToken = firebaseIdToken;
        //         });

        //         analyticsService.trackEvent({
        //             name: AnalyticsEvent.AUTH_LOGIN,
        //             params: {
        //                 user_id: response.data?.id,
        //                 user_type: response.data?.type
        //             }
        //         });

        //         await analyticsService.startAnalyticsTracking(
        //             response.data?.id || '',
        //             response.data?.username,
        //             response.data?.email,
        //             response.data?.phone
        //         );

        //         root.profile.init().then(() => {
        //             // Check if personal info fields are missing
        //             const user = root.profile.userInDb;
        //             if (!user) {
        //                 router.replace("/(drawer)/dashboard" as any);
        //                 return;
        //             }
                    
        //             // Check for valid non-empty values
        //             const hasFirstName = user.firstName && typeof user.firstName === 'string' && user.firstName.trim().length > 0;
        //             const hasLastName = user.lastName && typeof user.lastName === 'string' && user.lastName.trim().length > 0;
        //             const hasEmail = user.email && typeof user.email === 'string' && user.email.trim().length > 0;
        //             const hasDateOfBirth = user.dateOfBirth !== null && user.dateOfBirth !== undefined && user.dateOfBirth !== '';
                    
        //             const isPersonalInfoIncomplete = !hasFirstName || !hasLastName || !hasEmail || !hasDateOfBirth;
                    
        //             if (isPersonalInfoIncomplete) {
        //                 router.replace("/(guarded)/(drawer)/personal-info" as any);
        //             } else {
        //                 router.replace("/(drawer)/dashboard" as any);
        //             }
                    
        //             root.gui.renderToast({
        //                 text: root.gui.translate("you_are_welcome_back_to_booqar_ride"),
        //                 type: "success",
        //                 id: "welcome-back",
        //             });
        //         });

        //     } catch (error: any) {
        //         root.gui.setGlobalModalVisibility(false);

        //         root.gui.renderToast({
        //             text: error?.response?.data?.message || "Login failed. Please try again.",
        //             type: "error",
        //             id: "login-failed",
        //         });
        //     } finally {
        //         root.gui.setGlobalModalVisibility(false);
        //     }
        // },

        // registerUser: async (firebaseIdToken: string, userData: any) => {
        //     try {
        //         root.gui.setGlobalModalVisibility(true);

        //         const response = await authService.registerUser(firebaseIdToken, userData);

        //         await _setToken(response.token);

        //         runInAction(() => {
        //             root.profile.userInDb = response.data;
        //             store.currentUser = response.data;
        //             store.currentUserToken = response.token;
        //             store.loggedInUser = auth.currentUser;
        //             store.firebaseIdToken = firebaseIdToken;
        //         });

        //         analyticsService.trackEvent({
        //             name: AnalyticsEvent.AUTH_REGISTER,
        //             params: {
        //                 user_id: response.data?.id,
        //                 user_type: response.data?.type || userData?.type
        //             }
        //         });

        //         if (userData?.referralCode || store.referralCode) {
        //             analyticsService.trackEvent({
        //                 name: AnalyticsEvent.REFERRAL_CODE_USED,
        //                 params: {
        //                     user_id: response.data?.id,
        //                     referral_code: userData?.referralCode || store.referralCode,
        //                 }
        //             });
        //         }

        //         await analyticsService.startAnalyticsTracking(
        //             response.data?.id || '',
        //             response.data?.username,
        //             response.data?.email,
        //             response.data?.phone
        //         );

        //         store.clearReferralCode();

        //         root.profile.init().then(() => {
        //             // Check if personal info fields are missing
        //             const user = root.profile.userInDb;
        //             if (!user) {
        //                 router.replace("/(drawer)/dashboard" as any);
        //                 return;
        //             }
                    
        //             // Check for valid non-empty values
        //             const hasFirstName = user.firstName && typeof user.firstName === 'string' && user.firstName.trim().length > 0;
        //             const hasLastName = user.lastName && typeof user.lastName === 'string' && user.lastName.trim().length > 0;
        //             const hasEmail = user.email && typeof user.email === 'string' && user.email.trim().length > 0;
        //             const hasDateOfBirth = user.dateOfBirth !== null && user.dateOfBirth !== undefined && user.dateOfBirth !== '';
                    
        //             const isPersonalInfoIncomplete = !hasFirstName || !hasLastName || !hasEmail || !hasDateOfBirth;
                    
        //             if (isPersonalInfoIncomplete) {
        //                 router.replace("/(guarded)/(drawer)/personal-info" as any);
        //             } else {
        //                 router.replace("/(drawer)/dashboard" as any);
        //             }
                    
        //             root.gui.renderToast({
        //                 text: root.gui.translate("welcome_to_booqar_driver"),
        //                 type: "success",
        //                 id: "welcome-new-user",
        //             });
        //         });

        //     } catch (error: any) {
        //         root.gui.setGlobalModalVisibility(false);

        //         root.gui.renderToast({
        //             text: error?.response?.data?.message || "Registration failed. Please try again.",
        //             type: "error",
        //             id: "register-failed",
        //         });
        //     } finally {
        //         root.gui.setGlobalModalVisibility(false);
        //     }
        // },

        // logoutUser: async () => {
        //     try {
        //         analyticsService.trackEvent({
        //             name: AnalyticsEvent.AUTH_LOGOUT,
        //             params: {
        //                 user_id: store.currentUser?.id
        //             }
        //         });

        //         await analyticsService.resetUserId();
        //         await auth.signOut();
        //         await destoryToken();
        //         await destoryStorage("@currentUser");
        //         // Don't clear userLoginEmail on logout - only clear on account deletion
        //         runInAction(() => {
        //             store.firebaseIdToken = "";
        //         });
        //         router.replace("/(onboarding)/phone-register" as any)
        //     } catch (error) {
        //         console.error("Error logging out user:", error);
        //     }
        // },

        // deleteCurrentUser: async () => {
        //     await auth.currentUser?.delete();
        // },

        setOnboardingSeen: async (value: boolean) => {
            runInAction(() => {
                store.onboardingSeen = !!value;
            });
            await SecureStore.setItemAsync(ONBOARDING_STORAGE_KEYS.ONBOARDING_SEEN, String(value));
        },

        setAuthStatus: async (value: AuthStatus) => {
            runInAction(() => {
                store.authStatus = value;
            });
            await SecureStore.setItemAsync(ONBOARDING_STORAGE_KEYS.AUTH_STATUS, value);
        },

        setRole: async (value: Role) => {
            runInAction(() => {
                store.role = value;
            });
            await SecureStore.setItemAsync(ONBOARDING_STORAGE_KEYS.ROLE, value);
        },

        setDriverOnboardingComplete: async (value: boolean) => {
            runInAction(() => {
                store.driverOnboardingComplete = !!value;
            });
            await SecureStore.setItemAsync(ONBOARDING_STORAGE_KEYS.DRIVER_ONBOARDING_COMPLETE, String(value));
        },

        continueAsGuest: async () => {
            await store.setAuthStatus('guest');
            await store.setRole('passenger');
            await store.setOnboardingSeen(true);
        },

        mockLoginPassenger: async () => {
            await store.setAuthStatus('loggedIn');
            await store.setRole('passenger');
            await store.setOnboardingSeen(true);
        },

        mockLoginDriver: async () => {
            await store.setAuthStatus('loggedIn');
            await store.setRole('driver');
            await store.setDriverOnboardingComplete(false);
            await store.setOnboardingSeen(true);
        },

        resetOnboarding: async () => {
            await store.setOnboardingSeen(false);
            await store.setAuthStatus('loggedOut');
            await store.setDriverOnboardingComplete(false);
        },

        // init: async () => {
        //     const savedUser = await getStorage("@currentUser");
        //     const savedToken = await getToken();
        //     if (savedUser && savedToken) {
        //         runInAction(() => {
        //             store.currentUser = JSON.parse(savedUser);
        //             store.currentUserToken = savedToken;
        //         });
        //     }

        //     // Check if Firebase user is still authenticated and restore token
        //     try {
        //         const currentUser = auth.currentUser;
        //         if (currentUser && !store.firebaseIdToken) {
        //             const token = await currentUser.getIdToken(false);
        //             runInAction(() => {
        //                 store.firebaseIdToken = token;
        //             });
        //         }
        //     } catch (error) {
        //         console.warn("Error checking Firebase auth state:", error);
        //     }
        // },

        //    _____                            _           _
        //   / ____|                          | |         | |
        //  | |     ___  _ __ ___  _ __  _   _| |_ ___  __| |
        //  | |    / _ \| '_ ` _ \| '_ \| | | | __/ _ \/ _` |
        //  | |___| (_) | | | | | | |_) | |_| | ||  __/ (_| |
        //   \_____\___/|_| |_| |_| .__/ \__,_|\__\___|\__,_|
        //                        | |
        //
    });
    runInAction(() => {
        store.isHydrated = true;
    });
    
    logger?.log(
        "Auth store initialized",
        logger.templateMessages.SERVICE
    );
    
    return store;
};

export type IAuthStore = ReturnType<typeof createAuthStore>;
