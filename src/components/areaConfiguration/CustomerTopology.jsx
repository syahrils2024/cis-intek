import { toast } from 'sonner';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useMemo, useState, useEffect } from 'react';

import {
  Step,
  Stack,
  Button,
  Dialog,
  Stepper,
  useTheme,
  StepLabel,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';

import { areaRepository } from 'src/repositories';

/**
 * @typedef {import('@/repositories/area').TopologyCustomer} TopologyCustomer
 */

/**
 * @param {{customerId: string | null, onClose: void}} props -- React Props
 */

export default function CustomerTopologyDialog({ customerId, onClose }) {
  const showDialog = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /** @type {[TopologyCustomer, void]} */
  const [topology, setTopology] = useState(null);

  const parentOfTopology = useMemo(() => {
    if (!topology) return [];
    if (!topology.odp.name) return [];
    const parents = [];

    parents.push({
      icon: 'la:dot-circle',
      name: topology.odp.name,
      type: 'device',
    });

    topology.odp.parent.forEach((p) => {
      parents.push({
        icon: 'cbi:mikrotik',
        name: p.title,
        type: 'area',
        subtitle: p.address,
      });

      const reversedParentCategory = [...p.parentCategory]
        .reverse()
        .filter((pc) => !['ACTIVE AREA', 'INACTIVE AREA'].includes(pc.title));

      reversedParentCategory.forEach((pp, i) => {
        parents.push({
          icon:
            i === reversedParentCategory.length - 1
              ? 'flat-color-icons:globe'
              : 'fluent:globe-location-20-regular',
          name: pp.title,
          type: 'areaCategory',
        });
      });
    });

    return parents;
  });

  const prefetch = async () => {
    try {
      const snapshot = await areaRepository.getTopologyCustomer(customerId);
      setTopology(snapshot);
    } catch (error) {
      toast.error(error.message1);
    }
  };

  useEffect(() => {
    if (!customerId) {
      showDialog.onFalse();
      return;
    }
    showDialog.onTrue();

    prefetch();
  }, [customerId]);

  return (
    <Dialog open={showDialog.value} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogTitle>
        <div className="tw-flex tw-flex-col">
          <span>Topologi Jaringan</span>
          <p className="tw-text-sm tw-text-gray-500">{topology?.fullname}</p>
        </div>
      </DialogTitle>
      <DialogContent>
        {!topology ? (
          <CircularProgress />
        ) : (
          <Stack>
            <Stepper
              alternativeLabel={!isMobile}
              activeStep={parentOfTopology.length}
              orientation={isMobile ? 'vertical' : 'horizontal'}
            >
              {parentOfTopology.reverse().map((pt, i) => (
                <Step key={i}>
                  <StepLabel StepIconComponent={() => <Iconify icon={pt.icon} width={30} />}>
                    <Stack>
                      <span className="tw-text-xs">{pt.name}</span>
                      <span className="tw-text-xs">{pt.subtitle}</span>
                    </Stack>
                  </StepLabel>
                </Step>
              ))}
              <Step>
                <StepLabel StepIconComponent={() => <Iconify icon="mdi:user-outline" width={30} />}>
                  <Stack>
                    <span className="tw-text-xs">{topology.fullname}</span>
                    <span className="tw-text-xs">{topology.customerId}</span>
                  </Stack>
                </StepLabel>
              </Step>
            </Stepper>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={onClose}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
}
