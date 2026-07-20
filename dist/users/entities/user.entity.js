"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const role_enum_1 = require("../../common/enums/role.enum");
let User = class User {
    id;
    name;
    email;
    password;
    dni;
    phone;
    address;
    role;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String, description: "uuid v4 generado por la base de datos" }, name: { required: true, type: () => String, description: "Nombre completo del usuario", example: "Santiago Burke" }, email: { required: true, type: () => String, description: "Email \u00FAnico, usado para login", example: "example@mail.com" }, password: { required: true, type: () => String, description: "Password hasheado (nunca se guarda en texto plano)" }, dni: { required: true, type: () => Number, description: "DNI / documento de identidad, \u00FAnico. Necesario para emitir el ticket de bus.", example: 40123456 }, phone: { required: true, type: () => Number, description: "Tel\u00E9fono de contacto", example: 1123456789 }, address: { required: false, type: () => String, description: "Direcci\u00F3n, opcional", example: "Calle Falsa 123" }, role: { required: true, description: "Rol del usuario dentro del sistema", enum: require("../../common/enums/role.enum").Role } };
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 80, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 60, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unique: true, nullable: false }),
    __metadata("design:type", Number)
], User.prototype, "dni", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    __metadata("design:type", Number)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: role_enum_1.Role, default: role_enum_1.Role.Passenger }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)({ name: 'users' })
], User);
//# sourceMappingURL=user.entity.js.map