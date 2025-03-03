"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const isAdmin_1 = require("../middleware/isAdmin");
const index_1 = require("../controllers/folders/index");
/**
 * @swagger
 * tags:
 *   name: Folders
 *   description: Папки
 */
const router = (0, express_1.Router)();
// Важен порядок маршрутов!
// Сначала конкретные маршруты
router.get("/:id", index_1.getFolderById); // Этот маршрут должен быть после getFolders
router.get("/", index_1.getFolders);
router.post("/", isAdmin_1.isAdmin, index_1.createFolder);
router.put("/:id", isAdmin_1.isAdmin, index_1.updateFolder);
router.delete("/:id", isAdmin_1.isAdmin, index_1.deleteFolder);
exports.default = router;
