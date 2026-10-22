import { useState, useEffect } from 'react';
import { usePopover } from '@components/custom-popover/use-popover';
import { getIcons, getIconByName } from '@repositories/networkMonitoring';
import { CustomPopover } from '@components/custom-popover/custom-popover';

/**
 * @param {Object} props
 * @param {string} [props.iconName]
 * @param {function(string)} [props.onChangeIconName]
 */
export default function IconPicker({ iconName = 'circle-outline', onChangeIconName }) {
  const [icons, setIcons] = useState([]);
  const [previewMap, setPreviewMap] = useState({});
  const popover = usePopover();

  useEffect(() => {
    getIcons().then(setIcons);
  }, []);

  useEffect(() => {
    const fetchPreviews = async () => {
      if (!icons.length) return;

      const existingNames = icons.filter((icon) => !previewMap[icon.name]);
      if (!existingNames.length) return;

      const newPreviews = {};
      await Promise.all(
        existingNames.map(async (icon) => {
          const blob = await getIconByName(icon.name);
          newPreviews[icon.name] = URL.createObjectURL(blob);
        })
      );
      setPreviewMap((prev) => ({ ...prev, ...newPreviews }));
    };

    fetchPreviews();
  }, [icons]);

  return (
    <>
      <button
        type="button"
        onClick={popover.onOpen}
        className="tw-inline-flex tw-cursor-pointer tw-rounded-lg tw-items-center tw-justify-center tw-w-fit hover:tw-border-gray-400"
      >
        {iconName && previewMap[iconName] ? (
          <img src={previewMap[iconName]} alt={iconName} className="tw-w-7 tw-flex-none tw-aspect-square" />
        ) : (
          <span className="tw-text-gray-400 tw-text-sm">Pilih Icon</span>
        )}
      </button>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        anchorEl={popover.anchorEl}
        slotProps={{ arrow: { placement: 'bottom-center' } }}
      >
        <div className="tw-grid tw-grid-cols-6 tw-gap-2 tw-p-3" style={{ maxWidth: 320 }}>
          {icons.map((icon) => {
            const isSelected = icon.name === iconName;
            return (
              <button
                key={icon.name}
                type="button"
                onClick={() => {
                  onChangeIconName?.(icon.name);
                  popover.onClose();
                }}
                className={`tw-cursor-pointer tw-border-2 tw-rounded-lg tw-p-2 tw-flex tw-justify-center tw-items-center ${
                  isSelected ? 'tw-border-primary tw-bg-primary/10' : 'tw-border-gray-200'
                }`}
              >
                {previewMap[icon.name] ? (
                  <img src={previewMap[icon.name]} alt={icon.name} className="tw-w-10 tw-h-auto" />
                ) : (
                  <span className="tw-text-gray-400 tw-text-xs">...</span>
                )}
              </button>
            );
          })}
        </div>
      </CustomPopover>
    </>
  );
}
