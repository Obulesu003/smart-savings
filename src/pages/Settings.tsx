import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod'; // zod is already in dependencies
import { zodResolver } from '@hookform/resolvers/zod';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const settingsSchema = z.object({
    fullName: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    currency: z.string(),
    budgetCycle: z.enum(["monthly", "weekly"]),
    notifications: z.boolean(),
});

export default function Settings() {
    const { settings, updateSettings } = useSettings();
    const { user } = useAuth();

    // Create a form with default values from settings and user
    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            fullName: user?.user_metadata?.full_name || '',
            currency: settings.currency,
            budgetCycle: settings.budgetCycle,
            notifications: settings.notifications,
        },
    });

    // Update form when settings/user load
    useEffect(() => {
        if (user || settings) {
            form.reset({
                fullName: user?.user_metadata?.full_name || '',
                currency: settings.currency,
                budgetCycle: settings.budgetCycle,
                notifications: settings.notifications,
            });
        }
    }, [settings, user, form]);

    function onSubmit(data: z.infer<typeof settingsSchema>) {
        updateSettings({
            currency: data.currency,
            budgetCycle: data.budgetCycle,
            notifications: data.notifications,
        });

        // Note: Updating user profile name would require updating the Auth context/storage too.
        // For this prototype, we'll assume the settings hook handles the preferences.
        // If we wanted to update the name, we'd need an updateProfile method in useAuth.

        toast.success("Settings updated successfully");
    }

    return (
        <MainLayout>
            <div className="container max-w-2xl py-8">
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Settings
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Profile & Preferences</CardTitle>
                        <CardDescription>
                            Update your personal information and application preferences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                This is your display name.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Currency</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select currency" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="USD">USD ($)</SelectItem>
                                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                                        <SelectItem value="INR">INR (₹)</SelectItem>
                                                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Select your preferred currency for display.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="budgetCycle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Budget Cycle</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select cycle" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="monthly">Monthly</SelectItem>
                                                        <SelectItem value="weekly">Weekly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    How often do you want to track your budget?
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="notifications"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    Budget Alerts
                                                </FormLabel>
                                                <FormDescription>
                                                    Receive alerts when you approach your budget limits.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit">Save Changes</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
