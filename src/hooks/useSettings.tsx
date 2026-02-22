import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const SETTINGS_STORAGE_KEY = 'ssp_settings';

export interface UserSettings {
    currency: string;
    budgetCycle: 'monthly' | 'weekly';
    notifications: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
    currency: 'INR',
    budgetCycle: 'monthly',
    notifications: true,
};

export function useSettings() {
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const { toast } = useToast();

    useEffect(() => {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
            try {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
            } catch (e) {
                // ignore error
            }
        }
    }, []);

    const updateSettings = (newSettings: Partial<UserSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));

        toast({
            title: 'Settings saved',
            description: 'Your preferences have been updated.',
        });
    };

    return {
        settings,
        updateSettings,
    };
}
