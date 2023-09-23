import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import BLCSMap from 'components/BLCSMap';
import Link from 'src/Link';

export default function Index() {
  return (
    <Container maxWidth="md">
      <Typography variant='h4'>
        Barnsbury & Laycock Liveable Neighbourhood
      </Typography>
      <Typography variant='body1'>
        Council proposals. Learn more on <Link href="https://www.letstalk.islington.gov.uk/barnsbury-laycock-liveable-neighbourhood">their website</Link>.
      </Typography>
      <Box mt={3} xs={12} mb={3}>
        <BLCSMap />
      </Box>
    </Container>
  );
}
