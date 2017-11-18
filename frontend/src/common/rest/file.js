import { wsEndpoint } from '../config/rest';

export const urlForUpload = `${wsEndpoint}/files/`;
export const urlForGoogleDriveFileUpload = `${wsEndpoint}/files-google-drive/`;
export const urlForDropboxFileUpload = `${wsEndpoint}/files-dropbox/`;

export const createHeaderForFileUpload = ({ access }) => ({
    Authorization: `Bearer ${access}`,
});

export const createHeaderForGoogleDriveFileUpload = ({ access },
    { title, accessToken, fileId, mimeType }) => ({
    Authorization: `Bearer ${access}`,
    body: JSON.stringify({
        title,
        accessToken,
        fileId,
        mimeType,
    }),
});


export const createHeaderForDropboxUpload = ({ access },
    { title, fileUrl }) => ({
    Authorization: `Bearer ${access}`,
    body: JSON.stringify({
        title,
        fileUrl,
    }),
});

