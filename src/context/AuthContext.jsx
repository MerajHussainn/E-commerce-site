import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState("login");
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Check for redirect login result if popup was not used
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const u = result.user;
          try {
            const userDocRef = doc(db, "users", u.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
              await setDoc(
                userDocRef,
                {
                  uid: u.uid,
                  name: u.displayName || "User",
                  email: u.email,
                  createdAt: serverTimestamp(),
                },
                { merge: true }
              );
            }
          } catch (_) {}
          toast.success("Welcome back!");
        }
      })
      .catch((err) => {
        console.warn("Redirect auth check:", err);
      });

    return () => unsubscribe();
  }, []);

  // ✅ ADD THIS FUNCTION
  const openAuthModal = (type = "login", action = null) => {
    if (action) {
      setPendingAction(action);
    }
    setAuthModalType(type);
    setShowAuthModal(true);
  };

  const requireAuth = (actionType, actionCallback) => {
    if (!user) {
      setPendingAction({
        type: actionType,
        callback: actionCallback,
      });
      setAuthModalType("login");
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const executePendingAction = () => {
    if (pendingAction && user) {
      pendingAction.callback();
      toast.success(
        `${
          pendingAction.type === "addToCart"
            ? "Added to cart"
            : "Purchase"
        } successful!`
      );
      setPendingAction(null);
    }
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setPendingAction(null);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Google Login (Popup with Redirect fallback for mobile WebViews)
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError) {
        console.warn("Popup blocked or unsupported in WebView, using redirect:", popupError);
        await signInWithRedirect(auth, provider);
        return null;
      }

      if (result && result.user) {
        const u = result.user;
        try {
          const userDocRef = doc(db, "users", u.uid);
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            await setDoc(
              userDocRef,
              {
                uid: u.uid,
                name: u.displayName || "User",
                email: u.email,
                createdAt: serverTimestamp(),
              },
              { merge: true }
            );
          }
        } catch (_) {}
        toast.success("Welcome to Mushroom Mart!");
      }
      return result;
    } catch (error) {
      toast.error(error.message || "Google login failed.");
      throw error;
    }
  };

  // Signup with immediate session persistence & graceful Firestore sync
  const signup = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      try {
        await updateProfile(firebaseUser, {
          displayName: name,
        });
      } catch (e) {
        console.warn("Profile displayName update failed:", e);
      }

      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        await setDoc(
          userDocRef,
          {
            uid: firebaseUser.uid,
            name: name,
            email: email,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn("Firestore profile sync failed:", e);
      }

      try {
        sendEmailVerification(firebaseUser).catch(() => {});
      } catch (_) {}

      toast.success("Welcome to Mushroom Mart! You are now logged in.");
      return userCredential;
    } catch (error) {
      toast.error(error.message || "Signup failed.");
      throw error;
    }
  };

  const forgotPassword = (email) => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return Promise.reject("No email provided");
    }
    toast.loading("Sending reset link...");
    return sendPasswordResetEmail(auth, email)
      .then(() => {
        toast.dismiss();
        toast.success("Password reset link sent to your email!");
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.message || "Failed to send link.");
        throw error;
      });
  };

  const sendPasswordUpdateLink = () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      toast.error("Could not find user email.");
      return Promise.reject("No user email found");
    }

    toast.loading("Sending update link...");
    return sendPasswordResetEmail(auth, currentUser.email)
      .then(() => {
        toast.dismiss();
        toast.success(
          "Password update link sent to your email! Please check your inbox."
        );
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.message || "Failed to send link.");
        throw error;
      });
  };

  const resendVerificationEmail = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      toast.loading("Sending verification link...");
      return sendEmailVerification(currentUser)
        .then(() => {
          toast.dismiss();
          toast.success("Verification link sent! Please check your inbox.");
        })
        .catch((error) => {
          toast.dismiss();
          toast.error(error.message);
        });
    } else {
      toast.error("Please log in first to resend verification.");
      return Promise.reject("No user found to resend verification");
    }
  };

  // ✅ UPDATED LOGOUT FUNCTION
  const logout = () => {
    localStorage.removeItem("dairyCart");
    toast.success("Logged out successfully. Cart cleared.");
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    handleGoogleLogin,
    logout,
    forgotPassword,
    resendVerificationEmail,
    sendPasswordUpdateLink,
    requireAuth,
    executePendingAction,
    showAuthModal,
    authModalType,
    openAuthModal,
    closeAuthModal,
    pendingAction,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
