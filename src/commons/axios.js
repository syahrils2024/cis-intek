import a from 'axios';

const axios = a.create({ validateStatus: (n) => true });

export function interceptAxiosRequest(config) {
  const accessToken = localStorage.getItem('token') || '';
  config.headers.Authorization = `Bearer ${accessToken}`;
  const privilegeStorage = localStorage.getItem('privilege');

  /** @type {string[]} */
  const privileges = JSON.parse(privilegeStorage) || [];

  if (privileges.includes('admin')) {
    return config;
  }

  if (privileges.includes('marketing')) {
    config.url = config.url.replaceAll('/admin', '/marketing');
  } else if (privileges.includes('engineer')) {
    config.url = config.url.replaceAll('/admin', '/engineer');
  } else if (privileges.includes('network_operation_center')) {
    config.url = config.url.replaceAll('/admin', '/noc');
  }

  return config;
}

export function interceptAxiosResponse(response) {
  const currentRoute = window.location.pathname;
  const isPathLogin = currentRoute.includes('/login');
  try {
    /** @typedef {object} restResource
     * @property {boolean} success
     * @property {string} message
     * @name result
     * @type {restResource}
     */
    const result = response.data;
    const excludeValidateUrl = ['/api/ktp/ocr'];
    if (
      !result.success &&
      !!result.error &&
      !excludeValidateUrl.includes(response.config.url) &&
      response.headers['content-type']?.includes('application/json')
    ) {
      const isUnauthorized = response.status === 401;
      if (isUnauthorized && !isPathLogin) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(new Error('Unauthorized'));
      }
      throw new Error(result.error ?? result.message ?? `${response.statusText}`);
    }

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}

axios.interceptors.request.use(interceptAxiosRequest);

axios.interceptors.response.use(interceptAxiosResponse);

export default axios;
