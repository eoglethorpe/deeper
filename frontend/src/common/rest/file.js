import {
    GET,
    POST,
    wsEndpoint,
    commonHeaderForPost,
    authorizationHeaderForPost,
} from '../config/rest';

export const urlForUpload = `${wsEndpoint}/files/`;
export const urlForUsersGalleryFiles = `${wsEndpoint}/files/`;
export const urlForGoogleDriveFileUpload = `${wsEndpoint}/files-google-drive/`;
export const urlForDropboxFileUpload = `${wsEndpoint}/files-dropbox/`;
export const createUrlForGalleryFile = fileId => `${wsEndpoint}/files/${fileId}/`;

export const createParamsForFileUpload = () => ({
    headers: authorizationHeaderForPost,
});

export const createHeaderForGoogleDriveFileUpload = ({
    title,
    accessToken,
    fileId,
    mimeType,
}) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        title,
        accessToken,
        fileId,
        mimeType,
    }),
});


export const createHeaderForDropboxUpload = ({ title, fileUrl }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        title,
        fileUrl,
    }),
});

export const createHeaderForGalleryFile = () => ({
    method: GET,
    headers: commonHeaderForPost,
});

export const createUrlForSimplifiedFilePreview = fileId => (
    `${wsEndpoint}/file-previews/${fileId}/`
);

export const urlForFileExtractionTrigger = `${wsEndpoint}/file-extraction-trigger/`;

export const createParamsForFileExtractionTrigger = fileIds => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        fileIds,
    }),
});
