import 'src/extension/string';
import 'src/extension/date';

/**
 *
 * @param {Object} param0
 * @param {import("./logChat.state").CustomerTicketLog} param0.item
 * @param {boolean} param0.self
 */
export function TicketLogChatBubble({ item, self }) {
  return (
    <div
      className={`tw-flex tw-flex-row ${self ? 'tw-justify-end' : 'tw-justify-start'} tw-w-full`}
    >
      <div className="tw-flex tw-items-start tw-gap-2.5">
        {self ? null : (
          <img className="tw-w-8 tw-h-8 tw-rounded-full" src="/assets/avatar-25.webp" alt="" />
        )}
        <div className="tw-flex tw-flex-col tw-w-full tw-leading-1.5 tw-px-4 tw-py-2 tw-bg-white tw-ring-1 tw-rounded-lg">
          <div className="tw-flex tw-items-center tw-space-x-1.5 rtl:tw-space-x-reverse">
            <span className="tw-text-xs tw-font-semibold">
              {item.createdBy.fullname}
            </span>
            <span className="tw-text-xs tw-text-body">
              {item.createdAt.toDate().format('HH:mm')}
            </span>
          </div>
          <p className="tw-text-sm tw-py-2.5 tw-text-body">{item.description}</p>
        </div>
        {self ? (
          <img className="tw-w-8 tw-h-8 tw-rounded-full" src="/assets/avatar-25.webp" alt="" />
        ) : null}
      </div>
    </div>
  );
}
