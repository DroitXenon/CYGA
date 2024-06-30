import React from 'react';
import { Box, Button, List, ListItem, ListItemText, ListItemIcon, Checkbox, Paper } from '@mui/material';

function TransferList({ options, selectedOptions, setSelectedOptions }) {
  const handleToggle = (value) => () => {
    const currentIndex = selectedOptions.indexOf(value);
    const newSelected = [...selectedOptions];

    if (currentIndex === -1) {
      newSelected.push(value);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedOptions(newSelected);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Paper sx={{ width: 200, height: 230, overflow: 'auto' }}>
        <List dense component="div" role="list">
          {options.map((value) => {
            const labelId = `transfer-list-item-${value}-label`;

            return (
              <ListItem key={value} role="listitem" button onClick={handleToggle(value)}>
                <ListItemIcon>
                  <Checkbox
                    checked={selectedOptions.indexOf(value) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={value} />
              </ListItem>
            );
          })}
          <ListItem />
        </List>
      </Paper>
    </Box>
  );
}

export default TransferList;