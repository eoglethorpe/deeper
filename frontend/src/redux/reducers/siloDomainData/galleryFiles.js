import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const GF__USER_GALLERY_FILES_SAVE = 'siloDomainData/USER_GALLERY_FILES_SAVE';

// ACTION-CREATOR

export const setUserGalleryFilesAction = ({ galleryFiles }) => ({
    type: GF__USER_GALLERY_FILES_SAVE,
    galleryFiles,
});

// REDUCER

const setUserGalleryFiles = (state, action) => {
    const {
        galleryFiles,
    } = action;

    const settings = {
        userGalleryFiles: { $autoArray: {
            $set: galleryFiles,
        } },
    };
    return update(state, settings);
};


// REDUCER MAP

const reducers = {
    [GF__USER_GALLERY_FILES_SAVE]: setUserGalleryFiles,
};
export default reducers;
