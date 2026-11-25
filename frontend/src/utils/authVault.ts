export interface VaultAccount {
  name: string;
  email: string;
  pwdHash: string;
  institution?: string;
  role?: string;
  createdAt: string;
}

const VAULT_KEY = 'paperinsight_accounts_vault';

async function sha256(str: string): Promise<string> {
  try {
    const enc = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    // Fallback for non-secure contexts
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }
}

export const authVault = {
  getVault(): Record<string, VaultAccount> {
    try {
      const raw = localStorage.getItem(VAULT_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  async saveAccount(data: {
    name: string;
    email: string;
    password: string;
    institution?: string;
    role?: string;
  }): Promise<void> {
    const vault = this.getVault();
    const cleanEmail = data.email.toLowerCase().trim();
    const pwdHash = await sha256(data.password);

    vault[cleanEmail] = {
      name: data.name.trim(),
      email: cleanEmail,
      pwdHash,
      institution: data.institution || 'Academic Institution',
      role: data.role || 'Researcher',
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
    } catch (e) {
      console.warn('LocalStorage quota reached when saving account to vault:', e);
    }
  },

  hasAccount(email: string): boolean {
    const cleanEmail = email.toLowerCase().trim();
    return !!this.getVault()[cleanEmail];
  },

  getAccount(email: string): VaultAccount | null {
    const cleanEmail = email.toLowerCase().trim();
    return this.getVault()[cleanEmail] || null;
  },

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const account = this.getAccount(email);
    if (!account) return false;
    const hash = await sha256(password);
    return hash === account.pwdHash;
  },
};
