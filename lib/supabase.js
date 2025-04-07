"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.supabase = void 0;
exports.signUpWithEmail = signUpWithEmail;
exports.signInWithEmail = signInWithEmail;
exports.signOut = signOut;
exports.getCurrentUser = getCurrentUser;
exports.updateUserProfile = updateUserProfile;
exports.uploadAvatar = uploadAvatar;
require("react-native-url-polyfill/auto");
var supabase_js_1 = require("@supabase/supabase-js");
var async_storage_1 = require("@react-native-async-storage/async-storage");
// Use environment variables for Supabase configuration with fallback values for development
var supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project-url.supabase.co';
var supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
// Log a warning if environment variables are not properly set
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Warning: Supabase environment variables are not properly configured. Using fallback values.');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: async_storage_1.default,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
// Helper functions for authentication
function signUpWithEmail(email, password) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, exports.supabase.auth.signUp({
                        email: email,
                        password: password,
                    })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    return [2 /*return*/, { data: data, error: error }];
            }
        });
    });
}
function signInWithEmail(email, password) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, exports.supabase.auth.signInWithPassword({
                        email: email,
                        password: password,
                    })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    return [2 /*return*/, { data: data, error: error }];
            }
        });
    });
}
function signOut() {
    return __awaiter(this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.supabase.auth.signOut()];
                case 1:
                    error = (_a.sent()).error;
                    return [2 /*return*/, { error: error }];
            }
        });
    });
}
function getCurrentUser() {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.supabase.auth.getUser()];
                case 1:
                    user = (_a.sent()).data.user;
                    return [2 /*return*/, user];
            }
        });
    });
}
// Function to update user profile
function updateUserProfile(userId, updates) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, exports.supabase
                        .from('profiles')
                        .update(updates)
                        .eq('id', userId)
                        .select()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    return [2 /*return*/, { data: data, error: error }];
            }
        });
    });
}
// Function to upload avatar to Supabase storage
function uploadAvatar(userId, avatarFile) {
    return __awaiter(this, void 0, void 0, function () {
        var fileName, _a, data, error, avatar_url, _b, profileData, profileError, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    fileName = "avatars/".concat(userId, "/").concat(avatarFile.name);
                    return [4 /*yield*/, exports.supabase.storage
                            .from('avatars')
                            .upload(fileName, avatarFile, {
                            cacheControl: '3600',
                            upsert: false
                        })];
                case 1:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error uploading avatar:', error);
                        return [2 /*return*/, { data: null, error: error }];
                    }
                    avatar_url = "".concat(process.env.EXPO_PUBLIC_SUPABASE_URL, "/storage/v1/object/public/avatars/").concat(fileName);
                    return [4 /*yield*/, updateUserProfile(userId, { avatar_url: avatar_url })];
                case 2:
                    _b = _c.sent(), profileData = _b.data, profileError = _b.error;
                    if (profileError) {
                        console.error('Error updating user profile:', profileError);
                        return [2 /*return*/, { data: null, error: profileError }];
                    }
                    return [2 /*return*/, { data: __assign(__assign({}, data), { avatar_url: avatar_url }), error: null }];
                case 3:
                    error_1 = _c.sent();
                    console.error('Unexpected error uploading avatar:', error_1);
                    return [2 /*return*/, { data: null, error: { message: error_1.message } }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
