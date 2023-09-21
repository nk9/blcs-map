import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import BLCSMap from 'components/BLCSMap';

export default function Index() {
  return (
    <Container maxWidth="sm">
      <Box mt={3} xs={12} mb={3}>
        <BLCSMap />
      </Box>
    </Container>
  );
}
