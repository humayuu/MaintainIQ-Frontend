import { Card, CardActionArea, Box, Stack, Typography, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * KPI tile: a colored icon badge, a large value and a label, with an optional
 * hint chip and click target. `color` is a palette key
 * (primary|secondary|success|warning|error|info).
 */
export default function StatCard({
  label,
  value,
  icon: Icon,
  color = 'primary',
  hint,
  onClick,
  loading = false,
}) {
  const body = (
    <Box sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.4 }}
        >
          {label}
        </Typography>
        {Icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              color: `${color}.main`,
              bgcolor: (t) => alpha(t.palette[color].main, 0.12),
            }}
          >
            <Icon fontSize="small" />
          </Box>
        )}
      </Stack>

      {loading ? (
        <Skeleton variant="text" width={72} height={48} sx={{ mt: 0.5 }} />
      ) : (
        <Typography
          sx={{ mt: 0.5, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}
        >
          {value}
        </Typography>
      )}

      {hint && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {hint}
        </Typography>
      )}
    </Box>
  );

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'box-shadow .2s, transform .2s, border-color .2s',
        ...(onClick && {
          '&:hover': { boxShadow: 4, transform: 'translateY(-2px)', borderColor: `${color}.light` },
        }),
      }}
    >
      {onClick ? (
        <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
          {body}
        </CardActionArea>
      ) : (
        body
      )}
    </Card>
  );
}
