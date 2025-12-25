
import { ref, get, set, update, runTransaction, push, onValue, off } from "firebase/database";
import { db } from "../firebaseConfig";
import { UserProfile, Transaction, UpiMapping } from "../types";

const INITIAL_BONUS = 30;

export const createOrUpdateUser = async (uid: string, email: string, displayName: string): Promise<UserProfile> => {
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    // Generate a unique UPI ID based on email prefix or random string
    const cleanEmail = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const upiId = `${cleanEmail}${Math.floor(1000 + Math.random() * 9000)}@skypay`;

    const newUser: UserProfile = {
      uid,
      displayName,
      email,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
      upiId,
      balance: INITIAL_BONUS,
      createdAt: Date.now(),
    };

    // Save user data
    await set(userRef, newUser);
    
    // Create UPI ID mapping for easy search
    await set(ref(db, `upiMappings/${upiId.replace('.', '_')}`), {
      uid,
      displayName
    });

    // Log the bonus transaction
    const transRef = push(ref(db, `transactions/${uid}`));
    // Fixed: Added status property to bonus transaction
    const bonusTrans: Transaction = {
      id: transRef.key!,
      fromUid: 'SYSTEM',
      fromName: 'SkyPay Rewards',
      toUid: uid,
      toName: displayName,
      amount: INITIAL_BONUS,
      type: 'BONUS',
      timestamp: Date.now(),
      note: 'Welcome Bonus',
      status: 'SUCCESS'
    };
    await set(transRef, bonusTrans);

    return newUser;
  }

  return snapshot.val() as UserProfile;
};

export const getUserByUpiId = async (upiId: string): Promise<UpiMapping | null> => {
  const normalizedUpi = upiId.toLowerCase().replace('.', '_');
  const mappingRef = ref(db, `upiMappings/${normalizedUpi}`);
  const snapshot = await get(mappingRef);
  if (snapshot.exists()) {
    return snapshot.val() as UpiMapping;
  }
  return null;
};

export const sendMoney = async (
  fromUid: string, 
  toUpiId: string, 
  amount: number, 
  note: string = ''
): Promise<{ success: boolean; message: string }> => {
  if (amount <= 0) return { success: false, message: "Invalid amount" };

  const targetMapping = await getUserByUpiId(toUpiId);
  if (!targetMapping) return { success: false, message: "UPI ID not found" };

  const toUid = targetMapping.uid;
  if (fromUid === toUid) return { success: false, message: "Cannot send money to yourself" };

  const fromUserRef = ref(db, `users/${fromUid}`);
  const toUserRef = ref(db, `users/${toUid}`);

  try {
    // Perform balance transfer using transactions for atomicity
    const result = await runTransaction(fromUserRef, (userData) => {
      if (userData) {
        if (userData.balance >= amount) {
          userData.balance -= amount;
          return userData;
        }
      }
      return undefined; // Abort
    });

    if (!result.committed) {
      return { success: false, message: "Insufficient balance" };
    }

    // Increment receiver's balance
    await runTransaction(toUserRef, (userData) => {
      if (userData) {
        userData.balance = (userData.balance || 0) + amount;
      }
      return userData;
    });

    // Record transactions for both parties
    const fromName = result.snapshot.val().displayName;
    const toName = targetMapping.displayName;

    // Fixed: Added status property to transaction data
    const transactionData: Omit<Transaction, 'id' | 'type'> = {
      fromUid,
      fromName,
      toUid,
      toName,
      amount,
      timestamp: Date.now(),
      note,
      upiId: toUpiId,
      status: 'SUCCESS'
    };

    const transRefFrom = push(ref(db, `transactions/${fromUid}`));
    const transRefTo = push(ref(db, `transactions/${toUid}`));

    // Added non-null assertion for keys and ensured type consistency
    await set(transRefFrom, { ...transactionData, id: transRefFrom.key!, type: 'DEBIT' });
    await set(transRefTo, { ...transactionData, id: transRefTo.key!, type: 'CREDIT' });

    return { success: true, message: "Payment Successful" };
  } catch (error) {
    console.error("Transfer Error:", error);
    return { success: false, message: "Payment failed. Please try again." };
  }
};

export const subscribeToTransactions = (uid: string, callback: (transactions: Transaction[]) => void) => {
  const transRef = ref(db, `transactions/${uid}`);
  const listener = onValue(transRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list = Object.values(data) as Transaction[];
      callback(list.sort((a, b) => b.timestamp - a.timestamp));
    } else {
      callback([]);
    }
  });
  return () => off(transRef, 'value', listener);
};

export const subscribeToUserProfile = (uid: string, callback: (user: UserProfile) => void) => {
  const userRef = ref(db, `users/${uid}`);
  const listener = onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as UserProfile);
    }
  });
  return () => off(userRef, 'value', listener);
};
