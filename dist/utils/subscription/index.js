"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasActiveSubscription = void 0;
const AppError_1 = require("../errors/AppError");
const hasActiveSubscription = (req, type) => {
    if (!req.user) {
        throw new AppError_1.ValidationError("User not found");
    }
    if (req.user.isAdmin)
        return true;
    const { subscriptions } = req.user;
    const subscription = subscriptions.find((sub) => sub.type === type && sub.active && new Date(sub.endDate) > new Date());
    return !!subscription;
};
exports.hasActiveSubscription = hasActiveSubscription;
