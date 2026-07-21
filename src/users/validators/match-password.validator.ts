import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({
  name: 'MatchPassword',
  async: false,
})
export class MatchPassword implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments): boolean {
    const obj = args.object as Record<string, unknown>;
    const constraints = args.constraints as unknown[];
    const key = String(constraints[0]);
    const password = obj[key];
    return confirmPassword === password;
  }

  defaultMessage(): string {
    return 'password y confirmPassword no coinciden';
  }
}
