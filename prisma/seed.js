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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminPassword, kapilPassword, kisuPassword, adminEmployee, kapilEmployee, kisuEmployee;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bcryptjs_1.default.hash("admin@123", 10)];
                case 1:
                    adminPassword = _a.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("kapil@123", 10)];
                case 2:
                    kapilPassword = _a.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("kisu@123", 10)];
                case 3:
                    kisuPassword = _a.sent();
                    return [4 /*yield*/, prisma.employee.create({
                            data: {
                                firstName: "Admin",
                                lastName: "User",
                                email: "admin@gmail.com",
                                originalEmail: "admin@gmail.com",
                                phone: "1234567890",
                                position: "Administrator",
                                status: "Active",
                                branchDept: {
                                    create: {
                                        branch: { create: { name: "Head Office" } },
                                        department: { create: { name: "Admin Department" } },
                                    },
                                },
                                user: {
                                    create: {
                                        email: "admin@gmail.com",
                                        originalEmail: "admin@gmail.com",
                                        password: adminPassword,
                                        role: "ADMIN",
                                    },
                                },
                            },
                        })];
                case 4:
                    adminEmployee = _a.sent();
                    return [4 /*yield*/, prisma.employee.create({
                            data: {
                                firstName: "Kapil",
                                lastName: "Sharma",
                                email: "kapil@gmail.com",
                                originalEmail: "kapil@gmail.com",
                                phone: "9876543210",
                                position: "Employee",
                                status: "Active",
                                branchDept: {
                                    create: {
                                        branch: { create: { name: "Main Branch" } },
                                        department: { create: { name: "Engineering" } },
                                    },
                                },
                                user: {
                                    create: {
                                        email: "kapil@gmail.com",
                                        originalEmail: "kapil@gmail.com",
                                        password: kapilPassword,
                                        role: "EMPLOYEE",
                                    },
                                },
                            },
                        })];
                case 5:
                    kapilEmployee = _a.sent();
                    return [4 /*yield*/, prisma.employee.create({
                            data: {
                                firstName: "Kisu",
                                lastName: "Patel",
                                email: "kisu@gmail.com",
                                originalEmail: "kisu@gmail.com",
                                phone: "9123456780",
                                position: "HR",
                                status: "Active",
                                branchDept: {
                                    create: {
                                        branch: { create: { name: "HR Branch" } },
                                        department: { create: { name: "Human Resources" } },
                                    },
                                },
                                user: {
                                    create: {
                                        email: "kisu@gmail.com",
                                        originalEmail: "kisu@gmail.com",
                                        password: kisuPassword,
                                        role: "HR",
                                    },
                                },
                            },
                        })];
                case 6:
                    kisuEmployee = _a.sent();
                    console.log("Seeding completed!");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
