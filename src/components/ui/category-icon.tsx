import { ShoppingBag, Coffee, Home, Car, Zap, Smartphone, Utensils, Plane, Gift, GraduationCap, HeartPulse, HelpCircle, Briefcase, DollarSign, PiggyBank, TrendingUp } from 'lucide-react';

export const getCategoryIcon = (category: string) => {
    const lower = category ? category.toLowerCase() : '';
    if (lower.includes('shop') || lower.includes('clothes')) return <ShoppingBag className="h-4 w-4" />;
    if (lower.includes('food') || lower.includes('eat') || lower.includes('restaurant')) return <Utensils className="h-4 w-4" />;
    if (lower.includes('coffee')) return <Coffee className="h-4 w-4" />;
    if (lower.includes('home') || lower.includes('rent') || lower.includes('bill')) return <Home className="h-4 w-4" />;
    if (lower.includes('transport') || lower.includes('car') || lower.includes('fuel')) return <Car className="h-4 w-4" />;
    if (lower.includes('utility') || lower.includes('electric') || lower.includes('water')) return <Zap className="h-4 w-4" />;
    if (lower.includes('phone') || lower.includes('internet')) return <Smartphone className="h-4 w-4" />;
    if (lower.includes('travel') || lower.includes('trip')) return <Plane className="h-4 w-4" />;
    if (lower.includes('gift') || lower.includes('donation')) return <Gift className="h-4 w-4" />;
    if (lower.includes('education') || lower.includes('course')) return <GraduationCap className="h-4 w-4" />;
    if (lower.includes('health') || lower.includes('medical') || lower.includes('doctor')) return <HeartPulse className="h-4 w-4" />;
    if (lower.includes('salary') || lower.includes('income') || lower.includes('job')) return <Briefcase className="h-4 w-4" />;
    if (lower.includes('invest') || lower.includes('stock')) return <TrendingUp className="h-4 w-4" />;
    if (lower.includes('save') || lower.includes('deposit')) return <PiggyBank className="h-4 w-4" />;
    return <HelpCircle className="h-4 w-4" />;
};
