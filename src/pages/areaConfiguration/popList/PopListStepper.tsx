// @ts-nocheck
import { Iconify } from '@components/iconify';

import { Step, Stack, Stepper, StepLabel } from '@mui/material';

type ParentCategory = { name: string };

type PopListStepperProps = {
  title: string;
  parentCategoryData?: ParentCategory[];
  orientation?: 'horizontal' | 'vertical';
};

export function PopListStepper({ title, parentCategoryData = [], orientation }: PopListStepperProps) {
  return (
    <Stepper
      activeStep={parentCategoryData.length}
      alternativeLabel={!orientation}
      orientation={orientation}
    >
      {parentCategoryData.map((parent, index) => (
        <Step key={`${parent.name}-${index}`}>
          <StepLabel
            StepIconComponent={() => (
              <Iconify
                icon={index === 0 ? 'flat-color-icons:globe' : 'fluent:globe-location-20-regular'}
                width={30}
              />
            )}
          >
            <Stack><span className="tw-text-xs">{parent.name}</span></Stack>
          </StepLabel>
        </Step>
      ))}
      <Step>
        <StepLabel StepIconComponent={() => <Iconify icon="cbi:mikrotik" width={30} />}>
          <Stack><span className="tw-text-xs">{title}</span></Stack>
        </StepLabel>
      </Step>
    </Stepper>
  );
}
