"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkExpiredSubscriptions = void 0;
const prismaClient_1 = require("../prisma/prismaClient");
const AppError_1 = require("../utils/errors/AppError");
// Мидлвар для проверки просроченных подписок
const checkExpiredSubscriptions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return next(new AppError_1.ValidationError("User not found"));
    }
    const { subscriptions } = req.user;
    // Получаем текущую дату
    const currentDate = new Date();
    // Проходимся по подпискам пользователя
    for (const subscription of subscriptions) {
        // Проверяем, если дата окончания подписки меньше текущей даты и подписка активна
        if (new Date(subscription.endDate) < currentDate && subscription.active) {
            // Обновляем подписку, устанавливая её как неактивную
            yield prismaClient_1.prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    active: false,
                },
            });
        }
    }
    // Продолжаем выполнение следующего мидлвара или маршрута
    next();
});
exports.checkExpiredSubscriptions = checkExpiredSubscriptions;
