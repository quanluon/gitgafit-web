import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@atoms/Button';
import { Input } from '@atoms/Input';

interface FileUploadCardProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  inputId: string;
  label: string;
  placeholder: string;
  helperText?: string;
  buttonLabel: string;
  fileName?: string;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
}
export const FileUploadCard = forwardRef<HTMLInputElement, FileUploadCardProps>(
  (
    {
      inputId,
      label,
      placeholder,
      helperText,
      buttonLabel,
      fileName,
      disabled,
      onFileSelect,
      accept,
      className,
      ...rest
    },
    ref,
  ) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        onFileSelect(selectedFile);
      }
    };

    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="font-medium text-sm text-foreground">
          {label}
        </label>
        <div
          className={cn(
            'rounded-xl border-2 border-dashed px-4 py-5 text-center transition',
            fileName ? 'border-primary/50 bg-primary/5 text-primary' : 'border-muted-foreground/40 hover:border-primary/60',
            disabled && 'opacity-60 cursor-not-allowed',
            className,
          )}
        >
          <p className="text-sm font-semibold mb-1 break-all">{fileName || placeholder}</p>
          {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
          <div className="mt-3 flex gap-2 justify-center">
            <Input
              ref={ref}
              id={inputId}
              type="file"
              accept={accept}
              onChange={handleChange}
              disabled={disabled}
              className="hidden"
              {...rest}
            />
            <Button
              type="button"
              variant="outline"
              onClick={(): void => {
                if (!disabled) {
                  (document.getElementById(inputId) as HTMLInputElement | null)?.click();
                }
              }}
              disabled={disabled}
              className="gap-2 text-sm"
            >
              {buttonLabel}
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

FileUploadCard.displayName = 'FileUploadCard';

