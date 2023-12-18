export function getMimeType(content_uri: string) {
    const [mineData] = content_uri.split(",");
    const mimeType = mineData.split("data:")[1] || 'text/plain';
    const media_type = mimeType?.split("/")[0] || 'text';
    const mime_subtype = mimeType?.split("/")[1] || 'plain';
    return {
        mimetype: mimeType,
        media_type: media_type,
        mime_subtype: mime_subtype,
    }
}
