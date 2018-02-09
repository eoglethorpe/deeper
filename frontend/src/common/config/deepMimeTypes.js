export const galleryImageMimeType = ['image/png', 'image/jpeg', 'image/fig', 'image/gif'];

export const galleryDocsMimeType = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint', 'application/vnd.ms-excel', 'application/xml',
    'application/msword', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

export const galleryType = {
    IMAGE: 'image',
    DOC: 'doc',
    HTML: 'html',
};

export const galleryMapping = {};

galleryImageMimeType.forEach((type) => { galleryMapping[type] = galleryType.IMAGE; });
galleryDocsMimeType.forEach((type) => { galleryMapping[type] = galleryType.DOC; });
galleryMapping['text/html'] = galleryType.HTML;
