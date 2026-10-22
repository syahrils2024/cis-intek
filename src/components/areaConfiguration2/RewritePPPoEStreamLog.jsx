import { Stack } from '@mui/material';

/**
 * This component is responsible for rendering the PPPoE stream log in the area configuration section. It takes an array of log messages as a prop and displays them in a styled format. The text color of each log message is determined based on whether it contains the word "Error". If it does, the text will be red; otherwise, it will be gray.
 * @param {object} param0
 * @param {string[]} param0.logs - An array of log messages to be displayed in the stream log component.
 */
function RewritePPPoEStreamLog({ logs }) {
  const textColor = (log) => {
    if (log.includes('Error')) return 'tw-text-red-500';
    return 'tw-text-gray-700';
  };

  if (!logs || logs.length === 0) {
    return (
      <Stack>
        <p className="tw-text-xs tw-text-gray-500 tw-italic">Waiting for logs...</p>
      </Stack>
    );
  }

  return (
    <Stack>
      {logs.map((log, index) => (
        <p key={index} className={`${textColor(log)} tw-text-xs`}>
          {log}
        </p>
      ))}
    </Stack>
  );
}
export default RewritePPPoEStreamLog;
