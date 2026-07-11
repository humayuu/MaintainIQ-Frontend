import { Box, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';

const isVideoUrl = (url) => /\.(mp4|mov|webm|ogg|m4v|avi)(\?|$)/i.test(url);

/**
 * Read-only thumbnail row for stored evidence URLs. Each thumbnail links to the
 * full media in a new tab. Renders nothing when there is no evidence.
 */
export default function EvidenceGallery({ items = [], size = 64 }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {items.map((url, idx) => (
        <Box
          key={`${url}-${idx}`}
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            width: size,
            height: size,
            borderRadius: 1.5,
            overflow: 'hidden',
            display: 'block',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
          }}
        >
          {isVideoUrl(url) ? (
            <Box sx={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'primary.main' }}>
              <PlayCircleFilledRoundedIcon />
            </Box>
          ) : (
            <Box
              component="img"
              src={url}
              alt="evidence"
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
        </Box>
      ))}
    </Stack>
  );
}
