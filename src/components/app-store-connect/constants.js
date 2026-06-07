/**
 * constants.js — shared constants for the App Store Connect module.
 *
 * Extracted from AppStoreConnect.jsx so this value stays in sync with
 * SubscriptionManager and the sidebar ConfigDialog which all use the
 * same encrypted key storage slot.
 */

/**
 * localStorage key for the encrypted private key cipher-text.
 * Must match the value used in:
 *   - src/components/sidebar/ConfigDialog.jsx
 *   - src/components/subscription-manager/constants.js
 */
export const ENCRYPTED_KEY_STORAGE = 'asc-encrypted-p8-key'
