import React from 'react';
import { Label } from '@atoms/Label';
import { Input } from '@atoms/Input';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  register: unknown;
  required?: boolean;
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  register,
  required = false,
}: FormFieldProps): React.ReactElement {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input id={name} type={type} placeholder={placeholder} {...(register as object)} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

