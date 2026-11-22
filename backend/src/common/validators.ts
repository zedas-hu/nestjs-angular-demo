import { ValidateBy, type ValidationOptions } from 'class-validator';

export function Digits(integer: number, fraction: number, options?: ValidationOptions): PropertyDecorator {
  const pattern = new RegExp(`^\\d{1,${integer}}(\\.\\d{1,${fraction}})?$`);
  return ValidateBy(
    {
      name: 'digits',
      validator: {
        validate: (value: unknown) => typeof value === 'number' && pattern.test(String(value)),
        defaultMessage: () => `must have at most ${integer} integer and ${fraction} fraction digits`,
      },
    },
    options,
  );
}
