/**
 * @typedef {import("./engineerPickerDialog.state").AreaEngineer} AreaEngineer
 * @typedef {import('src/repositories/user').User} User
 */

import { useMemo, useState } from 'react';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useDebouncedCallback } from 'use-debounce';

import {
  Stack,
  Button,
  Checkbox,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
} from '@mui/material';

/**
 *
 * @param {{
 *  item: AreaEngineer
 *  onToggleEngineer: (engineerId: string) => void
 *  selectedEngineers: string[]
 *  onToggleEngineerArea: (areaId: string) => void
 *  onPickEngineer: (engineer: User) => void
 *  multiple?: boolean
 *  search: string
 * }} param0
 */
export function EngineerAreaItem({
  item,
  onToggleEngineer,
  selectedEngineers,
  onToggleEngineerArea,
  onPickEngineer,
  multiple = true,
  search,
}) {
  const expand = useBoolean(false);
  const [expandArea, setExpandArea] = useState('');

  const isAreaCheck = (area_id) => {
    const engineersInArea = item.areas.find((a) => a._id === area_id)?.engineers || [];
    if (engineersInArea.length === 0) return false;
    return engineersInArea.every((eng) => selectedEngineers.includes(eng._id));
  };

  const debouncedToggleEngineerArea = useDebouncedCallback((areaId) => {
    onToggleEngineerArea(areaId);
  }, 400);

  const filteredItem = useMemo(() => {
    if (!search) return item.areas;
    const lowerSearch = search.toLowerCase();
    const filteredAreas = item.areas
      .map((area) => {
        const filteredEngineers = area.engineers.filter((eng) =>
          eng.fullname.toLowerCase().includes(lowerSearch)
        );
        if (filteredEngineers.length === 0) return null;
        return {
          ...area,
          engineers: filteredEngineers,
        };
      })
      .filter((area) => area !== null);

    return filteredAreas;
  }, [search, item]);

  return (
    <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
      <Stack spacing={1}>
        <button
          type="button"
          onClick={() => expand.onToggle()}
          className="tw-w-full tw-text-left tw-rounded-t-lg tw-justify-start"
        >
          <Stack direction="row" className="tw-pt-2 tw-px-3" spacing={1} alignItems="center">
            <div className={`tw-duration-300 ${expand.value ? 'tw-rotate-90' : ''}`}>
              <IconButton>
                <Iconify icon="material-symbols:arrow-right" />
              </IconButton>
            </div>
            <span className="tw-text-sm">{item.title}</span>
          </Stack>
        </button>
        <div
          className={`tw-overflow-hidden tw-pl-5 tw-duration-300 ${expand.value ? 'tw-max-h-full' : 'tw-max-h-0'}`}
        >
          {filteredItem.map((area) => (
            <Accordion
              expanded={expandArea === area._id}
              onChange={() => setExpandArea(expandArea === area._id ? '' : area._id)}
              key={area._id}
            >
              <AccordionSummary>
                {multiple ? (
                  <FormControlLabel
                    onClick={(e) => {
                      debouncedToggleEngineerArea(area._id);
                    }}
                    label={<span className="tw-text-sm tw-font-semibold">{area.title}</span>}
                    control={<Checkbox checked={isAreaCheck(area._id)} />}
                  />
                ) : (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <div
                      className={`tw-duration-300 ${expandArea === area._id ? 'tw-rotate-90' : ''}`}
                    >
                      <IconButton>
                        <Iconify icon="material-symbols:arrow-right" />
                      </IconButton>
                    </div>
                    <span className="tw-text-sm">{area.title}</span>
                  </Stack>
                )}

                {/* <span className="tw-text-xs">{area.title}</span> */}
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1} className='tw-pl-5'>
                  {area.engineers.map((eng, i) =>
                    multiple ? (
                      <FormControlLabel
                        key={i}
                        label={<span className="tw-text-xs">{eng.fullname}</span>}
                        control={
                          <Checkbox
                            checked={selectedEngineers.includes(eng._id)}
                            onChange={() => onToggleEngineer(eng._id)}
                          />
                        }
                      />
                    ) : (
                      <div key={i} className="tw-ml-4">
                        <Button
                          className="tw-w-min tw-text-xs tw-whitespace-nowrap tw-uppercase"
                          variant="outlined"
                          size="small"
                          onClick={() => onPickEngineer(eng)}
                        >
                          <span className="tw-text-xs">{eng.fullname}</span>
                        </Button>
                      </div>
                    )
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </Stack>
    </div>
  );
}
