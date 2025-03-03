"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInitDataMiddleware = void 0;
const parseInitDataMiddleware = (req, res, next) => {
    try {
        const initData = req.headers["init-data"];
        if (!initData)
            throw new Error("No initData provided");
        const decodedInitData = decodeURIComponent(initData);
        const params = new URLSearchParams(decodedInitData);
        const userStr = params.get("user");
        if (!userStr)
            throw new Error("No user data found");
        const userData = JSON.parse(userStr);
        if (!userData.id)
            throw new Error("Invalid user data");
        req.initData = {
            id: userData.id.toString(),
            username: userData.username,
            photo_url: userData.photo_url,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.parseInitDataMiddleware = parseInitDataMiddleware;
