import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useMemo, useState } from 'react';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import { useTheme, useMediaQuery } from '@mui/material';

import { areaRepository, userRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/user').User} User
 * @typedef {import('src/repositories/area').Area} Area
 *
 */

/**
 * @typedef {object} AreaEngineer
 * @property {string} _id -- area categoryId
 * @property {string} title -- area category title
 * @property {object[]} areas
 * @property {string} areas._id -- area id
 * @property {string} areas.title -- area title
 * @property {object[]} areas.engineers
 * @property {string} areas.engineers._id -- engineer id
 * @property {string} areas.engineers.fullname -- engineer name
 */

export function useEngineerPickerDialogState() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  const resolver = useRef();
  const show = useBoolean(false);
  const multiple = useBoolean(false);
  const loading = useBoolean(false);
  const selectedEngineer = useExpansionToggle();
  const [filterAreaId, setFilterAreaId] = useState(null);
  const [search, setSearch] = useState('');

  /** @type {[User[], Function]} */
  const [engineers, setEngineers] = useState([]);

  /** @type {[Area[], Function]} */
  const [areas, setAreas] = useState([]);

  function filterParamEngineerArea(areaId) {
    return engineers.filter((eng) => eng.areas?.includes(areaId) ?? false);
  }

  /** @type {AreaEngineer[]} */
  const mapData = useMemo(() => {
    let filteredAreas = areas;
    if (!!filterAreaId) {
      filteredAreas = areas.filter(
        (category) =>
          category._id === filterAreaId || category.area.some((a) => a._id === filterAreaId)
      );
    }

    const mapAreas = filteredAreas.map((areaCategory) => {
      const areaList = areaCategory.area
        // .filter((area) => filterAreaId === null || filterAreaId === area._id) // if filterAreaId is set, filter areas
        .map((area) => {
          const engineerList = filterParamEngineerArea(area._id)
            .map((eng) => ({
              _id: eng._id,
              fullname: eng.fullname,
            }));
          return {
            _id: area._id,
            title: area.title,
            engineers: engineerList,
          };
        });
      return {
        _id: areaCategory._id,
        title: areaCategory.title,
        areas: areaList,
      };
    });

    return mapAreas;
  }, [areas, engineers]);

  const availableSubmit = useMemo(() => selectedEngineer.data.length > 0, [selectedEngineer.data]);

  function toggleEngineerArea(area_id) {
    const engineersInArea =
      mapData.flatMap((ae) => ae.areas).find((a) => a._id === area_id)?.engineers || [];

    const allSelected = engineersInArea.every((eng) => selectedEngineer.isIncludes(eng._id));

    const unselectedEngineer = engineersInArea.filter(
      (eng) => !selectedEngineer.isIncludes(eng._id)
    );

    if (allSelected) {
      // remove all
      const engineerId = engineersInArea.map((eng) => eng._id);
      selectedEngineer.remove(engineerId);
    } else {
      // add all
      const engineerId = unselectedEngineer.map((eng) => eng._id);
      selectedEngineer.add(engineerId);
    }

    // console.log({ engineersInArea, allSelected });

    // engineersInArea.forEach((eng) => {
    //   const isContains = selectedEngineer.isIncludes(eng._id);
    //   console.log({
    //     [eng.fullname]: isContains,
    //   })
    //   if (allSelected) {
    //     // remove all
    //     if (isContains) {
    //       selectedEngineer.remove(eng._id);
    //     }
    //   } else if (!isContains) {
    //     selectedEngineer.add(eng._id);
    //   }
    // });
  }

  async function loadData() {
    loading.onFalse();
    try {
      const promisesUser = userRepository.getUserByPrivilege('engineer');
      const promisesArea = areaRepository.getAllArea();

      const [snapshotUser, snapshotArea] = await Promise.all([promisesUser, promisesArea]);

      setAreas(snapshotArea);
      setEngineers(snapshotUser);
    } catch (error) {
      toast.error(error.message || 'Error loading engineers');
    } finally {
      loading.onTrue();
    }
  }

  function reset() {
    resolver.current = null;
    show.onFalse();
    multiple.onFalse();
    setEngineers([]);
    selectedEngineer.reset();
    setFilterAreaId(null);
    setSearch('');
  }

  /**
   * Open Engineer Picker Dialog
   * @typedef {object} openOptions
   * @property {string[]} [currentEngineerId]
   * @property {string} [areaId]
   *
   * @param {boolean} isMultiple - allow multiple selection
   * @param {openOptions} options
   * @returns
   */
  function open(isMultiple = false, options = {}) {
    reset();
    multiple.setValue(isMultiple);
    show.onTrue();

    if (options.areaId) {
      setFilterAreaId(options.areaId);
    }

    if (options.currentEngineerId && options.currentEngineerId.length > 0) {
      selectedEngineer.setData(options.currentEngineerId);
    }

    loadData();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    resolver.current();
    reset();
  }

  /**
   * @param {User} data -- user data
   */
  function submit(data) {
    if (data) {
      resolver.current(data);
    } else {
      const selected = engineers.filter((eng) => selectedEngineer.isIncludes(eng._id));
      resolver.current(selected);
    }
    reset();
  }

  return {
    state: {
      mobile,
      show,
      multiple,
      loading,
      engineers,
      selectedEngineer,
      areaEngineers: mapData,
      availableSubmit,
      search,
    },
    handlers: {
      submit,
      close,
      open,
      toggleEngineerArea,
      setSearch,
    },
  };
}
