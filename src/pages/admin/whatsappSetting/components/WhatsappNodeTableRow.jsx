import { Chip, Switch, TableRow, TableCell } from '@mui/material';

import WhatsappNodeActions from './WhatsappNodeActions';
import WhatsappNodeStatusChip from './WhatsappNodeStatusChip';

export default function WhatsappNodeTableRow({
  item,
  index,
  waStatus,
  onEdit,
  onDelete,
  onLogout,
  onScan,
  onRestart,
  onUpdate,
  onConsole,
  onSetOnline,
  onClone,
}) {
  const getNodeStatus = () => {
    const statusData = waStatus.find((s) => s.nodeId === item._id);
    return statusData?.status || item.status;
  };

  return (
    <TableRow>
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <Switch checked={item.online} onChange={(e) => onSetOnline(item, !item.online)} />
      </TableCell>
      <TableCell>{item.title}</TableCell>
      <TableCell>{item.description}</TableCell>
      <TableCell>{item.phone}</TableCell>
      <TableCell>
        <WhatsappNodeStatusChip status={getNodeStatus()} />
      </TableCell>
      <TableCell>{item.port}</TableCell>
      <TableCell>
        <div className="tw-flex tw-flex-wrap tw-gap-1.5">
          {item.groups.map((group, gi) => (
            <Chip
              key={gi}
              size="small"
              className="tw-me-1"
              color="primary"
              label={group.name}
              variant="outlined"
            />
          ))}
        </div>
      </TableCell>
      <TableCell>
        <WhatsappNodeActions
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onLogout={onLogout}
          onScan={onScan}
          onRestart={onRestart}
          onUpdate={onUpdate}
          onConsole={onConsole}
          onClone={onClone}
        />
      </TableCell>
    </TableRow>
  );
}
