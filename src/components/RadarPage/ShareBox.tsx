import React, { useCallback } from 'react';
import { Box, Button, TextField, Paper, Typography } from '@material-ui/core';

export interface ShareBoxProps {
  url: string;
}

export const ShareBox: React.FC<ShareBoxProps> = ({ url }) => {
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(url);
  }, [url]);

  return (
    <Paper style={{ padding: 16, marginTop: 16 }}>
      <Typography variant="subtitle2" gutterBottom>
        Share this chart
      </Typography>
      <Box display="flex" marginTop={1}>
        <TextField
          fullWidth
          size="small"
          value={url}
          variant="outlined"
          InputProps={{ readOnly: true }}
          onClick={e => (e.currentTarget.parentElement as HTMLInputElement)?.select?.()}
          style={{ marginRight: 8 }}
        />
        <Button variant="contained" color="primary" onClick={copyToClipboard} style={{ whiteSpace: 'nowrap' }}>
          Copy
        </Button>
      </Box>
    </Paper>
  );
};
