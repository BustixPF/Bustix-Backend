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
exports.CreateUserDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const match_password_validator_1 = require("../validators/match-password.validator");
const role_enum_1 = require("../../common/enums/role.enum");
class CreateUserDto {
    name;
    email;
    password;
    confirmPassword;
    dni;
    phone;
    address;
    role;
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, description: "Nombre completo del usuario", example: "Usuario Prueba", minLength: 3, maxLength: 80 }, email: { required: true, type: () => String, description: "Email v\u00E1lido, usado para login", example: "example@mail.com", format: "email" }, password: { required: true, type: () => String, description: "La contrase\u00F1a debe tener al menos 8 caracteres, una may\u00FAscula, una min\u00FAscula, un n\u00FAmero y un s\u00EDmbolo", example: "aaBB33##", minLength: 8, maxLength: 15 }, confirmPassword: { required: true, type: () => String, description: "Debe ser una r\u00E9plica exacta de la contrase\u00F1a", example: "aaBB33##" }, dni: { required: true, type: () => Number, description: "DNI / documento de identidad, requerido para emitir el ticket", example: 40123456 }, phone: { required: true, type: () => Number, description: "Tel\u00E9fono de contacto", example: 1123456789 }, address: { required: false, type: () => String, description: "Direcci\u00F3n, opcional", example: "Calle Falsa 123", minLength: 3, maxLength: 80 } };
    }
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre es obligatorio' }),
    (0, class_validator_1.MinLength)(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
    (0, class_validator_1.MaxLength)(80, { message: 'El nombre no puede tener más de 80 caracteres' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'El email debe ser un email válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El email es obligatorio' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'La contraseña debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La contraseña es obligatoria' }),
    (0, class_validator_1.MinLength)(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
    (0, class_validator_1.MaxLength)(15, {
        message: 'La contraseña no puede tener más de 15 caracteres',
    }),
    (0, class_validator_1.IsStrongPassword)({
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    }, {
        message: 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un símbolo',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Validate)(match_password_validator_1.MatchPassword, ['password']),
    __metadata("design:type", String)
], CreateUserDto.prototype, "confirmPassword", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'El DNI debe ser un número entero' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El DNI es obligatorio' }),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "dni", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'El teléfono debe ser un número' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El teléfono es obligatorio' }),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'La dirección debe tener al menos 3 caracteres' }),
    (0, class_validator_1.MaxLength)(80, {
        message: 'La dirección no puede tener más de 80 caracteres',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, class_validator_1.IsEmpty)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
//# sourceMappingURL=create-user.dto.js.map