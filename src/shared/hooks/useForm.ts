import { useState, useCallback } from 'react';

type ValidationRule<T = any> = (value: any, values: T) => string | undefined;
type ValidationSchema<T = any> = Partial<Record<keyof T, ValidationRule<T>>>;

interface FormErrors {
  [key: string]: string | undefined;
}

interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<boolean | undefined>;
  setValue: (field: keyof T, value: any) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  reset: (newValues?: T) => void;
  resetField: (field: keyof T) => void;
  validate: () => boolean;
}

/**
 * Custom hook for form management
 * @param initialValues - Initial form values
 * @param onSubmit - Submit handler function
 * @param validation - Validation schema (optional)
 * @returns Form state and handlers
 */
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit?: ((values: T) => Promise<void> | void) | null,
  validation?: ValidationSchema<T> | null
): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field as string]: true }));
    
    // Validate on blur if validation is provided
    if (validation && validation[field]) {
      const error = validation[field]!(values[field], values);
      if (error) {
        setErrors(prev => ({ ...prev, [field as string]: error }));
      }
    }
  }, [values, validation]);

  const setValue = useCallback((field: keyof T, value: any) => {
    handleChange(field, value);
  }, [handleChange]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    handleChange(field, value);
  }, [handleChange]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field as string]: error }));
  }, []);

  const validate = useCallback(() => {
    if (!validation) return true;

    const newErrors: FormErrors = {};
    Object.keys(validation).forEach(field => {
      const error = validation[field as keyof T]!(values[field as keyof T], values);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validation).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    return Object.keys(newErrors).length === 0;
  }, [values, validation]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Submission failed';
      setErrors(prev => ({ ...prev, _submit: errorMessage }));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback((newValues: T = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const resetField = useCallback((field: keyof T) => {
    setValues(prev => ({ ...prev, [field]: initialValues[field] }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
    setTouched(prev => {
      const newTouched = { ...prev };
      delete newTouched[field as string];
      return newTouched;
    });
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    setFieldValue,
    setFieldError,
    reset,
    resetField,
    validate,
  };
};
