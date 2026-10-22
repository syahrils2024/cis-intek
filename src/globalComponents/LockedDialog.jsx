import { toast } from 'sonner';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { authRepository } from 'src/repositories';

/**
 * @param {Object} props
 * @param {boolean} props.open
 */
export default function LockedDialog({ open }) {
  const handleLogout = () => {
    const promises = authRepository.logout();
    toast.promise(promises, {
      loading: 'Logout...',
      success: 'Logout successful',
      finally: () => {
        localStorage.clear();
        window.location.href = '/login';
      },
    });
  };

  return (
    <Dialog open={open} disableEscapeKeyDown maxWidth="xs" fullWidth>
      <DialogTitle>Akun Terkunci</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Akun Anda telah dikunci. Untuk membuka kunci, silakan hubungi developer atau admin.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
}
