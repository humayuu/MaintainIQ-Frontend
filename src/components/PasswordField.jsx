import { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

/**
 * A password TextField with a show/hide (eye) toggle in the end adornment.
 *
 * A drop-in replacement for <TextField type="password"> — forwards every prop
 * (label, name, value, onChange, error, helperText, margin, …) so callers use
 * it exactly like a TextField. The visibility state is local to the field.
 *
 * The toggle button is `tabIndex={-1}` so keyboard Tab flows straight from the
 * password input to the next field, not onto the eye icon.
 */
export default function PasswordField({ slotProps, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <TextField
      {...props}
      type={show ? 'text' : 'password'}
      slotProps={{
        ...slotProps,
        input: {
          ...slotProps?.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={show ? 'Hide password' : 'Show password'}
                onClick={() => setShow((s) => !s)}
                onMouseDown={(e) => e.preventDefault()} // keep focus in the field
                edge="end"
                size="small"
                tabIndex={-1}
              >
                {show ? (
                  <VisibilityOffRoundedIcon fontSize="small" />
                ) : (
                  <VisibilityRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
