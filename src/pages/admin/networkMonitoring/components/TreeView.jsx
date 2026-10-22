import ReactECharts from 'echarts-for-react';
import { Iconify } from '@components/iconify';
import { useRef, useEffect, useCallback } from 'react';

import { Box, useTheme, IconButton, useMediaQuery } from '@mui/material';

/**
 * @typedef {import('../networkMonitoringHelper').NetworkMonitoringTreeNode} NetworkMonitoringTreeNode
 * @typedef {import('src/repositories/networkMonitoring').NetworkMonitoringDevice} NetworkMonitoringDevice
 */

import {
  NETMON_NODE_LABEL_RICH,
  buildNetworkMonitoringTooltip,
  formatNetworkMonitoringNodeLabel,
  mapNetworkMonitoringTreeNodeToEChartsNode,
} from '../networkMonitoringHelper';

/**
 * @param {{
 * data: NetworkMonitoringTreeNode[],
 * height?: number|string,
 * canEdit?: boolean,
 * onEdit?: (node: NetworkMonitoringDevice) => void,
 * onDelete?: (node: { id: string }) => void,
 * onViewSla?: (node: { id: string }) => void,
 * onNodeExpand?: (nodeId: string) => void,
 * onNodeCollapse?: (nodeId: string) => void,
 * expandedNodeIds?: string[],
 * highlightedNodeId?: string|null
 * }} props
 */
export default function TreeView({
  data,
  height = 600,
  canEdit = false,
  onEdit,
  onDelete,
  onViewSla,
  onNodeExpand,
  onNodeCollapse,
  expandedNodeIds = [],
  highlightedNodeId = null,
}) {
  const echartsRef = useRef(null);
  const transformStateRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    window.__nmEdit = (id, name, ip, lastStatus, lastPingedAt) => {
      onEdit?.({ id, name, ip_address: ip, last_status: lastStatus, last_pinged_at: lastPingedAt });
    };
    window.__nmDelete = (id) => {
      onDelete?.({ id });
    };
    window.__nmSla = (id) => {
      onViewSla?.({ id });
    };
    return () => {
      delete window.__nmEdit;
      delete window.__nmDelete;
      delete window.__nmSla;
    };
  }, [onEdit, onDelete, onViewSla]);

  // Save transform state before data updates and restore after
  useEffect(() => {
    const echartsInstance = echartsRef.current?.getEchartsInstance?.();
    if (!echartsInstance) return;

    // Save current transform state
    const canvasElement = echartsInstance.getDom();
    if (canvasElement && echartsInstance.getZr?.()) {
      const zr = echartsInstance.getZr();
      const transform = zr.painter.getViewportTransform?.();
      if (transform) {
        transformStateRef.current = transform;
      }
    }

    // Restore transform after a small delay to let ECharts finish rendering
    const timer = setTimeout(() => {
      if (transformStateRef.current && echartsInstance.getZr?.()) {
        try {
          const zr = echartsInstance.getZr();
          zr.painter.setViewportTransform?.(transformStateRef.current);
          echartsInstance.resize();
        } catch (err) {
          console.warn('Could not restore transform state:', err);
        }
      }
    }, 100);

    clearTimeout(timer);
  }, [data]);

  const series = data.map((node) => mapNetworkMonitoringTreeNodeToEChartsNode(node, highlightedNodeId));

  /** @type {import('echarts').EChartsOption} */
  const option = {
    tooltip: {
      trigger: 'item',
      enterable: true,
      position: isMobile ? 'bottom' : 'left',
      z: 10,
      zlevel: 10,
      formatter: (params) => {
        const { data: _data } = params;
        return buildNetworkMonitoringTooltip(_data, canEdit);
      },
    },
    series: [
      {
        type: 'tree',
        data: series,
        top: '10%',
        left: isMobile ? '1%' : '5%',
        bottom: '5%',
        right: isMobile ? '5%' : '15%',
        symbolSize: 10,
        orient: 'LR',
        edgeShape: 'polyline',
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 12,
          formatter: formatNetworkMonitoringNodeLabel,
          rich: NETMON_NODE_LABEL_RICH,
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left',
            formatter: formatNetworkMonitoringNodeLabel,
            rich: NETMON_NODE_LABEL_RICH,
          },
        },
        roam: true,
        scaleLimit: { min: 0.3, max: 5 },
        initialTreeDepth: -1,
        expandAndCollapse: false,
        animationDuration: 550,
        animationDurationUpdate: 750,
      },
    ],
  };

  const onEvents = {
    click: (params) => {
      const node = params.data;
      if (!node || !node.id) return;

      const isExpanded = expandedNodeIds.includes(node.id);

      if (isExpanded) {
        onNodeCollapse?.(node.id);
      } else {
        onNodeExpand?.(node.id);
      }
    },
  };

  const getZoom = useCallback(() => {
    const instance = echartsRef.current?.getEchartsInstance?.();
    if (!instance) return 1;

    const zoom = instance.getOption()?.series?.[0]?.zoom;
    return typeof zoom === 'number' ? zoom : 1;
  }, []);

  const handleZoomIn = useCallback(() => {
    const instance = echartsRef.current?.getEchartsInstance();
    if (!instance) return;
    const currentZoom = getZoom();
    const newZoom = Math.min(currentZoom * 1.5, 5);
    instance.setOption({ series: [{ zoom: newZoom }] }, false);
  }, [getZoom]);

  const handleZoomOut = useCallback(() => {
    const instance = echartsRef.current?.getEchartsInstance();
    if (!instance) return;
    const currentZoom = getZoom();
    const newZoom = Math.max(currentZoom / 1.5, 0.3);
    instance.setOption({ series: [{ zoom: newZoom }] }, false);
  }, [getZoom]);

  return (
    <Box sx={{ position: 'relative', px: isMobile ? 1 : 0 }}>
      <ReactECharts
        ref={echartsRef}
        option={option}
        style={{ height }}
        notMerge={false}
        lazyUpdate
        onEvents={onEvents}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 60,
          right: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={handleZoomIn}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Iconify icon="ic:baseline-zoom-in" />
        </IconButton>
        <IconButton
          onClick={handleZoomOut}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Iconify icon="ic:baseline-zoom-out" />
        </IconButton>
      </Box>
    </Box>
  );
}
