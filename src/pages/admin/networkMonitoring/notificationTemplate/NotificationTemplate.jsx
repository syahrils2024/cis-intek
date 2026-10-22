import Overloading from '@components/overloading';

import TemplateTable from './components/TemplateTable';
import TemplateToolbar from './components/TemplateToolbar';
import TemplateFormDialog from './components/TemplateFormDialog';
import { useNotificationTemplateState } from './notificationTemplate.state';

export default function NotificationTemplate() {
  const {
    state: {
      filteredTemplates,
      search,
      orderBy,
      order,
      loading,
      showForm,
      selectedTemplate,
    },
    handlers,
  } = useNotificationTemplateState();

  return (
    <>
      <div className="tw-w-full tw-mx-auto tw-p-5">
        <TemplateToolbar
          search={search}
          onSearchChange={handlers.setSearch}
          onAdd={handlers.onAdd}
        />

        <div className="tw-w-full tw-relative tw-flex tw-flex-col tw-gap-2 tw-mt-4">
          <Overloading loading={loading.value} />
          <TemplateTable
            templates={filteredTemplates}
            orderBy={orderBy}
            order={order}
            onSort={handlers.sort}
            onEdit={handlers.onEdit}
            onDelete={handlers.onDelete}
          />
        </div>
      </div>
      <TemplateFormDialog
        open={showForm}
        onClose={handlers.onClose}
        selectedTemplate={selectedTemplate}
        onSubmit={handlers.onSubmitForm}
        loading={loading.value}
      />
    </>
  );
}
