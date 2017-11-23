import {
    GET,
    POST,
    wsEndpoint,
    commonHeaderForPost,
} from '../config/rest';

export const urlForUpload = `${wsEndpoint}/files/`;
export const urlForGoogleDriveFileUpload = `${wsEndpoint}/files-google-drive/`;
export const urlForDropboxFileUpload = `${wsEndpoint}/files-dropbox/`;
export const createUrlForGalleryFile = fileId => `${wsEndpoint}/files/${fileId}/`;

export const createParamsForFileUpload = ({ access }) => ({
    headers: {
        Authorization: `Bearer ${access}`,
    },
});

export const createHeaderForGoogleDriveFileUpload = ({ access }, {
    title,
    accessToken,
    fileId,
    mimeType,
}) => ({
    method: POST,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify({
        title,
        accessToken,
        fileId,
        mimeType,
    }),
});


export const createHeaderForDropboxUpload = ({ access }, {
    title,
    fileUrl,
}) => ({
    method: POST,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify({
        title,
        fileUrl,
    }),
});

export const createHeaderForGalleryFile = ({ access }) => ({
    method: GET,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});
