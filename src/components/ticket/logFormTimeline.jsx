import { Grid, Stack } from '@mui/material';
import {
  Timeline,
  TimelineDot,
  TimelineItem,
  TimelineContent,
  TimelineConnector,
  TimelineSeparator,
  TimelineOppositeContent,
} from '@mui/lab';

import 'src/extension/date';
import 'src/extension/string';

/**
 * TicketLogFormTimeline component
 * @param {object} param0
 * @param {import("src/repositories/customer").CustomerTicketLog[]} param0.items - Array of log items to display in the timeline
 * @param {object} param0.self - The current user's information, used to determine if a log item was created by the user
 * @param {function} param0.onViewImage - Callback function to handle image viewing
 */
export function TicketLogFormTimeline({ items = [], self = false, onViewImage }) {
  return (
    <Timeline position="alternate">
      {items.map((item, i) => (
        <TimelineItem key={i}>
          <TimelineOppositeContent color="GrayText">
            <Stack>
              <span className="tw-text-xs">{item.createdBy?.fullname}</span>
              <span className="tw-text-xs">
                {item.createdAt.toDate().format('dd MMM yyyy, HH:mm')}
              </span>
            </Stack>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="primary" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Stack spacing={1}>
              <span className="tw-text-xs tw-text-black tw-font-semibold">{item.description}</span>
              <span className="tw-text-xs tw-text-gray-500">{item.subtitle}</span>
              <Grid container>
                {item.photos.map((photo, j) => (
                  <Grid item xs={6} md={4} key={j}>
                    <button type="button" onClick={() => onViewImage([photo], item.description)}>
                      <img
                        alt={photo}
                        src={`/public/uploads/${photo}`}
                        className="tw-aspect-square tw-rounded-lg tw-object-cover tw-object-center"
                      />
                    </button>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
