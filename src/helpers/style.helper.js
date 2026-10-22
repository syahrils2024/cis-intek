export const datagridStyle = {
  verticalCenter: {
    '& .MuiDataGrid-cell': {
      display: 'flex',
      alignItems: 'center',
      py: 1,
    },
  },
  disabledHover: {
    '.MuiDataGrid-row': {
      // Optional: remove hover background color if desired
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  },
  disabledSelected: {
    '.MuiDataGrid-row.Mui-selected': {
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  },
};
