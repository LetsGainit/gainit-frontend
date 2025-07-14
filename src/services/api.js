import axios from 'axios';

const api = axios.create({
  baseURL: 'https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/api',
});

export default api;
