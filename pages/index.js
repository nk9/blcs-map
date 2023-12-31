import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import BLCSMap from 'components/BLCSMap';
import Link from 'src/Link';
import Head from 'next/head';

export default function Index() {
  return (
    <>
      <Head>
        <title>Phase 1 — Barnsbury & Laycock</title>
      </Head>
      <Container maxWidth="md" disableGutters={true}>
        <Box xs={12}>
          <BLCSMap />
        </Box>
      </Container>
    </>
  );
}
