import { ValidationArguments, ValidatorConstraintInterface } from 'class-validator';
export declare class MatchPassword implements ValidatorConstraintInterface {
    validate(confirmPassword: string, args: ValidationArguments): boolean;
    defaultMessage(): string;
}
