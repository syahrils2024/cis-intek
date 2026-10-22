// @ts-nocheck

import Typography from '@mui/material/Typography';

/**
 * Renders a monetary/text value, or masks it as `Rp ***.***` when the
 * current user is not allowed to see finance data.
 *
 * @param {Object} props
 * @param {boolean} props.show - Whether the user may see the real value
 * @param {React.ReactNode} props.children - The real value to render
 * @param {Object} [props.typographyProps] - Extra props forwarded to Typography
 * @param {string} [props.maskedText] - Text shown when masked
 */
export default function MaskedValue({
  show,
  children,
  typographyProps = {},
  maskedText = 'Rp ***.***',
}) {
  if (!show) {
    return <Typography {...typographyProps}>{maskedText}</Typography>;
  }

  if (typographyProps && Object.keys(typographyProps).length > 0) {
    return <Typography {...typographyProps}>{children}</Typography>;
  }

  return children;
}
