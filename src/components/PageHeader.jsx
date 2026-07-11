import { Box, Stack, Typography, Button } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

/**
 * Consistent page title block: optional "back" link, title, subtitle and a
 * right-aligned action slot. Used at the top of every internal page.
 */
export default function PageHeader({ title, subtitle, action, onBack, backLabel = 'Back', sx }) {
  return (
    <Box sx={{ mb: { xs: 2.5, md: 3.5 }, ...sx }}>
      {onBack && (
        <Button
          onClick={onBack}
          startIcon={<ArrowBackRoundedIcon />}
          size="small"
          color="inherit"
          sx={{ mb: 1.5, color: 'text.secondary', ml: -1 }}
        >
          {backLabel}
        </Button>
      )}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-end' }}
        spacing={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '1.875rem' } }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>
    </Box>
  );
}
