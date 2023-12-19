const DEFAULT_MIMETYPE = {
    mimetype: "text/plain",
    media_type: "text",
    mime_subtype: "plain",
}

export function getMimeType(content_uri: string) {
    if ( !content_uri ) return null;
    if ( !content_uri.includes("data:") ) return null;
    if ( !content_uri.includes(",") ) return null;
    const [prefixData] = content_uri.split(",");
    const [_, mineData] = prefixData.split("data:");

    // undefined is a valid mimetype
    if ( mineData === undefined ) return DEFAULT_MIMETYPE

    const [mimeType, charset] = mineData.split(";");
    if ( !mimeType ) return DEFAULT_MIMETYPE;
    if ( !mimeType.includes("/") ) return DEFAULT_MIMETYPE;

    const [ media_type, mime_subtype]  = mimeType.split("/");
    return {
        mimetype: mimeType,
        media_type: media_type,
        mime_subtype: mime_subtype,
    }
}
