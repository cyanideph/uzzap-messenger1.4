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
exports.commands = void 0;
exports.processCommand = processCommand;
// Command: Help
var helpCommand = {
    name: 'help',
    description: 'Shows available commands and usage',
    usage: '/help [command]',
    execute: function (request, supabase) { return __awaiter(void 0, void 0, void 0, function () {
        var commandName_1, command, response;
        return __generator(this, function (_a) {
            if (request.args && request.args.length > 0) {
                commandName_1 = request.args[0].toLowerCase();
                command = exports.commands.find(function (cmd) { return cmd.name === commandName_1; });
                if (command) {
                    return [2 /*return*/, "**".concat(command.name, "**: ").concat(command.description, "\nUsage: ").concat(command.usage)];
                }
                else {
                    return [2 /*return*/, "Command not found: ".concat(commandName_1, "\nType /help to see all available commands.")];
                }
            }
            response = '**UzZap Bot Commands**\n\n';
            exports.commands.forEach(function (command) {
                response += "**/".concat(command.name, "** - ").concat(command.description, "\n");
            });
            response += '\nFor more details about a specific command, type /help [command]';
            return [2 /*return*/, response];
        });
    }); }
};
// Command: Info
var infoCommand = {
    name: 'info',
    description: 'Shows information about UzZap messenger',
    usage: '/info',
    execute: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, "**UzZap Messenger**\n\nUzZap is a Filipino chat application that connects people across different regions of the Philippines. Features include:\n\n- Regional chatrooms for local communities\n- Direct messaging between users\n- User profiles and follow system\n- Real-time messaging via Supabase\n\nVersion: 1.4\nCreated: 2025"];
        });
    }); }
};
// Command: Weather
var weatherCommand = {
    name: 'weather',
    description: 'Shows weather forecast for a location',
    usage: '/weather [location]',
    execute: function (request) { return __awaiter(void 0, void 0, void 0, function () {
        var location, conditions, randomCondition, temperature, humidity;
        return __generator(this, function (_a) {
            if (!request.args || request.args.length === 0) {
                return [2 /*return*/, 'Please specify a location. Usage: /weather [location]'];
            }
            location = request.args.join(' ');
            conditions = [
                'Sunny', 'Partly cloudy', 'Cloudy', 'Light rain', 'Heavy rain',
                'Thunderstorms', 'Clear skies', 'Foggy', 'Windy'
            ];
            randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
            temperature = Math.floor(Math.random() * 10) + 25;
            humidity = Math.floor(Math.random() * 30) + 60;
            return [2 /*return*/, "**Weather for ".concat(location, "**\n\nCondition: ").concat(randomCondition, "\nTemperature: ").concat(temperature, "\u00B0C\nHumidity: ").concat(humidity, "%\n\n_Note: This is simulated data for demonstration purposes._")];
        });
    }); }
};
// Command: Stats
var statsCommand = {
    name: 'stats',
    description: 'Shows statistics about UzZap usage',
    usage: '/stats',
    execute: function (request, supabase) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, userCount, userError, _b, chatroomCount, chatroomError, _c, messageCount, messageError, _d, onlineCount, onlineError, error_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('*', { count: 'exact', head: true })];
                case 1:
                    _a = _e.sent(), userCount = _a.count, userError = _a.error;
                    if (userError)
                        throw userError;
                    return [4 /*yield*/, supabase
                            .from('chatrooms')
                            .select('*', { count: 'exact', head: true })];
                case 2:
                    _b = _e.sent(), chatroomCount = _b.count, chatroomError = _b.error;
                    if (chatroomError)
                        throw chatroomError;
                    return [4 /*yield*/, supabase
                            .from('messages')
                            .select('*', { count: 'exact', head: true })];
                case 3:
                    _c = _e.sent(), messageCount = _c.count, messageError = _c.error;
                    if (messageError)
                        throw messageError;
                    return [4 /*yield*/, supabase
                            .from('users')
                            .select('*', { count: 'exact', head: true })
                            .eq('is_online', true)];
                case 4:
                    _d = _e.sent(), onlineCount = _d.count, onlineError = _d.error;
                    if (onlineError)
                        throw onlineError;
                    return [2 /*return*/, "**UzZap Statistics**\n\nTotal Users: ".concat(userCount || 0, "\nChatrooms: ").concat(chatroomCount || 0, "\nMessages Sent: ").concat(messageCount || 0, "\nUsers Online: ").concat(onlineCount || 0)];
                case 5:
                    error_1 = _e.sent();
                    console.error('Error fetching stats:', error_1);
                    return [2 /*return*/, 'Sorry, I encountered an error while fetching statistics. Please try again later.'];
                case 6: return [2 /*return*/];
            }
        });
    }); }
};
// Command: Profile
var profileCommand = {
    name: 'profile',
    description: 'Shows user profile information',
    usage: '/profile [username]',
    execute: function (request, supabase) { return __awaiter(void 0, void 0, void 0, function () {
        var targetUsername, targetUserId, _a, data, error, _b, data, error, _c, profile, profileError, _d, followerCount, followerError, _e, followingCount, followingError, joinDate, error_2;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 8, , 9]);
                    targetUsername = void 0;
                    targetUserId = void 0;
                    if (!(request.args && request.args.length > 0)) return [3 /*break*/, 2];
                    // Get profile by specified username
                    targetUsername = request.args[0];
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('id')
                            .eq('username', targetUsername)
                            .single()];
                case 1:
                    _a = _f.sent(), data = _a.data, error = _a.error;
                    if (error || !data) {
                        return [2 /*return*/, "User not found: ".concat(targetUsername)];
                    }
                    targetUserId = data.id;
                    return [3 /*break*/, 4];
                case 2:
                    // Get profile of the requesting user
                    targetUserId = request.userId;
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('username')
                            .eq('id', targetUserId)
                            .single()];
                case 3:
                    _b = _f.sent(), data = _b.data, error = _b.error;
                    if (error || !data) {
                        return [2 /*return*/, 'Could not retrieve your profile information.'];
                    }
                    targetUsername = data.username;
                    _f.label = 4;
                case 4: return [4 /*yield*/, supabase
                        .from('profiles')
                        .select('username, full_name, bio, avatar_url, created_at, status_message, last_status_update')
                        .eq('id', targetUserId)
                        .single()];
                case 5:
                    _c = _f.sent(), profile = _c.data, profileError = _c.error;
                    if (profileError || !profile) {
                        return [2 /*return*/, 'Could not retrieve profile information.'];
                    }
                    return [4 /*yield*/, supabase
                            .from('user_follows')
                            .select('*', { count: 'exact', head: true })
                            .eq('following_id', targetUserId)];
                case 6:
                    _d = _f.sent(), followerCount = _d.count, followerError = _d.error;
                    if (followerError) {
                        console.error('Error fetching follower count:', followerError);
                    }
                    return [4 /*yield*/, supabase
                            .from('user_follows')
                            .select('*', { count: 'exact', head: true })
                            .eq('follower_id', targetUserId)];
                case 7:
                    _e = _f.sent(), followingCount = _e.count, followingError = _e.error;
                    if (followingError) {
                        console.error('Error fetching following count:', followingError);
                    }
                    joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                    });
                    return [2 /*return*/, "**Profile: @".concat(profile.username, "**\n\nName: ").concat(profile.full_name || 'Not set', "\nJoined: ").concat(joinDate, "\nFollowers: ").concat(followerCount || 0, "\nFollowing: ").concat(followingCount || 0, "\n\nBio: ").concat(profile.bio || 'No bio available')];
                case 8:
                    error_2 = _f.sent();
                    console.error('Error in profile command:', error_2);
                    return [2 /*return*/, 'Sorry, I encountered an error while retrieving profile information.'];
                case 9: return [2 /*return*/];
            }
        });
    }); }
};
// Command: Regions
var regionsCommand = {
    name: 'regions',
    description: 'Lists available regions in the Philippines',
    usage: '/regions',
    execute: function (request, supabase) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, regions, error, response_1, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, supabase
                            .from('regions')
                            .select('id, name, description')
                            .order('name')];
                case 1:
                    _a = _b.sent(), regions = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    if (!regions || regions.length === 0) {
                        return [2 /*return*/, 'No regions found in the database.'];
                    }
                    response_1 = '**Philippine Regions**\n\n';
                    regions.forEach(function (region) {
                        response_1 += "**".concat(region.name, "** (").concat(region.id, ") - ").concat(region.description || 'No description', "\n");
                    });
                    return [2 /*return*/, response_1];
                case 2:
                    error_3 = _b.sent();
                    console.error('Error fetching regions:', error_3);
                    return [2 /*return*/, 'Sorry, I encountered an error while fetching region information.'];
                case 3: return [2 /*return*/];
            }
        });
    }); }
};
// Command: Random
var randomCommand = {
    name: 'random',
    description: 'Generates a random number, rolls a dice, or flips a coin',
    usage: '/random [number|dice|coin]',
    execute: function (request) { return __awaiter(void 0, void 0, void 0, function () {
        var type, max, randomNumber, sides, diceRoll, coinFlip;
        return __generator(this, function (_a) {
            if (!request.args || request.args.length === 0) {
                return [2 /*return*/, 'Please specify what to randomize: number, dice, or coin. Example: /random dice'];
            }
            type = request.args[0].toLowerCase();
            switch (type) {
                case 'number':
                    max = request.args[1] ? parseInt(request.args[1]) : 100;
                    randomNumber = Math.floor(Math.random() * max) + 1;
                    return [2 /*return*/, "Random number (1-".concat(max, "): **").concat(randomNumber, "**")];
                case 'dice':
                    sides = request.args[1] ? parseInt(request.args[1]) : 6;
                    diceRoll = Math.floor(Math.random() * sides) + 1;
                    return [2 /*return*/, "Dice roll (".concat(sides, "-sided): \uD83C\uDFB2 **").concat(diceRoll, "**")];
                case 'coin':
                    coinFlip = Math.random() < 0.5 ? 'Heads' : 'Tails';
                    return [2 /*return*/, "Coin flip: **".concat(coinFlip, "**")];
                default:
                    return [2 /*return*/, "Invalid option: ".concat(type, ". Please use 'number', 'dice', or 'coin'.")];
            }
            return [2 /*return*/];
        });
    }); }
};
// List of all available commands
exports.commands = [
    helpCommand,
    infoCommand,
    weatherCommand,
    statsCommand,
    profileCommand,
    regionsCommand,
    randomCommand
];
// Process a command
function processCommand(request, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var command, targetCommand, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    command = request.command;
                    if (!command) {
                        return [2 /*return*/, 'Invalid command format. Use /help to see available commands.'];
                    }
                    targetCommand = exports.commands.find(function (cmd) { return cmd.name === command; });
                    if (!targetCommand) {
                        return [2 /*return*/, "Unknown command: /".concat(command, ". Type /help to see available commands.")];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, targetCommand.execute(request, supabase)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_4 = _a.sent();
                    console.error("Error executing command /".concat(command, ":"), error_4);
                    return [2 /*return*/, "Sorry, an error occurred while processing the /".concat(command, " command.")];
                case 4: return [2 /*return*/];
            }
        });
    });
}
