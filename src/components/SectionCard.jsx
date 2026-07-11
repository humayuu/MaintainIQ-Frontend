import { Card, CardHeader, CardContent, Box, Avatar } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * A titled content card with consistent header styling. `icon` renders a
 * tinted badge; `action` sits on the right of the header.
 */
export default function SectionCard({
  title,
  subheader,
  icon: Icon,
  iconColor = 'primary',
  action,
  disableContentPadding = false,
  children,
  sx,
}) {
  return (
    <Card sx={{ height: '100%', ...sx }}>
      {(title || action) && (
        <CardHeader
          avatar={
            Icon ? (
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: (t) => alpha(t.palette[iconColor].main, 0.12),
                  color: `${iconColor}.main`,
                  width: 38,
                  height: 38,
                }}
              >
                <Icon fontSize="small" />
              </Avatar>
            ) : undefined
          }
          title={title}
          subheader={subheader}
          action={action}
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        />
      )}
      {disableContentPadding ? (
        <Box>{children}</Box>
      ) : (
        <CardContent>{children}</CardContent>
      )}
    </Card>
  );
}
