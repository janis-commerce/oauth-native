const entries = {};

export default {
  setGenericPassword: jest.fn(async (username, password, {service}) => {
    entries[service] = {service, username, password};
    return {service, storage: 'KeystoreAESGCM_NoAuth'};
  }),
  getGenericPassword: jest.fn(async ({service}) => entries[service] || false),
  resetGenericPassword: jest.fn(async ({service}) => {
    delete entries[service];
    return true;
  }),
};
