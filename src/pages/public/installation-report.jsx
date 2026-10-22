import { toast } from 'sonner';
import { useParams } from 'react-router';
import { useRef, useState, useEffect } from 'react';
import { ViewerImageDialog } from '@components/viewerImageDialog';

import { summaryRepository } from 'src/repositories';

/**
 * @typedef {import('@/repositories/summary').PublicSummaryInstallationReport} PublicSummaryInstallationReport
 */

export default function InstallationReportSummary() {
  const params = useParams();
  const viewerImageDialogRef = useRef();

  /**
   * @type {[PublicSummaryInstallationReport, (d: PublicSummaryInstallationReport) => void]}
   */
  const [data, setData] = useState(null);

  async function prefetch() {
    try {
      const snapshot = await summaryRepository.getInstallationReport(params.id);
      setData(snapshot);
    } catch (error) {
      toast.error('Gagal menampilkan data');
    }
  }

  useEffect(() => {
    prefetch();
  }, []);

  function showImage(url, title) {
    url = url.replaceAll('/public/uploads', '');
    viewerImageDialogRef.current.showImage([url], title);
  }

  return (
    <>
      <div className="tw-w-full tw-bg-slate-200 tw-min-h-[100svh] tw-p-5">
        <div className="tw-w-full tw-max-w-xl tw-mx-auto tw-bg-white tw-p-5 tw-min-h-[100svh] tw-shadow-md tw-rounded-lg">
          <h1 className="tw-font-medium md:tw-text-lg">Laporan Instalasi #{params.id}</h1>
          <div className="tw-flex tw-flex-col tw-mt-4 tw-gap-4">
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">Upload By</span>
              <span className="tw-text-xs tw-font-medium tw-text-black">
                {data?.engineerFullname ?? '-'}
              </span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs tw-text-gray-500">Pelanggan</span>
              <span className="tw-text-xs tw-font-medium tw-text-black">
                {data?.customerFullname ?? '-'}
              </span>
            </div>
            {/* Photo */}
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-5">
              <div className="tw-flex tw-flex-col tw-gap-2">
                <span className="tw-text-xs tw-text-gray-500">Hasil Foto OPM</span>
                {data?.OPMResultPhoto ? (
                  <button
                    type="button"
                    onClick={() => showImage(data.OPMResultPhoto, 'Hasil Foto OPM')}
                  >
                    <img
                      src={`/public/uploads/${data.OPMResultPhoto.replaceAll('/public/uploads', '')}`}
                      alt="Hasil Foto OPM"
                      className="tw-w-full tw-object-cover tw-object-center tw-rounded-lg tw-aspect-square"
                    />
                  </button>
                ) : (
                  <span className="tw-text-xs tw-font-medium tw-text-gray-500">
                    Tidak di Upload
                  </span>
                )}
              </div>
              <div className="tw-flex tw-flex-col tw-gap-2">
                <span className="tw-text-xs tw-text-gray-500">Foto Instalasi Modem</span>
                {data?.installedModemPhoto ? (
                  <button
                    type="button"
                    onClick={() => showImage(data.installedModemPhoto, 'Foto Instalasi Modem')}
                  >
                    <img
                      src={`/public/uploads/${data.installedModemPhoto.replaceAll('/public/uploads', '')}`}
                      alt="Hasil Foto OPM"
                      className="tw-w-full tw-object-cover tw-object-center tw-rounded-lg tw-aspect-square"
                    />
                  </button>
                ) : (
                  <span className="tw-text-xs tw-font-medium tw-text-gray-500">
                    Tidak di Upload
                  </span>
                )}
              </div>
              <div className="tw-flex tw-flex-col tw-gap-2">
                <span className="tw-text-xs tw-text-gray-500">Foto SN Modem/ONU</span>
                {data?.modemSerialNumberPhoto ? (
                  <button
                    type="button"
                    onClick={() => showImage(data.modemSerialNumberPhoto, 'Foto SN Modem/ONU')}
                  >
                    <img
                      src={`/public/uploads/${data.modemSerialNumberPhoto.replaceAll('/public/uploads', '')}`}
                      alt="Foto SN"
                      className="tw-w-full tw-object-cover tw-object-center tw-rounded-lg tw-aspect-square"
                    />
                    <span className="tw-text-xs tw-font-medium tw-text-gray-500">
                      {data?.customerRouterSerialNumber}
                    </span>
                  </button>
                ) : (
                  <span className="tw-text-xs tw-font-medium tw-text-gray-500">
                    Tidak di Upload
                  </span>
                )}
              </div>
              <div className="tw-flex tw-flex-col tw-gap-2">
                <span className="tw-text-xs tw-text-gray-500">Foto Rumah Pelanggan</span>
                {data?.clientHousePhoto ? (
                  <button
                    type="button"
                    onClick={() => showImage(data.clientHousePhoto, 'Foto Rumah Pelanggan')}
                  >
                    <img
                      src={`/public/uploads/${data.clientHousePhoto.replaceAll('/public/uploads', '')}`}
                      alt="Client House"
                      className="tw-w-full tw-object-cover tw-object-center tw-rounded-lg tw-aspect-square"
                    />
                  </button>
                ) : (
                  <span className="tw-text-xs tw-font-medium tw-text-gray-500">
                    Tidak di Upload
                  </span>
                )}
              </div>
            </div>
            {/* Usage Resources */}
            <h2 className="tw-text-sm tw-font-semibold tw-mt-4">Penggunaan Stok</h2>
            <div className="tw-flex tw-flex-col tw-pl-6">
              <ul className="tw-list-disc">
                {data?.resources.map((resource, i) => (
                  <li className="tw-text-xs tw-list-item tw-mt-1" key={i}>
                    {resource.name} - {resource.amount} {resource.unitType}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <ViewerImageDialog ref={viewerImageDialogRef} />
    </>
  );
}
