import { Iconify } from '@components/iconify';
import { usePrivilege } from '@auth/hooks/privileges';
import { useNavigate, useLocation } from 'react-router';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import { styled, useTheme } from '@mui/material/styles';
import { IconButton, useMediaQuery } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Logo } from 'src/components/logo';

import { HeaderSection } from './header-section';
import { MenuButton } from '../components/menu-button';
import { SignInButton } from '../components/sign-in-button';
import { AccountDrawer } from '../components/account-drawer';

// ----------------------------------------------------------------------

const StyledDivider = styled('span')(({ theme }) => ({
  width: 1,
  height: 10,
  flexShrink: 0,
  display: 'none',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  marginLeft: theme.spacing(2.5),
  marginRight: theme.spacing(2.5),
  backgroundColor: 'currentColor',
  color: theme.vars.palette.divider,
  '&::before, &::after': {
    top: -5,
    width: 3,
    height: 3,
    content: '""',
    flexShrink: 0,
    borderRadius: '50%',
    position: 'absolute',
    backgroundColor: 'currentColor',
  },
  '&::after': { bottom: -5, top: 'auto' },
}));

// ----------------------------------------------------------------------

export function HeaderBase({
  sx,
  data,
  slots,
  slotProps,
  onOpenNav,
  layoutQuery,

  slotsDisplay: {
    signIn = true,
    account = true,
    helpLink = true,
    settings = true,
    purchase = true,
    contacts = true,
    searchbar = true,
    workspaces = true,
    menuButton = true,
    localization = true,
    notifications = true,
  } = {},

  ...other
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAdmin, isEngineer } = usePrivilege();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <HeaderSection
      sx={sx}
      layoutQuery={layoutQuery}
      slots={{
        ...slots,
        leftAreaStart: slots?.leftAreaStart,
        leftArea: (
          <>
            {slots?.leftAreaStart}
            {isEngineer && location.pathname !== '/v2' && (
              <IconButton
                onClick={() => {
                  navigate('/v2');
                }}
              >
                <Iconify icon="iconamoon:arrow-left-2" />
              </IconButton>
            )}

            {/* -- Menu button -- */}
            {menuButton && !isEngineer && (
              <MenuButton
                data-slot="menu-button"
                onClick={onOpenNav}
                sx={{
                  mr: 1,
                  ml: -1,
                  [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                }}
              />
            )}

            {/* -- Logo -- */}
            {isMobile ? <Logo data-slot="logo" sizePotrait={50} sizeLandscape={120} /> : null}

            {/* -- Divider -- */}
            <StyledDivider data-slot="divider" />

            {/* -- Workspace popover -- */}
            {/* {workspaces && <WorkspacesPopover data-slot="workspaces" data={data?.workspaces} />} */}

            {slots?.leftAreaEnd}
          </>
        ),
        rightArea: (
          <>
            {slots?.rightAreaStart}

            <Box
              data-area="right"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
              }}
            >
              {/* -- Help link -- */}
              {helpLink && (
                <Link
                  data-slot="help-link"
                  href={paths.faqs}
                  component={RouterLink}
                  color="inherit"
                  sx={{ typography: 'subtitle2' }}
                >
                  Need help?
                </Link>
              )}

              {/* -- Searchbar -- */}
              {/* {searchbar && <Searchbar data-slot="searchbar" data={data?.nav} />} */}

              {/* -- Language popover -- */}
              {/* {localization && <LanguagePopover data-slot="localization" data={data?.langs} />} */}

              {/* -- Notifications popover -- */}
              {/* {notifications && (
                <NotificationsDrawer data-slot="notifications" data={data?.notifications} />
              )} */}

              {/* -- Contacts popover -- */}
              {/* {contacts && <ContactsPopover data-slot="contacts" data={data?.contacts} />} */}

              {/* -- Settings button -- */}
              {/* {settings && <SettingsButton data-slot="settings" />} */}

              {/* -- Account drawer -- */}
              {account && <AccountDrawer data-slot="account" data={data?.account} />}
              {menuButton && isMobile && isAdmin && (
                <MenuButton
                  data-slot="menu-button"
                  onClick={onOpenNav}
                  sx={{
                    mr: -1,
                    ml: 1,
                    [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                  }}
                />
              )}

              {/* -- Sign in button -- */}
              {signIn && <SignInButton />}

              {/* -- Purchase button -- */}
              {purchase && (
                <Button
                  data-slot="purchase"
                  variant="contained"
                  rel="noopener"
                  target="_blank"
                  href={paths.minimalStore}
                  sx={{
                    display: 'none',
                    [theme.breakpoints.up(layoutQuery)]: {
                      display: 'inline-flex',
                    },
                  }}
                >
                  Purchase
                </Button>
              )}
            </Box>

            {slots?.rightAreaEnd}
          </>
        ),
      }}
      slotProps={slotProps}
      {...other}
    />
  );
}
