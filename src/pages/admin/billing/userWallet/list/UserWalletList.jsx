import { useEffect } from 'react';

import { useWalletState } from './userWallet.state';
import { UserWalletListData } from './components/Data';
import UserWalletLogDialog from './components/LogDialog';
import UserWithdrawConfirm from './components/WithdrawConfirm';

export default function UserWalletList() {
  const { state, handlers, ref } = useWalletState();

  useEffect(() => {
    handlers.load();
  }, []);

  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-px-5 tw-mt-4 tw-gap-4">
      <UserWalletListData
        items={state.data}
        onRefresh={handlers.refreshBalance}
        onLog={handlers.showLog}
        onWithdraw={handlers.withdraw}
      />
      <UserWalletLogDialog ref={ref.logDialogRef} />
      <UserWithdrawConfirm ref={ref.withdrawConfirmRef} />
    </div>
  );
}
