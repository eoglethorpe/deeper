const emptyList = [];
// Gallery Files

// eslint-disable-next-line import/prefer-default-export
export const userGalleryFilesSelector = ({ siloDomainData }) => (
    siloDomainData.userGalleryFiles || emptyList
);
