import { Table, TableRow, TableHead, TableCell, TableBody } from '@mui/material';

import WhatsappNodeTableRow from './WhatsappNodeTableRow';

export default function WhatsappNodeTable({ nodes, waStatus, handlers }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>No</TableCell>
          <TableCell>Online</TableCell>
          <TableCell>Title</TableCell>
          <TableCell>Nama Perangkat</TableCell>
          <TableCell>Phone</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Port</TableCell>
          <TableCell>Kategori</TableCell>
          <TableCell>Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {nodes.map((item, i) => (
          <WhatsappNodeTableRow
            key={i}
            item={item}
            index={i}
            waStatus={waStatus}
            onEdit={() => handlers.onEdit(item)}
            onDelete={() => handlers.onDelete(item)}
            onLogout={() => handlers.onLogout(item)}
            onScan={() => handlers.onScan(item)}
            onRestart={() => handlers.onRestart(item)}
            onUpdate={() => handlers.onUpdate(item)}
            onConsole={() => handlers.onConsole(item)}
            onSetOnline={(_, isOnline) => handlers.onChangeOnlineStatus(item, isOnline)}
            onClone={() => handlers.onClone(item)}
          />
        ))}
      </TableBody>
    </Table>
  );
}
