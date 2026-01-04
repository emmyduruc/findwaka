import { autorun, makeAutoObservable, runInAction, toJS } from "mobx";
import { Href, router, Router } from "expo-router";
import { Share, ShareContent, ShareOptions } from "react-native";
// import {toast} from "sonner-native";
import { IRootStore } from "./root";
import { ILoggerService } from "@/services/logger";

export const createGuiStore = (
    root: IRootStore,
    logger: ILoggerService,
) => {
    const persist = async () => {
        try {
            const userNotifications = toJS(store.fcmToken);
            await storageService.setItem("gui.fmcToken", JSON.stringify(userNotifications));

            const isWalletBalanceVisible = toJS(store.isWalletBalanceVisible);
            await storageService.setItem("gui.walletBalanceVisible", JSON.stringify(isWalletBalanceVisible));
        } catch (error) {
            logger.error(
                `fails to perisit store items ${logger.templateMessages.METHOD}`
            );
        }
    };

    const hydrate = async () => {
        try {
            // const fcmToken = await storageService.getItem("gui.fmcToken");
            // if (fcmToken) {
            //     runInAction(() => {
            //         store.fcmToken = fcmToken;
            //     });
            // }

            // const isWalletBalanceVisible = await storageService.getItem("gui.walletBalanceVisible");
            // if (isWalletBalanceVisible) {
            //     runInAction(() => {
            //         store.isWalletBalanceVisible = isWalletBalanceVisible === "true";
            //     });
            // }
        } catch (error) {
            logger.error(
                `fails to hydrate store items ${logger.templateMessages.METHOD}`
            );
        }
    };

    const store = makeAutoObservable({
        //    ____  _                              _     _
        //   / __ \| |                            | |   | |
        //  | |  | | |__  ___  ___ _ ____   ____ _| |__ | | ___  ___
        //  | |  | | '_ \/ __|/ _ \ '__\ \ / / _` | '_ \| |/ _ \/ __|
        //  | |__| | |_) \__ \  __/ |   \ V / (_| | |_) | |  __/\__ \
        //   \____/|_.__/|___/\___|_|    \_/ \__,_|_.__/|_|\___||___/

        counter: 0,
        pairingLoadingInfo: {
            screeName: "",
            headline: "",
            subLine: "",
            noAutoTimeout: false,
        },
        isGlobalModalVisible: false,
        showCallScreen: false,
        isPairingLoading: false,
        showGlobalOTPModal: false,
        router: router as Router,
        fcmToken: "",
        isWalletBalanceVisible: false,
        selectedCarColor: null as string | null,
        selectedCarBrand: null as string | null,
        showPaystackWebview: false,
        isChatBotVisible: false,
        remoteConfig: null as null,
        showImagePickerModal: false,
        selectedImageUri: null as string | null,

        //    _____                            _           _
        //   / ____|                          | |         | |
        //  | |     ___  _ __ ___  _ __  _   _| |_ ___  __| |
        //  | |    / _ \| '_ ` _ \| '_ \| | | | __/ _ \/ _` |
        //  | |___| (_) | | | | | | |_) | |_| | ||  __/ (_| |
        //   \_____\___/|_| |_| |_| .__/ \__,_|\__\___|\__,_|
        //                        | |
        //

        //                _   _
        //      /\       | | (_)
        //     /  \   ___| |_ _  ___  _ __  ___
        //    / /\ \ / __| __| |/ _ \| '_ \/ __|
        //   / ____ \ (__| |_| | (_) | | | \__ \
        //  /_/    \_\___|\__|_|\___/|_| |_|___/

        // get GlobalLoader(): React.JSX.Element | null {
        //     if (!store.isGlobalModalVisible) return null;
        //     // return React.createElement(LoadingOverlay);
        // },

        // get PairingLoader(): React.JSX.Element | null {
        //     if (!store.isPairingLoading) return null;
        //     return React.createElement(ProgressBar);
        // },

        //                _   _
        //      /\       | | (_)
        //     /  \   ___| |_ _  ___  _ __  ___
        //    / /\ \ / __| __| |/ _ \| '_ \/ __|
        //   / ____ \ (__| |_| | (_) | | | \__ \
        //  /_/    \_\___|\__|_|\___/|_| |_|___/

        navigate: (screen: Href, params?: any) => {
            // Prevent navigation with undefined or invalid routes
            if (!screen) {
                console.warn("[GUI Store] Attempted to navigate with undefined screen");
                return;
            }
            
            try {
                // navigation.navigate(screen, params); //Replace with route callback
                store.router.navigate(screen);
                
                // analyticsService.trackScreenView(screen.toString());
                
                // analyticsService.trackEvent({
                //     name: AnalyticsEvent.GUI_SCREEN_VIEW,
                //     params: {
                //         screen_name: screen.toString()
                //     }
                // });
            } catch (error) {
                console.error("[GUI Store] Navigation error:", error, "Screen:", screen);
            }
        },

        goBack: () => {
            store.router.back();
        },

        goNext: (path: Href) => {
            store.navigate(path);
        },

        setWalletBalanceVisible: (visible: boolean) => {
            runInAction(() => {
                store.isWalletBalanceVisible = visible;
            })
        },

        selectCarBrand: (value: string | null) => {
            runInAction(() => {
                store.selectedCarBrand = value;
            })
        },

        selectCarColor: (value: string | null) => {
            runInAction(() => {
                store.selectedCarColor = value;
            })
        },

        setShowCallScreen: (value: boolean) => {
            runInAction(() => {
                store.showCallScreen = value;
            })
        },

        // Bottom Tab Navigation State
        activeBottomTabIndex: -1 as number, // -1 means no active tab (dashboard), 0-3 for tabs

        setActiveBottomTabIndex: (index: number) => {
            runInAction(() => {
                store.activeBottomTabIndex = index;
            })
        },

        toggleShowPaystackWebview: (value: boolean) => {
            runInAction(() => {
                store.showPaystackWebview = value;
            })
        },

        setIsChatBotVisible: (value: boolean) => {
            // runInAction(() => {
            //     store.isChatBotVisible = value;
                
            //     if (value) {
            //         analyticsService.trackHelpChatOpened();
            //         analyticsService.trackEvent({
            //             name: AnalyticsEvent.GUI_HELP_CHAT_OPENED,
            //             params: {
            //                 user_id: root.profile.userInDb?.id
            //             }
            //         });
            //     }
            // });
        },

        setRemoteConfig: (config:null) => {
            runInAction(() => {
                store.remoteConfig = config;
            });
        },

        setShowImagePickerModal: (visible: boolean) => {
            runInAction(() => {
                store.showImagePickerModal = visible;
            });
        },

        setSelectedImageUri: (uri: string | null) => {
            runInAction(() => {
                store.selectedImageUri = uri;
            });
        },

        // get renderChatBot(): React.JSX.Element {
        //     if (!root.profile.userInDb) {
        //         return React.createElement(React.Fragment);
        //     }
            
        //     const { id, firstName, lastName, email, image } = root.profile.userInDb;

        //     const customAttributes = {
        //         accountId: id,
        //         pricingPlan: "paid",
        //         status: "active",
        //     };
            
        //     const websiteToken = process.env.EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN || "";
        //     const baseUrl = process.env.EXPO_PUBLIC_CHATWOOT_BASE_URL || "";
        //     const locale = translation.getLocale() || "en";
        //     const colorScheme = "dark" as const;

        //     return React.createElement(
        //         React.Fragment,
        //         null,
        //         store.isChatBotVisible && websiteToken && baseUrl && React.createElement(ChatWootWidget, {
        //             websiteToken: websiteToken,
        //             locale: locale,
        //             baseUrl: baseUrl,
        //             closeModal: () => store.setIsChatBotVisible(false),
        //             isModalVisible: store.isChatBotVisible,
        //             user: {
        //                 identifier: id,
        //                 name: `${firstName} ${lastName}`,
        //                 avatar_url: image || undefined,
        //                 email: email || undefined,
        //             },
        //             customAttributes: customAttributes,
        //             colorScheme: colorScheme,
        //         })
        //     );
        // },

        renderToast: () => {
        },

        translate: (key: string, options?: any) => {
            // return translation.translate(key, options);
        },

        setGlobalModalVisibility: (isVisible: boolean) => {
            runInAction(() => {
                store.isGlobalModalVisible = isVisible;
                
                if (isVisible) {
                    setTimeout(() => {
                        if (store.isGlobalModalVisible) {
                            console.log("Global loading timeout reached, automatically turning off");
                            runInAction(() => {
                                store.isGlobalModalVisible = false;
                            });
                        }
                    }, 60000);
                }
            });
        },

        setGlobalOTPModalVisibility: (isVisible: boolean) => {
            runInAction(() => {
                store.showGlobalOTPModal = isVisible;
            });
        },

        setPairingLoading: (isVisible: boolean) => {
            runInAction(() => {
                store.isPairingLoading = isVisible;
            });
        },

        shareDataOptions: async (content: ShareContent, option?: ShareOptions) => {
            if (!content) {
                return;
            }
            try {
                const shareOptions = {
                    dialogTitle: store.translate("share"),
                    ...option,
                };
                if (
                    ("url" in content &&
                        content?.url &&
                        content?.url?.endsWith(".jpg")) ||
                    ("url" in content && content?.url?.endsWith(".png"))
                ) {
                    await Share.share({
                        ...shareOptions,
                        url: content?.url,
                        // title: store.translate("share") || "Share",
                    });
                } else {
                    await Share.share({...content, ...shareOptions}).catch((error) => {
                        logger.error(error, `${logger.templateMessages.METHOD}`);
                    });
                }
            } catch (error) {
                logger.error(
                    JSON.stringify(error),
                    `${logger.templateMessages.METHOD}`
                );
            }
        },

        subscribeForPushNotification: async () => {
            await store.requestNotificationPermission()
            // return notificationService.onNotificationChangeListener(store.handleNotification);
        },


        handleNotification: (message: any) => {
            // if (!root.profile.userInDb) return;

            // analyticsService.trackEvent({
            //     name: AnalyticsEvent.GUI_NOTIFICATION_RECEIVED,
            //     params: {
            //         notification_type: message?.data?.$event || 'unknown'
            //     }
            // });

            // let event = message?.data?.$event as string | undefined;

            // if (event) {
            //     if (event?.startsWith("RIDE") || event?.startsWith("BOOKING")) {
            //         root.booking.getOngoingRide().then();
            //         return;
            //     }

            //     if (event?.startsWith("WALLET")) {
            //         return root.gui.navigate("/(guarded)/wallet-stack");
            //     }

            //     if (event?.startsWith("MESSAGE") && message?.data?.chatId) {
            //         return root.chat.getChat(message.data?.chatId);
            //     }
            // }

            // return root.gui.navigate(`/(drawer)/notification` as any);
        },

        requestNotificationPermission: async () => {
            // const hasPermission = await notificationService.requestUserPermission();

            // if (hasPermission) {
            //     await notificationService.registerDeviceForRemoteMessages();

            //     let fcmToken = root.profile.userInDb?.pushNotificationToken;
            //     let currentFcmToken = await notificationService.getFcmToken();

            //     if (!fcmToken || currentFcmToken !== fcmToken) {
            //         await root.profile.handleUpdateProfile({
            //             pushNotificationToken: currentFcmToken,
            //         }, true);
            //     }

            //     console.log("=======> FCM TOKEN: ", currentFcmToken);
            //     runInAction(() => {
            //         store.fcmToken = currentFcmToken!;
            //     });
            // }
        },

        openPhoneDialer: async (phoneNumber: string | null | undefined) => {
        
            // if (!phoneNumber) {
            //     Alert.alert(
            //         store.translate("phone_number_not_available") || "Phone Number Not Available",
            //         store.translate("unable_to_find_phone_number") || "Unable to find phone number for this passenger."
            //     );
            //     return;
            // }

            // Format phone number - if it already starts with +, use as is, otherwise format it
            // const formattedPhone = phoneNumber.startsWith('+') 
            //     ? phoneNumber 
            //     : formatToE164(phoneNumber);
            // const phoneUrl = `tel:${formattedPhone}`;
            
            // try {
            //     const canOpen = await Linking.canOpenURL(phoneUrl);
            //     if (canOpen) {
            //         await Linking.openURL(phoneUrl);
            //     } else {
            //         Alert.alert(
            //             store.translate("cannot_make_call") || "Cannot Make Call",
            //             store.translate("device_cannot_make_calls") || "Your device cannot make phone calls."
            //         );
            //     }
            // } catch (error) {
            //     console.error("Error opening phone dialer:", error);
            //     Alert.alert(
            //         store.translate("error") || "Error",
            //         store.translate("unable_to_open_dialer") || "Unable to open phone dialer. Please try again."
            //     );
            // }
        },

        init: async () => {},
    });
    hydrate().then(() => {
        logger?.log(
            "GUI store Hydrated successfully",
            logger.templateMessages.SERVICE
        );
        autorun(() => {
            persist();
        });
    });
    return store;
};

export type IGuiStore = ReturnType<typeof createGuiStore>;
