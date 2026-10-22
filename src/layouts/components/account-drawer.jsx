import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import { Menu, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useRouter, usePathname } from 'src/routes/hooks';

import { varAlpha } from 'src/theme/styles';
import { setShow } from 'src/stores/profileStore';
import { authRepository } from 'src/repositories';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { AnimateAvatar } from 'src/components/animate';

import { useMockedUser } from 'src/auth/hooks';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

// ----------------------------------------------------------------------

export function AccountDrawer({ data = [], sx, ...other }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const router = useRouter();

  const pathname = usePathname();
  const userDisplay = localStorage.getItem('fullname') || '';

  const { user } = useMockedUser();
  const [fullname] = useState(localStorage.getItem('fullname') ?? '');
  const [email] = useState(localStorage.getItem('email') ?? '');

  const [open, setOpen] = useState(false);

  const handleOpenDrawer = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  const handleClickItem = useCallback(
    (path) => {
      handleCloseDrawer();
      router.push(path);
    },
    [handleCloseDrawer, router]
  );

  const logout = () => {
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

  const [anchorElAccount, setAnchorElAccount] = useState(null);
  const menuAccount = Boolean(anchorElAccount);
  const showMenuAccount = (event) => {
    setAnchorElAccount(event.currentTarget);
  };
  const closeMenuAccount = () => {
    setAnchorElAccount(null);
  };

  const renderAvatar = (
    <AnimateAvatar
      width={96}
      slotProps={{
        avatar: { src: user?.photoURL, alt: userDisplay },
        overlay: {
          border: 2,
          spacing: 3,
          color: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0)} 25%, ${theme.vars.palette.primary.main} 100%)`,
        },
      }}
    >
      {userDisplay.charAt(0).toUpperCase()}
    </AnimateAvatar>
  );

  return (
    <>
      <AccountButton
        // open={open}
        onClick={showMenuAccount}
        photoURL={user?.photoURL}
        displayName={userDisplay}
        sx={sx}
        {...other}
      />

      <Drawer
        // open={open}
        onClose={handleCloseDrawer}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 320 } }}
      >
        <IconButton
          onClick={handleCloseDrawer}
          sx={{ top: 12, left: 12, zIndex: 9, position: 'absolute' }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>

        <Scrollbar>
          <Stack alignItems="center" sx={{ pt: 8 }}>
            {renderAvatar}

            <Typography variant="subtitle1" noWrap sx={{ mt: 2 }}>
              {fullname}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }} noWrap>
              {email}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ p: 3 }}>
            {/* {[...Array(3)].map((_, index) => (
              <Tooltip
                key={_mock.fullName(index + 1)}
                title={`Switch to: ${_mock.fullName(index + 1)}`}
              >
                <Avatar
                  alt={_mock.fullName(index + 1)}
                  src={_mock.image.avatar(index + 1)}
                  onClick={() => {}}
                />
              </Tooltip>
            ))} */}

            {/* <Tooltip title="Add account">
              <IconButton
                sx={{
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                  border: `dashed 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.32)}`,
                }}
              >
                <Iconify icon="mingcute:add-line" />
              </IconButton>
            </Tooltip> */}
          </Stack>

          <Stack
            sx={{
              py: 3,
              px: 2.5,
              borderTop: `dashed 1px ${theme.vars.palette.divider}`,
              borderBottom: `dashed 1px ${theme.vars.palette.divider}`,
            }}
          >
            {/* {data.map((option) => {
              const rootLabel = pathname.includes('/dashboard') ? 'Home' : 'Dashboard';

              const rootHref = pathname.includes('/dashboard') ? '/' : paths.dashboard.root;

              return (
                <MenuItem
                  key={option.label}
                  onClick={() => handleClickItem(option.label === 'Home' ? rootHref : option.href)}
                  sx={{
                    py: 1,
                    color: 'text.secondary',
                    '& svg': { width: 24, height: 24 },
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  {option.icon}

                  <Box component="span" sx={{ ml: 2 }}>
                    {option.label === 'Home' ? rootLabel : option.label}
                  </Box>

                  {option.info && (
                    <Label color="error" sx={{ ml: 1 }}>
                      {option.info}
                    </Label>
                  )}
                </MenuItem>
              );
            })} */}
          </Stack>

          {/* <Box sx={{ px: 2.5, py: 3 }}>
            <UpgradeBlock />
          </Box> */}
        </Scrollbar>

        <Box sx={{ p: 2.5 }}>
          <SignOutButton onClose={handleCloseDrawer} />
        </Box>
      </Drawer>
      <Menu
        id="basic-menu"
        anchorEl={anchorElAccount}
        open={menuAccount}
        onClose={closeMenuAccount}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => dispatch(setShow(true))}>Profile</MenuItem>
        <MenuItem onClick={logout}>Logout</MenuItem>
      </Menu>
    </>
  );
}
