import { Iconify } from '@components/iconify';

import { Stack, Button, Accordion, AccordionSummary, AccordionActions } from '@mui/material';

/**
 * @typedef {import("src/repositories/addons").AddonsCategory} AddonsCategory
 *
 */

/**
 * @callback ActionsCallback
 * @param {AddonsCategory} data
 */

/**
 * @param {{data: AddonsCategory[]; onRemove: ActionsCallback; onEdit: ActionsCallback}} param0
 */
export default function AddonsCategoryMobile({ data, onEdit, onRemove }) {
  return (
    <div className="tw-flex tw-flex-col tw-w-full">
      {data.map((d, i) => (
        <div key={i} className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
          <Accordion>
            <AccordionSummary>
              <span className="tw-text-xs">{d.category}</span>
            </AccordionSummary>
            <AccordionActions>
              <Stack direction="row" justifyContent="end">
                <Button variant="text" color="error" onClick={() => onRemove(d)}>
                  <Iconify icon="material-symbols:delete-outline" />
                </Button>
                <Button variant="text" color="success" onClick={() => onEdit(d)}>
                  <Iconify icon="material-symbols:edit-outline" />
                </Button>
              </Stack>
            </AccordionActions>
          </Accordion>
        </div>
      ))}
    </div>
  );
}
