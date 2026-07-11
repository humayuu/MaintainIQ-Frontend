import { useRef, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';

// A URL looks like a video if it carries a common video extension. Cloudinary
// image delivery URLs won't match, so everything else renders as an <img>.
const isVideoUrl = (url) => /\.(mp4|mov|webm|ogg|m4v|avi)(\?|$)/i.test(url);

/**
 * Editable evidence picker: upload images/videos, preview thumbnails, remove.
 *
 * @param {string[]}  value      current evidence URLs
 * @param {Function}  onChange   (nextUrls) => void
 * @param {Function}  uploadFn   (fileList) => Promise<axiosResponse> — resolves
 *                               to { data: { data: { urls } } }
 * @param {Function} [onError]   (message) => void — surfaces upload failures
 */
export default function EvidenceUploader({
  value = [],
  onChange,
  uploadFn,
  onError,
  disabled = false,
  label = 'Add photos / videos',
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // reset so the same file can be re-picked
    if (files.length === 0) return;

    setUploading(true);
    try {
      const { data } = await uploadFn(files);
      const urls = data?.data?.urls ?? [];
      onChange([...value, ...urls]);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Upload failed. Please try again.';
      onError?.(message);
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={handleFiles}
      />
      <Button
        variant="outlined"
        size="small"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        startIcon={
          uploading ? <CircularProgress size={16} color="inherit" /> : <PhotoCameraRoundedIcon />
        }
      >
        {uploading ? 'Uploading…' : label}
      </Button>

      {value.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
          {value.map((url, idx) => (
            <Box
              key={`${url}-${idx}`}
              sx={{
                position: 'relative',
                width: 72,
                height: 72,
                borderRadius: 1.5,
                overflow: 'hidden',
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
              <IconButton
                size="small"
                aria-label="remove"
                onClick={() => removeAt(idx)}
                disabled={disabled}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 20,
                  height: 20,
                  color: '#fff',
                  bgcolor: 'rgba(0,0,0,0.55)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                }}
              >
                <CloseRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}

      {value.length === 0 && !uploading && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
          Optional — attach photos or a short video of the problem.
        </Typography>
      )}
    </Box>
  );
}
