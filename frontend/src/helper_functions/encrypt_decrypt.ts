import CryptoJS from 'crypto-js';

const secretKey = import.meta.env.VITE_ENCRYPT_KEY || 'default-secret-key'; 
// Encrypt the plain text
export const encryptText = (plainText: string): string => {
    const encrypted = CryptoJS.AES.encrypt(plainText, secretKey).toString();
    return encrypted;
};

// Decrypt the encrypted text
export const decryptText = (encryptedText: string | null): string => {
    const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
};