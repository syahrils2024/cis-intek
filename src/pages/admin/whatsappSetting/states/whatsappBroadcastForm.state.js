import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { broadcastScheduleRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/broadcastSchedule').BroadcastScheduleRequest} BroadcastScheduleRequest
 */

/**
 * @typedef {Object} Rules
 * @property {string} areaTitle
 * @property {string} areaId
 * @property {string[]} billingStatus
 * @property {string} template
 * @property {boolean} sendInvoice
 * @property {boolean} sendSpecial
 */

export function useWhatsappBroadcastFormState() {
  const areaPickerRef = useRef();
  const [currentId, setCurrentId] = useState(null);
  const [date, setDate] = useState(20);
  const [title, setTitle] = useState('');
  const [messagePerSession, setMessagePerSession] = useState(5); // item message
  const [delayMessage, setDelayMessage] = useState(15); // Seconds
  const [delaySession, setDelaySession] = useState(10); // minutes
  const showDialog = useBoolean(false);
  const [whatsappNodes, setWhatsappNodes] = useState(['']);
  const loading = useBoolean(false);
  const loadingSubmit = useBoolean(false);

  /** @type {[Rules[], Function]} */
  const [rules, setRules] = useState([
    {
      areaTitle: '',
      areaId: '',
      billingStatus: [],
      template: '',
      sendInvoice: false,
      sendSpecial: false,
    },
  ]);

  /** Add Rules */
  function addRules() {
    setRules((prevRules) => [
      ...prevRules,
      {
        areaTitle: '',
        areaId: '',
        billingStatus: [],
        template: '',
        sendInvoice: false,
        sendSpecial: false,
      },
    ]);
  }

  /** Remove Rules */
  function removeRules(index) {
    setRules((prevRules) => prevRules.filter((_, i) => i !== index));
  }

  /**
   * update Rules state
   * @param {number} index
   * @param {Record<keyof Rules, any>} property
   */
  function updateRules(index, property) {
    const copyRules = rules[index];
    const result = Object.assign(copyRules, property);
    setRules((prevRules) => {
      const newRules = [...prevRules];
      newRules[index] = result;
      return newRules;
    });
  }

  /** Add Whatsapp Node */
  function addWhatsappNode() {
    setWhatsappNodes((prevNodes) => [...prevNodes, '']);
  }

  /** Update Whatsapp Node */
  function updateWhatsappNode(index, value) {
    setWhatsappNodes((prevNodes) => {
      const newNodes = [...prevNodes];
      newNodes[index] = value;
      return newNodes;
    });
  }

  /** Remove Whatsapp Node */
  function removeWhatsappNode(index) {
    setWhatsappNodes((prevNodes) => prevNodes.filter((_, i) => i !== index));
  }

  async function loadRules(id) {
    loading.onTrue();
    try {
      setCurrentId(id);
      const snapshot = await broadcastScheduleRepository.findOne(id);
      setDate(snapshot.date);
      setMessagePerSession(snapshot.messagePerSession);
      setDelayMessage(snapshot.delayMessage);
      setDelaySession(snapshot.delaySession);
      setTitle(snapshot.title);

      const whatsappNodeList = snapshot.whatsappNodes.map((node) => node._id);
      const snapshotRules = snapshot.rules.map((rule) => ({
        areaTitle: rule.areaTitle,
        areaId: rule.area_id,
        billingStatus: rule.billingStatus,
        template: rule.template_id,
        sendInvoice: rule.sendInvoice,
        sendSpecial: rule.sendSpecial,
      }));
      setWhatsappNodes(whatsappNodeList);
      setRules(snapshotRules);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal Memuat Data');
    } finally {
      loading.onFalse();
    }
  }

  /** Validate Form */
  function validate() {
    if (title.trim() === '') throw new Error('Title tidak boleh kosong');

    whatsappNodes.forEach((value, i) => {
      if (value === '') throw new Error(`Whatsapp Node ke-${i + 1} tidak boleh kosong`);
    });

    rules.forEach((rule, i) => {
      if (rule.areaId === '') throw new Error(`Area ke-${i + 1} tidak boleh kosong`);
      if (rule.template === '') throw new Error(`Template ke-${i + 1} tidak boleh kosong`);
      if (rule.billingStatus.length === 0)
        throw new Error(`Billing Status ke-${i + 1} tidak boleh kosong`);
    });
  }

  /** Submit Form */
  async function submit() {
    validate();
    /** @type {BroadcastScheduleRequest} */
    const data = {
      title,
      date,
      messagePerSession,
      delayMessage,
      delaySession,
      whatsappNodes,
      rules: rules.map((rule) => ({
        billingStatus: rule.billingStatus,
        sendInvoice: rule.sendInvoice,
        sendSpecial: rule.sendSpecial,
        template: rule.template,
        area: rule.areaId,
      })),
    };

    if (currentId) {
      return broadcastScheduleRepository.update(currentId, data);
    }
    return broadcastScheduleRepository.add(data);
  }

  /** Reset State */
  function resetForm() {
    setTitle('');
    setCurrentId(null);
    setDate(20);
    setMessagePerSession(10);
    setDelayMessage(15);
    setDelaySession(10);
    setWhatsappNodes(['']);
    setRules([
      {
        areaTitle: '',
        areaId: '',
        billingStatus: [],
        template: '',
        sendInvoice: false,
        sendSpecial: false,
      },
    ]);
  }

  return {
    date,
    setDate,
    messagePerSession,
    setMessagePerSession,
    delayMessage,
    setDelayMessage,
    delaySession,
    setDelaySession,
    showDialog,
    areaPickerRef,
    rules,
    addRules,
    removeRules,
    updateRules,
    whatsappNodes,
    addWhatsappNode,
    updateWhatsappNode,
    removeWhatsappNode,
    loading,
    submit,
    resetForm,
    loadRules,
    title,
    setTitle,
    loadingSubmit,
  };
}
