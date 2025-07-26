const PORT = 8000;
const HOST_DOMAIN = '10.25.1.167';
const PROTOCOL = "http:";

// WITH PORT
export const API_BASE_URL = PROTOCOL+'//'+HOST_DOMAIN+':'+PORT+'/api';
export const API_BASE = PROTOCOL+'//'+HOST_DOMAIN+':'+PORT;
export const FILE_BASE_URL = API_BASE+'/storage';

// WITHOUT PORT
// export const API_BASE_URL = PROTOCOL+'//'+HOST_DOMAIN+'/api';
// export const API_BASE = PROTOCOL+'//'+HOST_DOMAIN
// export const FILE_BASE_URL = PROTOCOL+'//'+HOST_DOMAIN+'/storage';

export const ENABLE_DEBUG = true;
export const GOOGLE_CLIENT_ID = "51010046813-qes3dggin3pa5nhmdali9t8agvos4cmb.apps.googleusercontent.com";
export const SCHOOL_NAME = "SURIGAO DEL NORTE STATE UNIVERSITY";
export const SEMAPHORE_API_KEY="2db497e7dca562167ae58275bc4bf2c0"
export const SEMAPHORE_API_SENDER_NAME="DJEMC"
export const APP_NAME = "fbLMS";
export const TAGLINE = "Empowering Education, the SNSU Way."
export const SCHOOL_ID = 1;