import { FAVICON_SERVICE_ENDPOINT } from "./constants"

export const getFaviconURL = (url: string) => {
    return FAVICON_SERVICE_ENDPOINT + url
}