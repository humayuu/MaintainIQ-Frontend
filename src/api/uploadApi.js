import axiosClient from './axiosClient';

// Evidence media upload (Cloudinary via the backend).
//   POST /uploads         — authenticated (technician/admin maintenance evidence)
//   POST /public/uploads  — public, rate-limited (issue-report evidence)
//
// Both accept multipart/form-data with one or more `files` and respond with
// { data: { urls: [...] } }. We build a FormData and let axios set the correct
// multipart boundary (overriding the client's default JSON content type).

const buildForm = (files) => {
  const form = new FormData();
  Array.from(files).forEach((file) => form.append('files', file));
  return form;
};

const uploadApi = {
  upload: (files) =>
    axiosClient.post('/uploads', buildForm(files), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadPublic: (files) =>
    axiosClient.post('/public/uploads', buildForm(files), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default uploadApi;
