/**
 * @typedef {import("@/stores/areaConfiguration").AreaConfigurationStore} AreaConfigurationStore
 * @typedef {import("@/repositories/area").AreaCategory} AreaCategory
 * @typedef {import("@/repositories/area").Area} Area
 * @typedef {import("@/repositories/customer").Customer} Customer
 * @typedef {import("@/repositories/area").Odp} Odp
 */

import { areaRepository } from '@repositories';
import { useBoolean } from '@hooks/use-boolean';
import { createSelector } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import {
  Button,
  Dialog,
  useTheme,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import {
  setPage,
  appendODP,
  setCustomers,
  setNestedArea,
  setTotalItems,
  setSelectedOdp,
  setSelectedArea,
  appendAreaLevel1,
  appendAreaLevel2,
} from 'src/stores/areaConfiguration';

import AreaConfigurationSidePicker from './areaConfiguration/AreaPicker';

/**
 *
 * @param {{
 * show: boolean,
 * onClose: void
 * }} props
 */
export default function AreaConfigurationFilterDialog({ show, onClose }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const loading = useBoolean(false);

  const filterSelector = createSelector(
    [(state) => state.areaConfigurationStore],
    (areaConfigurationStore) => {
      /** @type {AreaConfigurationStore} */
      const { currentArea, currentOdp, customers, nestedArea, limit, page } =
        areaConfigurationStore;
      return { currentArea, currentOdp, customers, nestedArea, limit, page };
    }
  );

  /**
   * @type {AreaConfigurationStore}
   */
  const { nestedArea, currentArea, currentOdp, customers, limit, page } =
    useSelector(filterSelector);

  const prefetch = async () => {
    dispatch(setSelectedArea(null));
    dispatch(setSelectedOdp(null));
    const snapshot = await areaRepository.getAreaById();
    dispatch(setNestedArea(snapshot));
  };

  /**
   * @param {number} grandParentIndex
   * @param {AreaCategory} item
   */
  const getAndAppendAreaLevel1 = async (grandParentIndex, item) => {
    dispatch(setSelectedArea(item));
    dispatch(setSelectedOdp(null));
    if (nestedArea[grandParentIndex].areaCategoryChildren?.length >= 1) return;
    const snapshot = await areaRepository.getAreaById(item.id);
    dispatch(
      appendAreaLevel1({
        index: grandParentIndex,
        data: snapshot,
      })
    );
  };

  /**
   * @param {number} grandParentIndex
   * @param {number} parentIndex
   * @param {AreaCategory} item
   */
  const getAndAppendAreaLevel2 = async (grandParentIndex, parentIndex, item) => {
    dispatch(setSelectedArea(item));
    dispatch(setSelectedOdp(null));
    if (
      nestedArea[grandParentIndex].areaCategoryChildren[parentIndex].areaCategoryChildren?.length >=
      1
    )
      return;
    const snapshot = await areaRepository.getAreaById(item.id);
    dispatch(
      appendAreaLevel2({
        parentIndex: grandParentIndex,
        index: parentIndex,
        data: snapshot,
      })
    );
  };
  /**
   * @param {number} grandParentIndex
   * @param {number} parentIndex
   * @param {number} childrenIndex
   * @param {AreaCategory} item
   */
  const getAndAppendOdp = async (grandParentIndex, parentIndex, childrenIndex, item) => {
    dispatch(setSelectedArea(item));
    dispatch(setSelectedOdp(null));
    if (
      nestedArea[grandParentIndex].areaCategoryChildren[parentIndex].areaCategoryChildren[
        childrenIndex
      ].areaCategoryChildren?.length >= 1
    )
      return;
    const snapshot = await areaRepository.getAreaById(item.id);
    const nestedOdp = await Promise.all(
      snapshot.map(async (s) => {
        const snapshotOdp = await areaRepository.getOdpList(s.id);
        s.odpChildren = snapshotOdp;
        return s;
      })
    );

    dispatch(
      appendODP({
        index: childrenIndex,
        parentIndex,
        grandParentIndex,
        data: nestedOdp,
      })
    );
  };

  // useEffect(() => {
  //   if (nestedArea.length >= 1) return;
  //   prefetch();
  // }, []);

  /**
   * @param {AreaCategory} area
   * @param {Odp} odp
   */
  const selectOdp = (area, odp) => {
    dispatch(setSelectedArea(area));
    dispatch(setSelectedOdp(odp));
  };

  const fetchCustomerData = async () => {
    dispatch(setPage(0));
    loading.onTrue();
    if (currentOdp != null) {
      const snapshot = await areaRepository.getCustomerAreaWithODP(currentArea.id, currentOdp._id, {
        page,
        limit,
        status: 'active',
      });
      // console.log(snapshot);
      dispatch(setTotalItems(snapshot.total));
      dispatch(setCustomers(snapshot.customers));
    } else {
      const snapshot = await areaRepository.getCustomerArea(currentArea.id, {
        page,
        limit,
        status: 'active',
      });
      dispatch(setTotalItems(snapshot.total));
      dispatch(setCustomers(snapshot.customers));
    }
    loading.onFalse();
    onClose();
  };

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Filter Daftar Area</DialogTitle>
      <DialogContent>
        <AreaConfigurationSidePicker />
        {/* <SimpleTreeView>
          {nestedArea.map((grandParent, grandParentIndex) => (
            <TreeItem
              onClick={() => getAndAppendAreaLevel1(grandParentIndex, grandParent)}
              itemId={`${grandParentIndex}-${grandParent.title}`}
              key={grandParentIndex}
              label={grandParent.title}
            >
              {grandParent.areaCategoryChildren?.length >= 1 &&
                grandParent.areaCategoryChildren.map((parent, parentIndex) => (
                  <TreeItem
                    onClick={() => getAndAppendAreaLevel2(grandParentIndex, parentIndex, parent)}
                    itemId={`${parentIndex}-${parent.title}`}
                    key={parentIndex}
                    label={parent.title}
                  >
                    {parent.areaCategoryChildren?.length >= 1 &&
                      parent.areaCategoryChildren.map((children, childrenIndex) => (
                        <TreeItem
                          onClick={() =>
                            getAndAppendOdp(grandParentIndex, parentIndex, childrenIndex, children)
                          }
                          itemId={`${childrenIndex}-${children.title}`}
                          key={childrenIndex}
                          label={children.title}
                        >
                          {children.areaCategoryChildren?.map((odpParent, odpParentIndex) => (
                            <TreeItem
                              itemId={`${odpParentIndex}-${odpParent.title}`}
                              key={odpParentIndex}
                              label={odpParent.title}
                            >
                              {odpParent.odpChildren?.map((odp, odpIndex) => (
                                <TreeItem
                                  onClick={() => selectOdp(odpParent, odp)}
                                  itemId={`${odpIndex}-${odp.name}`}
                                  key={odpIndex}
                                  label={odp.name}
                                />
                              ))}
                            </TreeItem>
                          ))}
                        </TreeItem>
                      ))}
                  </TreeItem>
                ))}
            </TreeItem>
          ))}
        </SimpleTreeView> */}
      </DialogContent>
      <DialogActions>
        <Button disable={loading} color="error" onClick={onClose}>
          Tutup
        </Button>
        {/* <Button color="warning" onClick={prefetch} variant="contained">
          Reset
        </Button>
        <Button
          disabled={!currentOdp && !currentArea}
          color="primary"
          variant="contained"
          onClick={fetchCustomerData}
          loading={loading}
        >
          Pilih
        </Button> */}
      </DialogActions>
    </Dialog>
  );
}

/**
 * @param {{areaConfiguration: AreaConfigurationStore}} state
 */
// const mapStateToProps = (state) => {
//   console.log({ state });
//   const { areaConfiguration } = state;
//   const { nestedArea, currentArea, currentOdp, customers } = areaConfiguration;
//   return { nestedArea, currentArea, currentOdp, customers };
// };

// export default connect(mapStateToProps)(AreaConfigurationFilterDialog);
