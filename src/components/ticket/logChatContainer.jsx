import { TicketLogChatBubble } from './logChatBubble';

/**
 * Chat Component
 * @param {Object} param0
 * @param {import("src/repositories/customer").CustomerTicketLog[]} param0.items
 * @param {string} param0.selfUserId
 */
export function TicketLogChatContainer({ items, selfUserId }) {
  return (
    <div className="tw-w-full tw-flex tw-flex-col tw-gap-4 tw-h-96 tw-overflow-auto tw-bg-gray-100 tw-p-3">
      {items.map((item) => (
        <TicketLogChatBubble key={item.id} item={item} self={item.createdBy._id === selfUserId} />
      ))}
    </div>
  );
}
