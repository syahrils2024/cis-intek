import { toast } from 'sonner';
import { useState } from 'react';
import { BILL_URL } from '@commons/constant';
import { useBoolean } from '@hooks/use-boolean';

import { useTheme, useMediaQuery } from '@mui/material';

import { commonRepository } from 'src/repositories';

export function useCommonState() {
  const now = Date.now();
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [callCenter, setCallCenter] = useState('');
  const [defaultPayment, setDefaultPayment] = useState('');
  const [forceAppUpdate, setForceAppUpdate] = useState(false);
  const loading = useBoolean(false);
  const loadingSubmit = useBoolean(false);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [placeholder, setPlaceholder] = useState(
    `${BILL_URL}/public/uploads/app-logo.png?q=${now}`
  ); // Unused but kept for future use

  const [paymentList] = useState([
    { label: 'MANUAL / MUTASI BANK', value: 'MANUAL' },
    { label: 'DUITKU', value: 'DUITKU' },
  ]);

  async function fetchCommons() {
    loading.onTrue();
    try {
      const response = await commonRepository.getCommons();
      setWhatsapp(response.whatsapp);
      setCallCenter(response.callCenter);
      setCompanyEmail(response.companyEmail);
      setCompanyPhone(response.companyPhone);
      setDefaultPayment(response.defaultPayment);
      setForceAppUpdate(response.forceAppUpdate);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function changeAppImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        uploadImage(file);
      }
    };

    input.click();
    input.remove();
  }

  function uploadImage(file) {
    const base64Image = new FileReader();
    base64Image.onload = (c) => {
      setPlaceholder(c.target.result);
    };
    base64Image.readAsDataURL(file);

    const promises = commonRepository.updateAppLogo(file);
    toast.promise(promises, {
      error: (error) => {
        setPlaceholder(`${BILL_URL}/public/uploads/app-logo.png?q=${Date.now()}`);
        return error.message;
      },
      loading: 'Mengupload Logo...',
      success: 'Gambar berhasil diupload',
    });
  }

  async function save() {
    loadingSubmit.onTrue();
    const response = commonRepository.updateCommons({
      whatsapp,
      callCenter,
      companyEmail,
      companyPhone,
      defaultPayment,
      forceAppUpdate: forceAppUpdate.toString(),
    });
    toast.promise(response, {
      error: (error) => error.message,
      loading: 'Menyimpan data...',
      success: 'Data berhasil disimpan',
      finally: () => {
        loadingSubmit.onFalse();
        setTimeout(() => {
          toast.dismiss();
        }, 4000);
      },
    });
  }

  return {
    loading,
    mobile,
    whatsapp,
    setWhatsapp,
    callCenter,
    setCallCenter,
    companyEmail,
    companyPhone,
    setCompanyEmail,
    setCompanyPhone,
    fetchCommons,
    save,
    loadingSubmit,
    defaultPayment,
    setDefaultPayment,
    paymentList,
    forceAppUpdate,
    setForceAppUpdate,
    placeholder,
    changeAppImage,
  };
}
