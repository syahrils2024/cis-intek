import PropTypes from 'prop-types';
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

import { Box, TextField } from '@mui/material';

const OtpInput = forwardRef(({ value = '', onChange, onFinish, length = 6, ...other }, ref) => {
  const inputRefs = useRef([]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      if (onChange) {
        onChange('');
      }
      // Focus first input after clearing
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    },
  }));

  const handleChange = (index, newValue) => {
    // Only allow numbers
    const sanitizedValue = newValue.replace(/[^0-9]/g, '');

    if (sanitizedValue.length > 1) {
      // Handle paste
      const pastedValue = sanitizedValue.slice(0, length);
      if (onChange) {
        onChange(pastedValue);
      }

      // Focus on the last filled input or the last input
      const nextIndex = Math.min(pastedValue.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }

      // Call onFinish if all digits are filled
      if (pastedValue.length === length && onFinish) {
        onFinish(pastedValue);
      }
      return;
    }

    // Build new value
    const currentValue = value || '';
    const valueArray = currentValue.split('');

    if (sanitizedValue === '') {
      // Delete case
      valueArray[index] = '';
    } else {
      // Input case
      valueArray[index] = sanitizedValue;
    }

    const newOtpValue = valueArray.join('').slice(0, length);

    if (onChange) {
      onChange(newOtpValue);
    }

    // Auto-focus next input
    if (sanitizedValue && index < length - 1) {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }

    // Call onFinish if all digits are filled
    if (newOtpValue.length === length && onFinish) {
      onFinish(newOtpValue);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const currentValue = value || '';
      const valueArray = currentValue.split('');

      if (!valueArray[index] && index > 0) {
        // If current input is empty, focus previous input
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const sanitizedValue = pastedData.replace(/[^0-9]/g, '').slice(0, length);

    if (onChange) {
      onChange(sanitizedValue);
    }

    // Focus on the last filled input or the last input
    const nextIndex = Math.min(sanitizedValue.length, length - 1);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }

    // Call onFinish if all digits are filled
    if (sanitizedValue.length === length && onFinish) {
      onFinish(sanitizedValue);
    }
  };

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const currentValue = value || '';
  const valueArray = currentValue.split('');

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        justifyContent: 'center',
        ...other.sx,
      }}
    >
      {Array.from({ length }, (_, index) => (
        <TextField
          key={index}
          inputRef={(el) => {
            inputRefs.current[index] = el;
          }}
          value={valueArray[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={handleFocus}
          onPaste={handlePaste}
          inputProps={{
            maxLength: 1,
            style: {
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 600,
            },
          }}
          sx={{
            width: 56,
            '& .MuiOutlinedInput-root': {
              '& input': {
                padding: '14px',
              },
            },
          }}
          {...other}
        />
      ))}
    </Box>
  );
});

OtpInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onFinish: PropTypes.func,
  length: PropTypes.number,
};

OtpInput.displayName = 'OtpInput';

export default OtpInput;
