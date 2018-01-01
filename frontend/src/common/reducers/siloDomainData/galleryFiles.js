import update from '../../../public/utils/immutable-update';

// TYPE

export const USER_GALLERY_FILES_SAVE = 'domain-data/USER/GALLERY_FILES';

// ACTION-CREATOR

export const setUserGalleryFilesAction = ({ galleryFiles }) => ({
    type: USER_GALLERY_FILES_SAVE,
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
    [USER_GALLERY_FILES_SAVE]: setUserGalleryFiles,
};
export default reducers;
